const Application = require("../models/Application");
const Interview = require("../models/Interview");
const sendEmail = require("../utils/sendEmail");
const { createDailyRoom } = require("../services/dailyService");

exports.scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      scheduledAt,
      mode,
      location
    } = req.body;

    if (!applicationId || !scheduledAt || !mode) {
      return res.status(400).json({
        success: false,
        message: "Application, date and mode are required"
      });
    }

    if (new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Interview must be scheduled for a future date"
      });
    }

    if (!["online", "offline"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview mode"
      });
    }

    if (mode === "offline" && !location) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline interviews"
      });
    }

    const application = await Application.findById(applicationId)
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

    if (application.status !== "shortlisted") {
      return res.status(400).json({
        success: false,
        message: "Student must be shortlisted first"
      });
    }

    const existingInterview = await Interview.findOne({
      application: application._id
    });

    if (existingInterview) {
      return res.status(400).json({
        success: false,
        message: "An interview has already been scheduled"
      });
    }

    let meetingUrl = null;

    if (mode === "online") {
      const room = await createDailyRoom({
        applicationId,
        scheduledAt
      });

      meetingUrl = room.url;
    }

    const interview = await Interview.create({
      application: application._id,
      student: application.student._id,
      company: req.user._id,
      scheduledAt,
      mode,
      location: mode === "offline" ? location : undefined,
      meetingUrl
    });

    application.status = "interview";
    await application.save();

    try {
      await sendEmail({
        to: application.student.email,
        subject: `Interview Scheduled - ${application.job.title}`,
        text:
          `Your interview is scheduled for ${new Date(
            scheduledAt
          ).toLocaleString()}.`,
        html: `
          <h2>Interview Scheduled</h2>
          <p>Hello ${application.student.name},</p>
          <p>
            Your interview for
            <strong>${application.job.title}</strong>
            has been scheduled.
          </p>
          <p>
            <strong>Date:</strong>
            ${new Date(scheduledAt).toLocaleString()}
          </p>
          <p>
            <strong>Mode:</strong>
            ${mode}
          </p>
          ${
            meetingUrl
              ? `<p><a href="${meetingUrl}">Join Video Interview</a></p>`
              : `<p><strong>Location:</strong> ${location}</p>`
          }
        `
      });
    } catch (emailError) {
      console.error("Interview email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyInterviews = async (req, res) => {
  try {
    const filter =
      req.user.role === "student"
        ? { student: req.user._id }
        : { company: req.user._id };

    const interviews = await Interview.find(filter)
      .populate("student", "name email")
      .populate("company", "name email")
      .populate({
        path: "application",
        populate: {
          path: "job",
          select: "title location"
        }
      })
      .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
