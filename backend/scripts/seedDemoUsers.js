const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const AcademicRecord = require("../models/AcademicRecord");
const CareerEvent = require("../models/CareerEvent");
const PlacementDrive = require("../models/PlacementDrive");
const connectDB = require("../config/db");

const users = [
  { name: "Demo Student", email: "student.demo@aviportal.com", password: "Student@123", role: "student" },
  { name: "Demo Company", email: "company.demo@aviportal.com", password: "Company@123", role: "company" },
  { name: "Demo Admin", email: "admin.demo@aviportal.com", password: "Admin@123", role: "admin" }
];

const demoResumeUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function upsertDemoUser(demo) {
  const password = await bcrypt.hash(demo.password, 12);
  return User.findOneAndUpdate(
    { email: demo.email },
    { $set: { name: demo.name, email: demo.email, password, role: demo.role, isActive: true, isVerified: demo.role === "company" || demo.role === "admin" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

function futureDate(days, hour = 23, minute = 59) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function upsertDemoJob(companyId, data) {
  return Job.findOneAndUpdate(
    { company: companyId, title: data.title },
    {
      $set: {
        ...data,
        company: companyId,
        status: "open",
        isDeleted: false,
        deletedAt: null
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureApplication({ studentId, job, status }) {
  const application = await Application.findOneAndUpdate(
    { student: studentId, job: job._id },
    {
      $set: {
        status,
        statusUpdatedAt: new Date(),
        resume: {
          url: demoResumeUrl,
          downloadUrl: "",
          publicId: "",
          originalName: "demo-student-resume.pdf",
          resourceType: "",
          deliveryType: "",
          format: "pdf"
        }
      },
      $setOnInsert: {
        student: studentId,
        job: job._id,
        appliedAt: new Date()
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return application;
}

async function removeApplicationAndInterview(studentId, jobId) {
  const application = await Application.findOne({ student: studentId, job: jobId }).select("_id");
  if (!application) return;
  const conversations = await Conversation.find({ application: application._id }).select("_id");
  const conversationIds = conversations.map((item) => item._id);
  if (conversationIds.length) await Message.deleteMany({ conversation: { $in: conversationIds } });
  await Interview.deleteMany({ application: application._id });
  await Conversation.deleteMany({ application: application._id });
  await Application.deleteOne({ _id: application._id });
}

async function seedDemoData({ reset = false } = {}) {
  const student = await upsertDemoUser(users[0]);
  const company = await upsertDemoUser(users[1]);
  await upsertDemoUser(users[2]);

  await Profile.findOneAndUpdate(
    { user: student._id },
    {
      $set: {
        phone: "+91 98765 43210",
        college: "ABC Institute of Technology",
        course: "B.Tech",
        branch: "Computer Science and Engineering",
        graduationYear: 2027,
        cgpa: 8.7,
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
        location: "Prayagraj, Uttar Pradesh",
        privacy: "employers",
        shareGpaWithEmployers: true,
        jobInterests: ["Software Developer", "Frontend Developer", "Backend Developer"],
        preferredLocations: ["Bengaluru", "Hyderabad", "Pune"],
        preferredJobTypes: ["job", "internship"]
      },
      $setOnInsert: { user: student._id }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AcademicRecord.findOneAndUpdate(
    { user: student._id },
    {
      $set: {
        user: student._id,
        studentEmail: student.email,
        enrollmentNumber: "DEMO-CSE-001",
        college: "ABC Institute of Technology",
        course: "B.Tech",
        branch: "Computer Science and Engineering",
        graduationYear: 2027,
        cgpa: 8.7,
        backlogs: 0,
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git", "HTML", "CSS", "REST API", "Express"],
        verified: true
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const studentProfile = await Profile.findOne({ user: student._id });
  if (!studentProfile?.resume?.url) {
    await Profile.findOneAndUpdate(
      { user: student._id },
      {
        $set: {
          resume: {
            url: demoResumeUrl,
            downloadUrl: "",
            publicId: "",
            originalName: "demo-student-resume.pdf",
            resourceType: "",
            deliveryType: "",
            format: "pdf"
          }
        }
      }
    );
  }

  await Profile.findOneAndUpdate(
    { user: company._id },
    {
      $set: {
        phone: "+91 98765 12345",
        website: "https://example.com",
        industry: "Information Technology",
        description: "Demo technology company hiring students for software and graduate roles.",
        location: "Bengaluru, Karnataka"
      },
      $setOnInsert: { user: company._id }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (reset) {
    const jobs = await Job.find({ company: company._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);
    if (jobIds.length) {
      const applications = await Application.find({ job: { $in: jobIds } }).select("_id");
      const applicationIds = applications.map((item) => item._id);
      if (applicationIds.length) {
        const conversations = await Conversation.find({ application: { $in: applicationIds } }).select("_id");
        const conversationIds = conversations.map((item) => item._id);
        if (conversationIds.length) await Message.deleteMany({ conversation: { $in: conversationIds } });
        await Interview.deleteMany({ application: { $in: applicationIds } });
        await Conversation.deleteMany({ application: { $in: applicationIds } });
      }
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }
  }

  const commonEligibility = {
    minimumCGPA: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ["Computer Science and Engineering"],
    minimumGraduationYear: 2026,
    maximumGraduationYear: 2028
  };

  const jobs = {};

  jobs.frontend = await upsertDemoJob(company._id, {
    title: "Frontend Developer",
    description: "Build responsive React interfaces, collaborate with backend engineers, write maintainable components, and participate in code reviews.",
    location: "Bengaluru / Hybrid",
    salary: 900000,
    ...commonEligibility,
    requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    deadline: futureDate(14)
  });

  jobs.backend = await upsertDemoJob(company._id, {
    title: "Backend Developer",
    description: "Develop REST APIs using Node.js and Express, work with MongoDB, implement authentication, and support production deployments.",
    location: "Remote",
    salary: 1000000,
    ...commonEligibility,
    minimumCGPA: 8,
    requiredSkills: ["Node.js", "Express", "MongoDB", "REST API", "Git"],
    deadline: futureDate(21)
  });

  jobs.fullStack = await upsertDemoJob(company._id, {
    title: "Full Stack Developer",
    description: "Work across React frontend and Node.js backend services, build APIs, integrate databases, and deliver complete web features.",
    location: "Bengaluru / Hybrid",
    salary: 1100000,
    ...commonEligibility,
    minimumCGPA: 7.5,
    requiredSkills: ["React", "Node.js", "JavaScript", "MongoDB"],
    deadline: futureDate(28)
  });

  jobs.qa = await upsertDemoJob(company._id, {
    title: "QA Engineer",
    description: "Design test cases, perform functional testing, report defects, and help maintain software quality across web applications.",
    location: "Pune / Hybrid",
    salary: 700000,
    ...commonEligibility,
    requiredSkills: ["Testing", "JavaScript", "Git"],
    deadline: futureDate(35)
  });

  jobs.data = await upsertDemoJob(company._id, {
    title: "Data Analyst",
    description: "Analyze business data, prepare dashboards, identify trends, and communicate actionable insights to product and business teams.",
    location: "Remote",
    salary: 800000,
    ...commonEligibility,
    requiredSkills: ["SQL", "Excel", "Python"],
    deadline: futureDate(42)
  });

  // Clean up applications from demo jobs that should remain unapplied.
  await removeApplicationAndInterview(student._id, jobs.qa._id);
  await removeApplicationAndInterview(student._id, jobs.data._id);

  // Keep one ordinary applied application.
  const frontendApplication = await ensureApplication({
    studentId: student._id,
    job: jobs.frontend,
    status: "applied"
  });

  // Keep one shortlisted application without an interview so the company can test scheduling.
  const fullStackApplication = await ensureApplication({
    studentId: student._id,
    job: jobs.fullStack,
    status: "shortlisted"
  });

  // Keep one interview-ready application with an existing interview.
  const backendApplication = await ensureApplication({
    studentId: student._id,
    job: jobs.backend,
    status: "interview"
  });

  // Remove any stale interviews for the frontend and full-stack demo applications.
  await Interview.deleteMany({ application: { $in: [frontendApplication._id, fullStackApplication._id] } });

  // Refresh the existing backend demo interview so it is always in the future.
  await Interview.deleteMany({ application: backendApplication._id });
  const oldConversation = await Conversation.findOne({ application: backendApplication._id }).select("_id");
  if (oldConversation) {
    await Message.deleteMany({ conversation: oldConversation._id });
    await Conversation.deleteOne({ _id: oldConversation._id });
  }

  const interviewDate = futureDate(3, 11, 0);
  const formattedDate = interviewDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const formattedTime = interviewDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Keep demo career events available for students and admins to exercise the event workflow.
  const eventStart = futureDate(5, 10, 0);
  const eventEnd = futureDate(5, 16, 0);
  await CareerEvent.findOneAndUpdate(
    { title: "Demo Career Fair" },
    {
      $set: {
        title: "Demo Career Fair",
        description: "Meet recruiters, explore open roles and learn about placement opportunities.",
        type: "career_fair",
        startAt: eventStart,
        endAt: eventEnd,
        location: "ABC Institute of Technology",
        meetingUrl: "https://meet.google.com/demo-career-fair",
        capacity: 100,
        status: "published"
      },
      $setOnInsert: { attendees: [] }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Keep a future demo placement drive so the student drive page is not empty.
  const driveStart = futureDate(7, 9, 0);
  const driveEnd = futureDate(7, 17, 0);
  await PlacementDrive.findOneAndUpdate(
    { name: "Demo Placement Drive" },
    {
      $set: {
        name: "Demo Placement Drive",
        description: "Demo placement drive for testing student registration and company participation.",
        startAt: driveStart,
        endAt: driveEnd,
        location: "ABC Institute of Technology",
        status: "open",
        companies: [company._id]
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const interview = await Interview.create({
    application: backendApplication._id,
    student: student._id,
    company: company._id,
    scheduledAt: interviewDate,
    durationMinutes: 30,
    mode: "online",
    meetingUrl: "https://meet.google.com/demo-placement-interview",
    location: "",
    message: `Dear Demo Student,\n\nYou have been selected for an interview for the Backend Developer position at Demo Company.\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nMode: Online\nMeeting Link: https://meet.google.com/demo-placement-interview\n\nPlease join the interview on time and keep the required documents ready.\n\nBest wishes,\nDemo Company`,
    status: "scheduled"
  });

  const conversation = await Conversation.create({
    application: backendApplication._id,
    student: student._id,
    company: company._id,
    job: jobs.backend._id,
    lastMessage: "Hello! We can use this chat for interview-related communication.",
    lastMessageAt: new Date()
  });

  await Message.create({
    conversation: conversation._id,
    sender: company._id,
    body: "Hello Demo Student! We can use this chat for interview-related communication. Please let us know if you have any questions before the interview."
  });

  return {
    student,
    company,
    jobs,
    frontendApplication,
    fullStackApplication,
    backendApplication,
    interview
  };
}

module.exports = seedDemoData;

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDemoData({ reset: process.argv.includes("--reset") });
      console.log("Demo users and demo placement data are ready.");
      console.log("Demo flow: 1 applied, 1 shortlisted without interview, 1 interview scheduled, 2 unapplied jobs.");
    } catch (error) {
      console.error("Demo seed failed:", error);
      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
    }
  })();
}
