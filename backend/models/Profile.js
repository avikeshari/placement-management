const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    college: {
      type: String,
      trim: true,
      default: ""
    },

    course: {
      type: String,
      trim: true,
      default: ""
    },

    branch: {
      type: String,
      trim: true,
      default: ""
    },

    graduationYear: Number,

    cgpa: Number,

    skills: {
      type: [String],
      default: []
    },

    website: {
      type: String,
      trim: true,
      default: ""
    },

    industry: {
      type: String,
      trim: true,
      default: ""
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    location: {
      type: String,
      trim: true,
      default: ""
    },

    resume: {
      url: {
        type: String,
        default: ""
      },
      downloadUrl: {
        type: String,
        default: ""
      },
      publicId: {
        type: String,
        default: ""
      },
      originalName: {
        type: String,
        default: ""
      },
      resourceType: {
        type: String,
        enum: ["image", "raw", "video", ""],
        default: ""
      },
      deliveryType: {
        type: String,
        enum: ["upload", "private", "authenticated", ""],
        default: ""
      },
      format: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.model("Profile", profileSchema);
