const Profile = require("../models/Profile");
const User = require("../models/User");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      phone,
      college,
      course,
      branch,
      graduationYear,
      cgpa,
      skills
    } = req.body;

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
        : [];

    const updateData = {
      phone,
      college,
      course,
      branch,
      skills: normalizedSkills
    };

    if (graduationYear !== "") {
      updateData.graduationYear =
        Number(graduationYear);
    }

    if (cgpa !== "") {
      updateData.cgpa = Number(cgpa);
    }

    const profile =
      await Profile.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        {
          new: true,
          runValidators: true
        }
      );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a resume"
      });
    }

    const profile = await Profile.findOne({
      user: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Delete the previous resume from Cloudinary
    // before replacing it.
    if (profile.resume?.publicId) {
      try {
        await cloudinary.uploader.destroy(
          profile.resume.publicId,
          {
            resource_type: "raw"
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Previous resume deletion failed:",
          cloudinaryError.message
        );
      }
    }

    const result =
      await uploadToCloudinary(
        req.file.buffer
      );

    profile.resume = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname
    };

    await profile.save();

    return res.json({
      success: true,
      message: "Resume uploaded successfully",
      resume: profile.resume
    });
  } catch (error) {
    console.error(
      "Resume upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const profile =
      await Profile.findOne({
        user: req.user._id
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    if (!profile.resume?.url) {
      return res.status(404).json({
        success: false,
        message: "No resume found"
      });
    }

    if (profile.resume.publicId) {
      try {
        await cloudinary.uploader.destroy(
          profile.resume.publicId,
          {
            resource_type: "raw"
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary resume deletion failed:",
          cloudinaryError.message
        );
      }
    }

    profile.resume = undefined;

    await profile.save();

    return res.json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMyAccount = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    if (req.user.role === "student") {
      const applications =
        await Application.find({
          student: userId
        }).select("_id");

      const applicationIds =
        applications.map(
          (application) =>
            application._id
        );

      await Interview.deleteMany({
        $or: [
          { student: userId },
          {
            application: {
              $in: applicationIds
            }
          }
        ]
      });

      await Application.deleteMany({
        student: userId
      });

      const profile =
        await Profile.findOne({
          user: userId
        });

      if (profile?.resume?.publicId) {
        try {
          await cloudinary.uploader.destroy(
            profile.resume.publicId,
            {
              resource_type: "raw"
            }
          );
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary resume deletion failed:",
            cloudinaryError.message
          );
        }
      }

      await Profile.deleteOne({
        user: userId
      });
    } else if (req.user.role === "company") {
      const jobs = await Job.find({
        company: userId
      }).select("_id");

      const jobIds = jobs.map(
        (job) => job._id
      );

      const applications = await Application.find({
        job: {
          $in: jobIds
        }
      }).select("_id");

      const applicationIds = applications.map(
        (application) => application._id
      );

      await Interview.deleteMany({
        application: {
          $in: applicationIds
        }
      });

      await Application.deleteMany({
        job: {
          $in: jobIds
        }
      });

      await Job.deleteMany({
        company: userId
      });
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Admin account deletion is disabled"
      });
    }

    await User.deleteOne({
      _id: userId
    });

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};