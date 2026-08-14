const Application = require("../models/Application");
const Job = require("../models/Job");
const Profile = require("../models/Profile");
const sendEmail = require("../utils/sendEmail");

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications"
      });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "The application deadline has passed"
      });
    }

    const profile = await Profile.findOne({
      user: req.user._id
    });

    if (!profile?.resume?.url) {
      return res.status(400).json({
        success: false,
        message: "Upload your resume before applying"
      });
    }

    if (
      job.minimumCGPA &&
      (!profile.cgpa || profile.cgpa < job.minimumCGPA)
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA required is ${job.minimumCGPA}`
      });
    }

    const existingApplication = await Application.findOne({
      student: req.user._id,
      job: job._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    const application = await Application.create({
      student: req.user._id,
      job: job._id,
      resume: {
        url: profile.resume.url,
        publicId: profile.resume.publicId,
        originalName: profile.resume.originalName
      }
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id
    })
      .populate(
        "job",
        "title description location salary deadline status company"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      company: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const applications = await Application.find({
      job: job._id
    })
      .populate("student", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "applied",
      "shortlisted",
      "interview",
      "selected",
      "rejected"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status"
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("student", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (
      application.job.company.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const transitions = {
      applied: ["shortlisted", "rejected"],
      shortlisted: ["interview", "selected", "rejected"],
      interview: ["selected", "rejected"],
      selected: [],
      rejected: []
    };

    if (!transitions[application.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change status from ${application.status} to ${status}`
      });
    }

    application.status = status;
    await application.save();

    try {
      await sendEmail({
        to: application.student.email,
        subject: "Application Status Updated",
        text:
          `Your application for ${application.job.title} is now ${status}.`,
        html: `
          <h2>Application Update</h2>
          <p>Hello ${application.student.name},</p>
          <p>
            Your application for
            <strong>${application.job.title}</strong>
            has been updated.
          </p>
          <p>
            New status:
            <strong>${status}</strong>
          </p>
        `
      });
    } catch (emailError) {
      console.error("Status email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
