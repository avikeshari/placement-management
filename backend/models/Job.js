const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, trim: true, default: "" },
    salary: Number,
    minimumCGPA: { type: Number, min: 0, max: 10 },
    maxBacklogs: { type: Number, min: 0, default: 0 },
    eligibleBranches: { type: [String], default: [] },
    minimumGraduationYear: Number,
    maximumGraduationYear: Number,
    requiredSkills: { type: [String], default: [] },
    deadline: Date,
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "open",
      index: true
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

jobSchema.index({ company: 1, status: 1, isDeleted: 1 });
jobSchema.index({ deadline: 1, status: 1, isDeleted: 1 });

module.exports = mongoose.model("Job", jobSchema);
