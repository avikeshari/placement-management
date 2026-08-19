const csv = require("csv-parser");
const { Readable } = require("stream");
const AcademicRecord = require("../models/AcademicRecord");
const User = require("../models/User");

exports.getMyAcademicRecord = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("email");
    const record = await AcademicRecord.findOne({
      studentEmail: user.email.toLowerCase()
    });

    return res.json({
      success: true,
      record: record || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const pick = (row, names) => {
  for (const name of names) {
    if (row[name] !== undefined && String(row[name]).trim() !== "") {
      return String(row[name]).trim();
    }
  }
  return "";
};

exports.importAcademicRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file"
      });
    }

    const rows = [];

    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv({
          mapHeaders: ({ header }) =>
            header.replace(/^\uFEFF/, "").trim()
        }))
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    let processed = 0;
    let updated = 0;
    let notFound = 0;
    let invalid = 0;
    const errors = [];

    for (const row of rows) {
      const studentEmail = pick(row, [
        "studentEmail", "email", "student_email"
      ]).toLowerCase();

      const enrollmentNumber = pick(row, [
        "enrollmentNumber", "enrollmentNo", "enrollment", "rollNumber", "rollNo"
      ]);

      const college = pick(row, ["college", "collegeName"]);
      const course = pick(row, ["course", "program", "degree"]);
      const branch = pick(row, ["branch", "department", "stream"]);
      const graduationYearValue = pick(row, [
        "graduationYear", "passingYear", "graduation_year"
      ]);
      const cgpaValue = pick(row, ["cgpa", "gpa"]);
      const backlogsValue = pick(row, ["backlogs", "backlog"]);

      if (!studentEmail) {
        invalid++;
        errors.push("Missing student email");
        continue;
      }

      const hasCgpa = cgpaValue !== "";
      const hasGraduationYear = graduationYearValue !== "";
      const hasBacklogs = backlogsValue !== "";

      const cgpa = hasCgpa ? Number(cgpaValue) : undefined;
      const graduationYear = hasGraduationYear
        ? Number(graduationYearValue)
        : undefined;
      const backlogs = hasBacklogs
        ? Number(backlogsValue)
        : 0;

      if (
        (hasCgpa && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) ||
        (hasGraduationYear && (!Number.isFinite(graduationYear) || !Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100)) ||
        (!Number.isFinite(backlogs) || backlogs < 0 || !Number.isInteger(backlogs))
      ) {
        invalid++;
        errors.push(`${studentEmail}: invalid academic values`);
        continue;
      }

      const user = await User.findOne({ email: studentEmail, role: "student" });
      if (!user) {
        notFound++;
        errors.push(`${studentEmail}: student account not found`);
        continue;
      }

      const recordUpdate = {
        studentEmail,
        enrollmentNumber,
        college,
        course,
        branch,
        backlogs
      };

      if (hasGraduationYear) {
        recordUpdate.graduationYear = graduationYear;
      }

      if (hasCgpa) {
        recordUpdate.cgpa = cgpa;
      }

      await AcademicRecord.findOneAndUpdate(
        { studentEmail },
        { $set: recordUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      processed++;
      updated++;
    }

    return res.json({
      success: true,
      message: "Student data imported successfully",
      summary: { total: rows.length, processed, updated, notFound, invalid },
      errors: errors.slice(0, 20)
    });
  } catch (error) {
    console.error("Academic import error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
