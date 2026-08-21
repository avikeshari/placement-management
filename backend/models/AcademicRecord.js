const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      default: ""
    },
    college: { type: String, trim: true, default: "" },
    course: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
    graduationYear: Number,
    cgpa: Number,
    backlogs: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    transcriptUrl: { type: String, default: "" },
    transcriptName: { type: String, default: "" },
    verified: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Roll/enrollment numbers are unique when supplied, but blank values are allowed.
academicRecordSchema.index(
  { enrollmentNumber: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);
