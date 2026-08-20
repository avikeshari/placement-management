const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
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
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    lastMessage: { type: String, trim: true, default: "" },
    lastMessageAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
);

conversationSchema.index({ student: 1, lastMessageAt: -1 });
conversationSchema.index({ company: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
