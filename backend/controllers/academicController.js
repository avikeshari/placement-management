const csv = require("csv-parser");
const { Readable } = require("stream");
const AcademicRecord = require("../models/AcademicRecord");

exports.importAcademicRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file"
      });
    }

    const records = [];

    Readable.from(req.file.buffer)
      .pipe(csv())
      .on("data", (row) => {
        records.push({
          studentEmail: row.studentEmail?.trim().toLowerCase(),
          enrollmentNumber: row.enrollmentNumber,
          college: row.college,
          course: row.course,
          branch: row.branch,
          graduationYear:
            Number(row.graduationYear) || undefined,
          cgpa: Number(row.cgpa) || undefined,
          backlogs: Number(row.backlogs) || 0
        });
      })
      .on("end", async () => {
        try {
          const validRecords = records.filter(
            (record) => record.studentEmail
          );

          if (!validRecords.length) {
            return res.status(400).json({
              success: false,
              message: "No valid records found"
            });
          }

          await AcademicRecord.insertMany(validRecords);

          res.status(201).json({
            success: true,
            message:
              `${validRecords.length} academic records imported`,
            imported: validRecords.length
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message
          });
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
