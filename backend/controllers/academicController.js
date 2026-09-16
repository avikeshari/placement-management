const csv = require("csv-parser");
const { Readable } = require("stream");
const mongoose = require("mongoose");
const AcademicRecord = require("../models/AcademicRecord");
const User = require("../models/User");

const MAX_ROWS = 2000;

exports.getMyAcademicRecord = async (req, res) => {
  try {
    const record = await AcademicRecord.findOne({ user: req.user._id });
    return res.json({ success: true, record: record || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load academic record" });
  }
};

const normalizeHeader = (header) =>
  String(header || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const pick = (row, names) => {
  for (const name of names) {
    const key = normalizeHeader(name);
    if (row[key] !== undefined && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
};

const parseRows = (buffer) => new Promise((resolve, reject) => {
  const rows = [];
  Readable.from(buffer)
    .pipe(csv({ mapHeaders: ({ header }) => normalizeHeader(header) }))
    .on("data", (row) => {
      if (rows.length < MAX_ROWS + 1) rows.push(row);
    })
    .on("end", () => resolve(rows))
    .on("error", reject);
});

exports.importAcademicRecords = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a CSV file" });
  }

  if (req.file.size > 2 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: "CSV file must be 2 MB or smaller" });
  }

  const session = await mongoose.startSession();

  try {
    const rows = await parseRows(req.file.buffer);
    if (!rows.length) return res.status(400).json({ success: false, message: "CSV file is empty" });
    if (rows.length > MAX_ROWS) {
      return res.status(400).json({ success: false, message: `CSV cannot contain more than ${MAX_ROWS} records` });
    }

    const prepared = [];
    const errors = [];
    const emailsInFile = new Set();
    const enrollmentInFile = new Set();

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 2;
      const studentEmail = pick(row, ["studentEmail", "email", "student_email"]).toLowerCase();
      const enrollmentNumber = pick(row, ["enrollmentNumber", "enrollmentNo", "enrollment", "rollNumber", "rollNo"]);
      const college = pick(row, ["college", "collegeName"]);
      const course = pick(row, ["course", "program", "degree"]);
      const branch = pick(row, ["branch", "department", "stream"]);
      const graduationYearValue = pick(row, ["graduationYear", "passingYear", "graduation_year"]);
      const cgpaValue = pick(row, ["cgpa", "gpa"]);
      const backlogsValue = pick(row, ["backlogs", "backlog"]);
      const skillsValue = pick(row, ["skills", "skill"]);

      if (!studentEmail || !/^\S+@\S+\.\S+$/.test(studentEmail)) {
        errors.push(`Row ${rowNumber}: valid student email is required`);
        continue;
      }
      if (emailsInFile.has(studentEmail)) {
        errors.push(`Row ${rowNumber}: duplicate student email in CSV`);
        continue;
      }
      emailsInFile.add(studentEmail);

      if (enrollmentNumber) {
        if (enrollmentInFile.has(enrollmentNumber)) {
          errors.push(`Row ${rowNumber}: duplicate enrollment number in CSV`);
          continue;
        }
        enrollmentInFile.add(enrollmentNumber);
      }

      const hasCgpa = cgpaValue !== "";
      const hasGraduationYear = graduationYearValue !== "";
      const hasBacklogs = backlogsValue !== "";
      const cgpa = hasCgpa ? Number(cgpaValue) : undefined;
      const graduationYear = hasGraduationYear ? Number(graduationYearValue) : undefined;
      const backlogs = hasBacklogs ? Number(backlogsValue) : 0;
      const skills = [...new Set(skillsValue.split(",").map((item) => item.trim()).filter(Boolean))];

      if (hasCgpa && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) {
        errors.push(`Row ${rowNumber}: CGPA must be between 0 and 10`);
        continue;
      }
      if (hasGraduationYear && (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100)) {
        errors.push(`Row ${rowNumber}: invalid graduation year`);
        continue;
      }
      if (!Number.isInteger(backlogs) || backlogs < 0) {
        errors.push(`Row ${rowNumber}: backlogs must be a non-negative integer`);
        continue;
      }

      prepared.push({
        rowNumber,
        studentEmail,
        enrollmentNumber,
        college,
        course,
        branch,
        graduationYear,
        cgpa,
        backlogs,
        skills
      });
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "No records were imported because the CSV contains validation errors.",
        summary: { total: rows.length, processed: 0, invalid: errors.length },
        errors: errors.slice(0, 50)
      });
    }

    await session.withTransaction(async () => {
      for (const item of prepared) {
        const user = await User.findOne({ email: item.studentEmail, role: "student" }).session(session);
        if (!user) {
          const error = new Error(`Row ${item.rowNumber}: student account not found for ${item.studentEmail}`);
          error.statusCode = 400;
          throw error;
        }

        const record = {
          user: user._id,
          studentEmail: item.studentEmail,
          enrollmentNumber: item.enrollmentNumber,
          college: item.college,
          course: item.course,
          branch: item.branch,
          backlogs: item.backlogs,
          skills: item.skills,
          verified: true
        };
        if (item.graduationYear !== undefined) record.graduationYear = item.graduationYear;
        if (item.cgpa !== undefined) record.cgpa = item.cgpa;

        await AcademicRecord.findOneAndUpdate(
          { user: user._id },
          { $set: record },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, session }
        );
      }
    });

    return res.json({
      success: true,
      message: "Student data imported successfully. The batch was validated and committed atomically.",
      summary: { total: rows.length, processed: prepared.length, updated: prepared.length, invalid: 0 }
    });
  } catch (error) {
    console.error("Academic import error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Academic import failed. No partial records were committed."
    });
  } finally {
    await session.endSession();
  }
};
