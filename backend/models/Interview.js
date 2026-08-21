const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, min: 15, max: 240, default: 30 },
    mode: { type: String, enum: ["online", "offline"], required: true },
    location: { type: String, trim: true, default: "" },
    meetingUrl: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    studentResponse: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true
    },
    studentResponseMessage: { type: String, trim: true, default: "" },
    studentRespondedAt: { type: Date, default: null },
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      technicalSkills: { type: String, trim: true, default: "" },
      communication: { type: String, trim: true, default: "" },
      recommendation: { type: String, enum: ["", "hire", "hold", "reject"], default: "" },
      comments: { type: String, trim: true, default: "" },
      submittedAt: { type: Date, default: null }
    },
    reminder24SentAt: { type: Date, default: null },
    reminder1SentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
      index: true
    }
  },
  { timestamps: true }
);

interviewSchema.index({ student: 1, scheduledAt: 1 });
interviewSchema.index({ company: 1, scheduledAt: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
