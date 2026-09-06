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
    // Derived field used to enforce a single "selected" placement offer per
    // student at the database level. It is set to the student id only while
    // the application status is "selected"; the unique partial index below
    // guarantees at most one selected offer per student even under concurrent
    // status updates (eliminates the TOCTOU race in the controller).
    selectedOfferKey: {
      type: String,
      default: null,
      select: false
    },
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
applicationSchema.index(
  { selectedOfferKey: 1 },
  { unique: true, partialFilterExpression: { selectedOfferKey: { $type: "string" } } }
);

module.exports = mongoose.model("Application", applicationSchema);
