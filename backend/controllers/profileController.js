const Profile = require("../models/Profile");
const User = require("../models/User");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.getStudentProfileForCompany = async (req, res) => {
  try {
    if (req.user.role === "company") {
      const relationship = await Application.findOne({
        student: req.params.userId
      }).populate({
        path: "job",
        match: { company: req.user._id },
        select: "company"
      });
      if (!relationship?.job) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this student's profile"
        });
      }
    }

    const profile = await Profile.findOne({ user: req.params.userId })
      .populate("user", "name email role isActive");

    if (!profile || profile.user?.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    return res.json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id
    }).populate(
      "user",
      "name email role isActive"
    );

    /*
     * Self-heal older/demo accounts that were
     * created before Profile creation existed.
     */
    if (!profile) {
      await Profile.findOneAndUpdate(
        { user: req.user._id },
        {
          $setOnInsert: {
            user: req.user._id
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      profile = await Profile.findOne({
        user: req.user._id
      }).populate(
        "user",
        "name email role isActive"
      );
    }

    return res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load profile"
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
      skills,
      website,
      industry,
      description,
      location
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
      skills: normalizedSkills,
      website,
      industry,
      description,
      location
    };

    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== "") {
      const parsedGraduationYear = Number(graduationYear);
      if (!Number.isInteger(parsedGraduationYear) || parsedGraduationYear < 2000 || parsedGraduationYear > 2100) {
        return res.status(400).json({ success: false, message: "Enter a valid graduation year" });
      }
      updateData.graduationYear = parsedGraduationYear;
    }

    if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
      const parsedCgpa = Number(cgpa);
      if (!Number.isFinite(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        return res.status(400).json({ success: false, message: "Enter a valid CGPA between 0 and 10" });
      }
      updateData.cgpa = parsedCgpa;
    }

    const profile =
      await Profile.findOneAndUpdate(
        { user: req.user._id },
        {
          $set: updateData,
          $setOnInsert: {
            user: req.user._id
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

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

    /*
     * Create the profile automatically if an
     * older/demo account does not have one.
     */
    const profile =
      await Profile.findOneAndUpdate(
        { user: req.user._id },
        {
          $setOnInsert: {
            user: req.user._id
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    /*
     * Upload the NEW file first.
     *
     * The previous implementation deleted the
     * old Cloudinary asset before the new upload.
     * If the new upload failed, the user could
     * lose the old resume.
     */
    const result =
      await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );

    const resourceType =
      result.resource_type || "raw";

    const deliveryType =
      result.type || "upload";

    const format =
      result.format ||
      (
        req.file.originalname
          .split(".")
          .pop() || ""
      ).toLowerCase();

    /*
     * Use Cloudinary's exact secure_url returned
     * by the upload response. Do not reconstruct
     * the view URL from public_id.
     */
    const newResume = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
      resourceType,
      deliveryType,
      format,
      /*
       * Keep the exact URL available for older
       * frontend code. The frontend now uses the
       * authenticated backend download endpoint.
       */
      downloadUrl: ""
    };

    const oldResume = profile.resume
      ? { ...profile.resume.toObject?.() }
      : null;

    profile.resume = newResume;

    await profile.save();

    /*
     * Only delete the old Cloudinary asset AFTER
     * the new asset has been successfully stored
     * in MongoDB.
     */
    if (oldResume?.publicId) {
      try {
        await cloudinary.uploader.destroy(
          oldResume.publicId,
          {
            resource_type:
              oldResume.resourceType ||
              (
                /\.pdf$/i.test(
                  oldResume.originalName || ""
                )
                  ? "image"
                  : "raw"
              ),
            type:
              oldResume.deliveryType ||
              "upload",
            invalidate: true
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Previous resume deletion failed:",
          cloudinaryError.message
        );
      }
    }

    return res.json({
      success: true,
      message:
        "Resume uploaded successfully",
      resume: profile.resume
    });
  } catch (error) {
    console.error(
      "Resume upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload resume"
    });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const profile =
      await Profile.findOne({
        user: req.user._id
      });

    if (!profile?.resume?.url) {
      return res.status(404).json({
        success: false,
        message: "No resume found"
      });
    }

    const axios = require("axios");

    const response =
      await axios.get(
        profile.resume.url,
        {
          responseType: "arraybuffer",
          validateStatus: (status) =>
            status >= 200 &&
            status < 300
        }
      );

    const fileName =
      profile.resume.originalName ||
      "resume";

    const extension =
      fileName.includes(".")
        ? fileName
            .split(".")
            .pop()
            .toLowerCase()
        : "";

    const contentTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    const contentType =
      contentTypes[extension] ||
      response.headers["content-type"] ||
      "application/octet-stream";

    const disposition =
      req.query.download === "true"
        ? "attachment"
        : "inline";

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${fileName.replace(/"/g, "")}"`
    );

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    return res.send(
      Buffer.from(response.data)
    );
  } catch (error) {
    console.error(
      "Resume delivery error:",
      error.response?.status,
      error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Resume could not be retrieved from storage. Please re-upload the resume."
    });
  }
};

exports.downloadStudentResume = async (req, res) => {
  try {
    if (req.user.role !== "company" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this resume" });
    }

    const studentId = req.params.userId;

    if (req.user.role === "company") {
      const application = await Application.findOne({
        student: studentId,
        ...(req.query.applicationId ? { _id: req.query.applicationId } : {})
      }).populate("job", "company");

      if (!application || application.job.company.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to view this student's resume" });
      }
    }

    const profile = await Profile.findOne({ user: studentId });

    if (!profile?.resume?.url) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    const axios = require("axios");
    const response = await axios.get(profile.resume.url, {
      responseType: "arraybuffer",
      validateStatus: (status) => status >= 200 && status < 300
    });

    const fileName = profile.resume.originalName || "resume";
    const extension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
    const contentTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    res.setHeader("Content-Type", contentTypes[extension] || response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${fileName.replace(/"/g, "")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(Buffer.from(response.data));
  } catch (error) {
    console.error("Student resume delivery error:", error.response?.status, error.message);
    return res.status(502).json({ success: false, message: "Resume could not be retrieved from storage." });
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
            resource_type:
              profile.resume.resourceType ||
              (
                /\.pdf$/i.test(
                  profile.resume.originalName || ""
                )
                  ? "image"
                  : "raw"
              ),
            type:
              profile.resume.deliveryType ||
              "upload",
            invalidate: true
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary resume deletion failed:",
          cloudinaryError.message
        );

        /*
         * Do not erase the MongoDB reference if
         * Cloudinary could not confirm deletion.
         * This prevents a "resume disappeared"
         * state when the cloud deletion fails.
         */
        return res.status(502).json({
          success: false,
          message:
            "Resume could not be removed from storage. Please try again."
        });
      }
    }

    profile.resume = undefined;

    await profile.save();

    return res.json({
      success: true,
      message:
        "Resume deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete resume"
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
              resource_type:
                profile.resume.resourceType ||
                (
                  /\.pdf$/i.test(
                    profile.resume.originalName || ""
                  )
                    ? "image"
                    : "raw"
                ),
              type:
                profile.resume.deliveryType ||
                "upload",
              invalidate: true
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