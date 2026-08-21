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
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, note: { type: String, default: "" } }],
    rejectionReason: { type: String, default: "" },
    withdrawalReason: { type: String, default: "" },
    screeningAnswers: { type: [String], default: [] },
    coverLetter: { type: String, trim: true, default: "", maxlength: 5000 },
    offerStatus: { type: String, enum: ["none", "pending", "accepted", "declined"], default: "none", index: true },
    offerUpdatedAt: { type: Date, default: null },
    offerExpiresAt: { type: Date, default: null },
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
