const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    phone: String,
    college: String,
    course: String,
    branch: String,
    graduationYear: Number,
    cgpa: Number,
    skills: [String],
    resume: {
      url: String,
      publicId: String,
      originalName: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
