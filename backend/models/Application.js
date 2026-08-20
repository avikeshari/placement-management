const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "selected", "rejected", "withdrawn"],
      default: "applied",
      index: true
    },
    statusUpdatedAt: { type: Date, default: Date.now },
    appliedAt: { type: Date, default: Date.now },
    resume: {
      url: String,
      downloadUrl: String,
      publicId: String,
      originalName: String,
      resourceType: String,
      deliveryType: String,
      format: String
    }
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
