const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Profile = require("../models/Profile");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const Interview = require("../models/Interview");
const User = require("../models/User");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

exports.applyForJob = async (req, res) => {
  try {
    const coverLetter = String(req.body?.coverLetter ?? "").trim();
    if (coverLetter.length > 5000) {
      return res.status(400).json({ success: false, message: "Cover letter must be 5000 characters or fewer" });
    }

    const job = await Job.findOne({ _id: req.params.jobId, isDeleted: false });
    if (!job || job.status !== "open") {
      return res.status(400).json({ success: false, message: "This job is no longer accepting applications" });
    }

    const [profile, existingApplication, existingOffer] = await Promise.all([
      Profile.findOne({ user: req.user._id }),
      Application.findOne({ student: req.user._id, job: job._id }),
      Application.findOne({ student: req.user._id, status: "selected" })
    ]);

    if (!profile?.resume?.url) {
      return res.status(400).json({ success: false, message: "Upload your resume before applying" });
    }

    if (existingOffer && String(existingOffer.job) !== String(job._id)) {
      return res.status(409).json({
        success: false,
        message: "You already have a selected placement offer and cannot apply for another job"
      });
    }

    // Apply is open to everyone: students are never restricted by job
    // requirements (skills, CGPA, backlogs, branch, deadline). A job stops
    // accepting applications only when the company closes it, enforced above.

    // Withdrawal is final for a given job. A student may not reapply
    // after withdrawing an application. Keep the withdrawn record for
    // history/audit purposes and block all subsequent applications.
    if (existingApplication?.status === "withdrawn") {
      return res.status(409).json({
        success: false,
        message: "You withdrew this application and cannot reapply for this job"
      });
    }

    if (existingApplication) {
      return res.status(409).json({ success: false, message: "You have already applied for this job" });
    }

    const createdApplication = await Application.create({
      student: req.user._id,
      job: job._id,
      status: "applied",
      appliedAt: new Date(),
      statusUpdatedAt: new Date(),
      coverLetter,
      resume: {
        url: profile.resume.url,
        downloadUrl: "",
        publicId: profile.resume.publicId,
        originalName: profile.resume.originalName,
        resourceType: profile.resume.resourceType,
        deliveryType: profile.resume.deliveryType,
        format: profile.resume.format
      }
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: createdApplication
    });
  } catch (error) {
    if (error.code === 11000) {
      // The unique (student, job) index can race another request. Re-read the
      // historical application so a withdrawn application always gets the
      // final/no-reapply response instead of being mistaken for an active one.
      const existing = await Application.findOne({
        student: req.user._id,
        job: req.params.jobId
      }).select("status").lean();

      if (existing?.status === "withdrawn") {
        return res.status(409).json({
          success: false,
          message: "You withdrew this application and cannot reapply for this job"
        });
      }

      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    console.error("Apply for job error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to submit application"
    });
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
        html: `<h2>Application Withdrawn</h2><p><strong>${escapeHtml(studentName)}</strong> has withdrawn their application for <strong>${escapeHtml(application.job.title)}</strong>.</p>${previousStatus === "interview" ? "<p>Any scheduled interview has also been cancelled.</p>" : ""}`
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

    const setFields = {
      status,
      statusUpdatedAt: new Date()
    };

    if (status === "selected") {
      setFields.offerStatus = "pending";
      setFields.offerUpdatedAt = new Date();
      setFields.selectedOfferKey = String(application.student._id);
    }

    const update = {
      $set: setFields,
      $unset: status === "selected" ? {} : { selectedOfferKey: 1 }
    };

    const updated = await Application.findOneAndUpdate(
      { _id: application._id, status: previousStatus },
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "The application changed while you were updating it. Refresh and try again."
      });
    }

    try { await Notification.create({ user: application.student._id, title: "Application status updated", message: `Your application for ${application.job.title} is now ${status}.`, type: "application", link: "/student/applications" }); } catch (n) { console.error("Status notification failed:", n.message); }

    try {
      await sendEmail({
        to: application.student.email,
        subject: "Application Status Updated",
        text: `Your application for ${application.job.title} is now ${status}.`,
        html: `<h2>Application Update</h2><p>Hello ${escapeHtml(application.student.name)},</p><p>Your application for <strong>${escapeHtml(application.job.title)}</strong> is now <strong>${escapeHtml(status)}</strong>.</p>`
      });
    } catch (emailError) {
      console.error("Status email failed:", emailError.message);
    }

    return res.json({ success: true, message: "Application status updated successfully", application: updated });
  } catch (error) {
    console.error("Update application status error:", error);
    if (error.code === 11000 && error.message?.includes("selectedOfferKey")) {
      return res.status(409).json({ success: false, message: "This student already has a selected placement offer" });
    }
    return res.status(500).json({ success: false, message: "Unable to update application status" });
  }
};

exports.respondToOffer = async (req, res) => {
  try {
    const { response } = req.body;
    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({ success: false, message: "Invalid offer response" });
    }

    const a = await Application.findOne({
      _id: req.params.id,
      student: req.user._id,
      status: "selected"
    }).populate("job", "title company");

    if (!a) {
      return res.status(404).json({ success: false, message: "Selected offer not found" });
    }

    // Idempotency guard: once an offer is accepted or declined it is final.
    // Prevent repeated calls from flipping the decision back and forth.
    if (a.offerStatus === "accepted" || a.offerStatus === "declined") {
      return res.status(409).json({
        success: false,
        message: `You have already ${a.offerStatus} this offer. The decision is final.`
      });
    }

    a.offerStatus = response;
    a.offerUpdatedAt = new Date();
    await a.save();
    res.json({ success: true, message: `Offer ${response} successfully`, application: a });
  } catch (e) {
    console.error("Respond to offer error:", e);
    res.status(500).json({ success: false, message: "Unable to update offer" });
  }
};
