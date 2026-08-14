const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    enrollmentNumber: String,
    college: String,
    course: String,
    branch: String,
    graduationYear: Number,
    cgpa: Number,
    backlogs: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);
