const Application = require("../models/Application");
const Interview = require("../models/Interview");
const sendEmail = require("../utils/sendEmail");
const Conversation = require("../models/Conversation");

const isValidMeetingUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const buildInterviewMessage = ({ studentName, jobTitle, companyName, scheduledAt, mode, meetingUrl, location }) => {
  const dateText = new Date(scheduledAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });
  const timeText = new Date(scheduledAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  });

  return `Dear ${studentName},\n\nYou have been selected for an interview for the ${jobTitle} position at ${companyName}.\n\nDate: ${dateText}\nTime: ${timeText}\nMode: ${mode === "online" ? "Online" : "Offline"}\n${mode === "online" ? `Meeting Link: ${meetingUrl}` : `Location: ${location}`}\n\nPlease join the interview on time and keep the required documents ready.\n\nBest wishes,\n${companyName}`;
};

const buildInterviewHtml = ({ studentName, jobTitle, companyName, scheduledAt, mode, meetingUrl, location }) => {
  const dateText = new Date(scheduledAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });
  const timeText = new Date(scheduledAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  });

  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b"><h2>Interview Scheduled</h2><p>Dear ${studentName},</p><p>You have been selected for an interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p><p><strong>Date:</strong> ${dateText}</p><p><strong>Time:</strong> ${timeText}</p><p><strong>Mode:</strong> ${mode === "online" ? "Online" : "Offline"}</p>${mode === "online" ? `<p><strong>Meeting Link:</strong><br/><a href="${meetingUrl}">${meetingUrl}</a></p>` : `<p><strong>Location:</strong> ${location}</p>`}<p>Please join the interview on time and keep the required documents ready.</p><p>Best wishes,<br/><strong>${companyName}</strong></p></div>`;
};

const findConflicts = async ({ studentId, companyId, start, durationMinutes }) => {
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const windowStart = new Date(start.getTime() - 4 * 60 * 60 * 1000);
  const windowEnd = new Date(end.getTime() + 4 * 60 * 60 * 1000);

  const interviews = await Interview.find({
    status: "scheduled",
    scheduledAt: { $gte: windowStart, $lte: windowEnd },
    $or: [{ student: studentId }, { company: companyId }]
  }).lean();

  return interviews.filter((item) => {
    const existingStart = new Date(item.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + (item.durationMinutes || 30) * 60 * 1000);
    return existingStart < end && existingEnd > start;
  });
};

exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, mode, location, meetingUrl, durationMinutes = 30 } = req.body;

    if (!applicationId || !scheduledAt || !mode) {
      return res.status(400).json({ success: false, message: "Application, date, time and mode are required" });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ success: false, message: "Please provide a valid interview date and time" });
    }
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ success: false, message: "Interview must be scheduled for a future date and time" });
    }

    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      return res.status(400).json({ success: false, message: "Interview duration must be between 15 and 240 minutes" });
    }

    if (!["online", "offline"].includes(mode)) {
      return res.status(400).json({ success: false, message: "Invalid interview mode" });
    }

    if (mode === "online") {
      if (!meetingUrl?.trim() || !isValidMeetingUrl(meetingUrl.trim())) {
        return res.status(400).json({ success: false, message: "Please enter a valid online meeting link starting with http:// or https://" });
      }
    }

    if (mode === "offline" && !location?.trim()) {
      return res.status(400).json({ success: false, message: "Location is required for offline interviews" });
    }

    const application = await Application.findById(applicationId)
      .populate("job")
      .populate("student", "name email");

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });
    if (!application.job || String(application.job.company) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to schedule this interview" });
    }
    if (!application.student) return res.status(400).json({ success: false, message: "Candidate account is unavailable" });

    if (!application.job.isDeleted && application.job.deadline && new Date(application.job.deadline) < new Date()) {
      // Existing shortlisted candidates can still be interviewed after the job closes.
    }

    if (!["shortlisted", "selected"].includes(application.status)) {
      return res.status(400).json({ success: false, message: "Student must be shortlisted or selected before scheduling an interview" });
    }

    const existingInterview = await Interview.findOne({ application: application._id });
    if (existingInterview?.status === "scheduled") {
      return res.status(409).json({ success: false, message: "An interview has already been scheduled for this application" });
    }

    const conflicts = await findConflicts({
      studentId: application.student._id,
      companyId: req.user._id,
      start: scheduledDate,
      durationMinutes: duration
    });

    if (conflicts.length) {
      return res.status(409).json({
        success: false,
        message: "This interview slot conflicts with another scheduled interview for the candidate or company. Please choose another time."
      });
    }

    const companyName = req.user.name || "The company";
    const trimmedMeetingUrl = mode === "online" ? meetingUrl.trim() : "";
    const trimmedLocation = mode === "offline" ? location.trim() : "";
    const message = buildInterviewMessage({
      studentName: application.student.name,
      jobTitle: application.job.title,
      companyName,
      scheduledAt: scheduledDate,
      mode,
      meetingUrl: trimmedMeetingUrl,
      location: trimmedLocation
    });

    const interview = existingInterview?.status === "cancelled"
      ? await Interview.findOneAndUpdate(
          { _id: existingInterview._id, status: "cancelled" },
          {
            $set: {
              scheduledAt: scheduledDate,
              durationMinutes: duration,
              mode,
              location: trimmedLocation,
              meetingUrl: trimmedMeetingUrl,
              message,
              status: "scheduled",
              studentResponse: "pending",
              studentResponseMessage: "",
              studentRespondedAt: null
            }
          },
          { new: true }
        )
      : await Interview.create({
          application: application._id,
          student: application.student._id,
          company: req.user._id,
          scheduledAt: scheduledDate,
          durationMinutes: duration,
          mode,
          location: trimmedLocation,
          meetingUrl: trimmedMeetingUrl,
          message,
          studentResponse: "pending"
        });

    application.status = "interview";
    application.statusUpdatedAt = new Date();
    await application.save();

    // Messaging becomes available once the company schedules an interview.
    // One conversation is permanently associated with this application.
    await Conversation.findOneAndUpdate(
      { application: application._id },
      {
        $set: {
          student: application.student._id,
          company: req.user._id,
          job: application.job._id
        },
        $setOnInsert: {
          lastMessage: "",
          lastMessageAt: null
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await sendEmail({
        to: application.student.email,
        subject: `Interview Scheduled - ${application.job.title}`,
        text: message,
        html: buildInterviewHtml({
          studentName: application.student.name,
          jobTitle: application.job.title,
          companyName,
          scheduledAt: scheduledDate,
          mode,
          meetingUrl: trimmedMeetingUrl,
          location: trimmedLocation
        })
      });
    } catch (emailError) {
      console.error("Interview email failed:", emailError.message);
    }

    return res.status(201).json({ success: true, message: "Interview scheduled successfully", interview });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "An interview has already been scheduled for this application" });
    console.error("Schedule interview error:", error);
    return res.status(500).json({ success: false, message: "Unable to schedule interview" });
  }
};


exports.cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      company: req.user._id
    }).populate("student", "name email").populate("company", "name email").populate({
      path: "application",
      populate: { path: "job", select: "title" }
    });

    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (interview.status !== "scheduled") {
      return res.status(400).json({ success: false, message: "Only scheduled interviews can be cancelled" });
    }

    interview.status = "cancelled";
    interview.studentResponseMessage = "The company cancelled this interview.";
    interview.studentRespondedAt = new Date();
    await interview.save();

    if (interview.application && ["interview", "shortlisted"].includes(interview.application.status)) {
      interview.application.status = "shortlisted";
      interview.application.statusUpdatedAt = new Date();
      await interview.application.save();
    }

    try {
      await sendEmail({
        to: interview.student.email,
        subject: `Interview Cancelled - ${interview.application?.job?.title || "Placement Interview"}`,
        text: `The company has cancelled your scheduled interview for ${interview.application?.job?.title || "the position"}. Please check your Placement Portal for further updates.`,
        html: `<h2>Interview Cancelled</h2><p>Hello ${interview.student.name},</p><p>The company has cancelled your scheduled interview for <strong>${interview.application?.job?.title || "the position"}</strong>.</p><p>Please check your Placement Portal for further updates.</p>`
      });
    } catch (emailError) {
      console.error("Interview cancellation email failed:", emailError.message);
    }

    return res.json({ success: true, message: "Interview cancelled successfully", interview });
  } catch (error) {
    console.error("Cancel interview error:", error);
    return res.status(500).json({ success: false, message: "Unable to cancel interview" });
  }
};

exports.respondToInterview = async (req, res) => {
  try {
    const { response, message = "" } = req.body;
    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({ success: false, message: "Please choose accept or decline" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate("student", "name email").populate("company", "name email").populate({
      path: "application",
      populate: { path: "job", select: "title" }
    });

    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (interview.status !== "scheduled") {
      return res.status(400).json({ success: false, message: "This interview is no longer active" });
    }
    if (interview.studentResponse !== "pending") {
      return res.status(409).json({ success: false, message: "You have already responded to this interview" });
    }

    const cleanMessage = String(message || "").trim();
    const defaultMessage = response === "accepted"
      ? `${interview.student.name} has accepted the interview invitation for ${interview.application?.job?.title || "the position"}.`
      : `${interview.student.name} has declined the interview invitation for ${interview.application?.job?.title || "the position"}.`;

    interview.studentResponse = response;
    interview.studentResponseMessage = cleanMessage || defaultMessage;
    interview.studentRespondedAt = new Date();

    if (response === "declined") {
      interview.status = "cancelled";
      if (interview.application && interview.application.status === "interview") {
        interview.application.status = "shortlisted";
        interview.application.statusUpdatedAt = new Date();
        await interview.application.save();
      }
    }

    await interview.save();

    try {
      await sendEmail({
        to: interview.company.email,
        subject: `Interview ${response === "accepted" ? "Accepted" : "Declined"} - ${interview.application?.job?.title || "Placement Interview"}`,
        text: interview.studentResponseMessage,
        html: `<h2>Interview ${response === "accepted" ? "Accepted" : "Declined"}</h2><p>${interview.studentResponseMessage}</p>`
      });
    } catch (emailError) {
      console.error("Interview response email failed:", emailError.message);
    }

    return res.json({
      success: true,
      message: response === "accepted" ? "Interview accepted successfully" : "Interview declined successfully",
      interview
    });
  } catch (error) {
    console.error("Interview response error:", error);
    return res.status(500).json({ success: false, message: "Unable to update interview response" });
  }
};

exports.getMyInterviews = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { student: req.user._id } : { company: req.user._id };
    const interviews = await Interview.find(filter)
      .populate("student", "name email")
      .populate("company", "name email")
      .populate({ path: "application", populate: { path: "job", select: "title location description salary deadline" } })
      .sort({ scheduledAt: 1 });
    return res.json({ success: true, interviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load interviews" });
  }
};

exports.getInterviewAccess = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("student", "name email")
      .populate("company", "name email")
      .populate({ path: "application", populate: { path: "job", select: "title" } });

    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const allowed = [String(interview.student._id), String(interview.company._id)].includes(String(req.user._id)) || req.user.role === "admin";
    if (!allowed) return res.status(403).json({ success: false, message: "You are not authorized to access this interview" });

    if (interview.status === "cancelled") return res.status(400).json({ success: false, message: "This interview has been cancelled" });
    if (interview.mode !== "online" || !interview.meetingUrl) return res.status(400).json({ success: false, message: "This interview does not have an online meeting link" });

    return res.json({
      success: true,
      interview: {
        _id: interview._id,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        meetingUrl: interview.meetingUrl,
        job: interview.application?.job,
        student: interview.student,
        company: interview.company
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid interview ID" });
  }
};
