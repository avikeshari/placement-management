const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Profile = require("../models/Profile");
const AcademicRecord = require("../models/AcademicRecord");
const sendEmail = require("../utils/sendEmail");
const Interview = require("../models/Interview");
const User = require("../models/User");
const { buildEligibility } = require("./jobController");

exports.applyForJob = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdApplication;

    await session.withTransaction(async () => {
      const job = await Job.findOne({
        _id: req.params.jobId,
        isDeleted: false
      }).session(session);

      if (!job || job.status !== "open") {
        const error = new Error("This job is no longer accepting applications");
        error.statusCode = 400;
        throw error;
      }

      if (job.deadline && new Date(job.deadline).getTime() <= Date.now()) {
        const error = new Error("The application deadline has passed");
        error.statusCode = 400;
        throw error;
      }

      const [profile, academicRecord, existingApplication, existingOffer] = await Promise.all([
        Profile.findOne({ user: req.user._id }).session(session),
        AcademicRecord.findOne({ user: req.user._id }).session(session),
        Application.findOne({ student: req.user._id, job: job._id }).session(session),
        Application.findOne({ student: req.user._id, status: "selected" }).session(session)
      ]);

      if (!profile?.resume?.url) {
        const error = new Error("Upload your resume before applying");
        error.statusCode = 400;
        throw error;
      }

      if (existingApplication) {
        const error = new Error("You have already applied for this job");
        error.statusCode = 409;
        throw error;
      }

      if (existingOffer && String(existingOffer.job) !== String(job._id)) {
        const error = new Error("You already have a selected placement offer and cannot apply for another job");
        error.statusCode = 409;
        throw error;
      }

      const eligibility = buildEligibility(job, academicRecord);
      if (!eligibility.eligible) {
        const error = new Error(`You are not eligible for this job: ${eligibility.reasons.join("; ")}`);
        error.statusCode = 403;
        throw error;
      }

      createdApplication = await Application.create([
        {
          student: req.user._id,
          job: job._id,
          status: "applied",
          appliedAt: new Date(),
          statusUpdatedAt: new Date(),
          resume: {
            url: profile.resume.url,
            downloadUrl: "",
            publicId: profile.resume.publicId,
            originalName: profile.resume.originalName,
            resourceType: profile.resume.resourceType,
            deliveryType: profile.resume.deliveryType,
            format: profile.resume.format
          }
        }
      ], { session });
      createdApplication = createdApplication[0];
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: createdApplication
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already applied for this job" });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to submit application"
    });
  } finally {
    await session.endSession();
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: "job",
        select: "title description location salary deadline status company minimumCGPA maxBacklogs eligibleBranches minimumGraduationYear maximumGraduationYear requiredSkills isDeleted",
        populate: { path: "company", select: "name email" }
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load applications" });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      company: req.user._id,
      isDeleted: false
    });

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const applications = await Application.find({ job: job._id })
      .populate("student", "name email")
      .populate("job", "title description location salary deadline minimumCGPA maxBacklogs eligibleBranches minimumGraduationYear maximumGraduationYear requiredSkills")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load applicants" });
  }
};


exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate("job", "title company");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (!["applied", "shortlisted", "interview"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: "This application can no longer be withdrawn"
      });
    }

    const previousStatus = application.status;
    application.status = "withdrawn";
    application.statusUpdatedAt = new Date();
    await application.save();

    const interview = await Interview.findOne({ application: application._id, status: "scheduled" });
    if (interview) {
      interview.status = "cancelled";
      interview.studentResponse = "declined";
      interview.studentResponseMessage = "The student withdrew the application and can no longer attend the interview.";
      interview.studentRespondedAt = new Date();
      await interview.save();
    }

    try {
      const studentName = req.user.name || "The student";
      await sendEmail({
        to: (await User.findById(application.job.company).select("email"))?.email,
        subject: `Application Withdrawn - ${application.job.title}`,
        text: `${studentName} has withdrawn their application for ${application.job.title}.${previousStatus === "interview" ? " Any scheduled interview has also been cancelled." : ""}`,
        html: `<h2>Application Withdrawn</h2><p><strong>${studentName}</strong> has withdrawn their application for <strong>${application.job.title}</strong>.</p>${previousStatus === "interview" ? "<p>Any scheduled interview has also been cancelled.</p>" : ""}`
      });
    } catch (emailError) {
      console.error("Withdrawal email failed:", emailError.message);
    }

    return res.json({
      success: true,
      message: "Application withdrawn successfully",
      application
    });
  } catch (error) {
    console.error("Withdraw application error:", error);
    return res.status(500).json({ success: false, message: "Unable to withdraw application" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["applied", "shortlisted", "interview", "selected", "rejected", "withdrawn"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status" });
    }

    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("student", "name email");

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (!application.job || String(application.job.company) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this application" });
    }

    const transitions = {
      applied: ["applied", "shortlisted", "rejected"],
      shortlisted: ["shortlisted", "interview", "selected", "rejected"],
      interview: ["interview", "selected", "rejected"],
      selected: ["selected"],
      rejected: ["rejected"],
      withdrawn: ["withdrawn"]
    };

    if (!transitions[application.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${application.status} to ${status}. Please follow the application workflow.`
      });
    }

    if (status === "selected") {
      const otherOffer = await Application.findOne({
        student: application.student._id,
        status: "selected",
        _id: { $ne: application._id }
      });
      if (otherOffer) {
        return res.status(409).json({
          success: false,
          message: "This student already has a selected placement offer"
        });
      }
    }

    if (application.status === status) {
      return res.json({ success: true, message: "Application status is already set to this value", application });
    }

    const previousStatus = application.status;
    const updated = await Application.findOneAndUpdate(
      { _id: application._id, status: previousStatus },
      { $set: { status, statusUpdatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "The application changed while you were updating it. Refresh and try again."
      });
    }

    try {
      await sendEmail({
        to: application.student.email,
        subject: "Application Status Updated",
        text: `Your application for ${application.job.title} is now ${status}.`,
        html: `<h2>Application Update</h2><p>Hello ${application.student.name},</p><p>Your application for <strong>${application.job.title}</strong> is now <strong>${status}</strong>.</p>`
      });
    } catch (emailError) {
      console.error("Status email failed:", emailError.message);
    }

    return res.json({ success: true, message: "Application status updated successfully", application: updated });
  } catch (error) {
    console.error("Update application status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update application status" });
  }
};
