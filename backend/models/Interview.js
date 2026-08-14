const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true
    },
    location: String,
    meetingUrl: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
