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

// These accounts are intentionally deterministic so a demo database can be
// refreshed safely without creating duplicate users on every seed run.
const demoStudents = [
  {
    name: "Demo Student",
    email: "student.demo@aviportal.com",
    password: "Student@123",
    profile: {
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
      preferredJobTypes: ["job", "internship"],
      experience: ["Campus web development project"],
      projects: ["Placement Portal", "Student Task Manager"],
      certifications: ["JavaScript Fundamentals", "Git Essentials"]
    },
    academic: {
      enrollmentNumber: "DEMO-CSE-001",
      branch: "Computer Science and Engineering",
      graduationYear: 2027,
      cgpa: 8.7,
      backlogs: 0,
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git", "HTML", "CSS", "REST API", "Express"]
    }
  },
  {
    name: "Demo Student 2",
    email: "student2.demo@aviportal.com",
    password: "Student2@123",
    profile: {
      phone: "+91 98765 43211",
      college: "ABC Institute of Technology",
      course: "B.Tech",
      branch: "Information Technology",
      graduationYear: 2027,
      cgpa: 8.1,
      skills: ["Java", "Spring Boot", "SQL", "Git", "REST API"],
      location: "Lucknow, Uttar Pradesh",
      privacy: "employers",
      shareGpaWithEmployers: true,
      jobInterests: ["Backend Developer", "Java Developer", "Software Engineer"],
      preferredLocations: ["Noida", "Bengaluru", "Hyderabad"],
      preferredJobTypes: ["job", "internship"],
      experience: ["Backend internship project"],
      projects: ["Inventory API", "College ERP Module"],
      certifications: ["Java Programming", "SQL Basics"]
    },
    academic: {
      enrollmentNumber: "DEMO-IT-002",
      branch: "Information Technology",
      graduationYear: 2027,
      cgpa: 8.1,
      backlogs: 0,
      skills: ["Java", "Spring Boot", "SQL", "Git", "REST API"]
    }
  },
  {
    name: "Demo Student 3",
    email: "student3.demo@aviportal.com",
    password: "Student3@123",
    profile: {
      phone: "+91 98765 43212",
      college: "ABC Institute of Technology",
      course: "B.Tech",
      branch: "Electronics and Communication Engineering",
      graduationYear: 2026,
      cgpa: 7.8,
      skills: ["Python", "SQL", "Excel", "Power BI", "Data Analysis"],
      location: "Jaipur, Rajasthan",
      privacy: "employers",
      shareGpaWithEmployers: true,
      jobInterests: ["Data Analyst", "Business Analyst", "Data Operations"],
      preferredLocations: ["Pune", "Hyderabad", "Remote"],
      preferredJobTypes: ["job", "internship"],
      experience: ["Academic analytics project"],
      projects: ["Placement Analytics Dashboard", "Sales Trend Analysis"],
      certifications: ["Excel Analytics", "Power BI Fundamentals"]
    },
    academic: {
      enrollmentNumber: "DEMO-ECE-003",
      branch: "Electronics and Communication Engineering",
      graduationYear: 2026,
      cgpa: 7.8,
      backlogs: 0,
      skills: ["Python", "SQL", "Excel", "Power BI", "Data Analysis"]
    }
  },
  {
    name: "Demo Student 4",
    email: "student4.demo@aviportal.com",
    password: "Student4@123",
    profile: {
      phone: "+91 98765 43213",
      college: "ABC Institute of Technology",
      course: "B.Tech",
      branch: "Computer Science and Engineering",
      graduationYear: 2028,
      cgpa: 7.2,
      skills: ["HTML", "CSS", "JavaScript", "Figma", "Git"],
      location: "Kanpur, Uttar Pradesh",
      privacy: "employers",
      shareGpaWithEmployers: true,
      jobInterests: ["Frontend Developer", "UI Developer", "Web Intern"],
      preferredLocations: ["Noida", "Delhi", "Remote"],
      preferredJobTypes: ["internship", "job"],
      experience: ["Frontend course project"],
      projects: ["Campus Events Website", "Portfolio Website"],
      certifications: ["Responsive Web Design"]
    },
    academic: {
      enrollmentNumber: "DEMO-CSE-004",
      branch: "Computer Science and Engineering",
      graduationYear: 2028,
      cgpa: 7.2,
      backlogs: 1,
      skills: ["HTML", "CSS", "JavaScript", "Figma", "Git"]
    }
  }
];

const demoCompanies = [
  {
    name: "Demo Company",
    email: "company.demo@aviportal.com",
    password: "Company@123",
    profile: {
      phone: "+91 98765 12345",
      website: "https://example.com",
      industry: "Information Technology",
      description: "Demo technology company hiring students for software and graduate roles.",
      location: "Bengaluru, Karnataka"
    }
  },
  {
    name: "Demo Analytics Co.",
    email: "company2.demo@aviportal.com",
    password: "Company2@123",
    profile: {
      phone: "+91 98765 22345",
      website: "https://example.com/analytics",
      industry: "Data & Analytics",
      description: "Demo analytics organization recruiting graduates for data and business roles.",
      location: "Pune, Maharashtra"
    }
  },
  {
    name: "Demo FinTech Labs",
    email: "company3.demo@aviportal.com",
    password: "Company3@123",
    profile: {
      phone: "+91 98765 32345",
      website: "https://example.com/fintech",
      industry: "Financial Technology",
      description: "Demo fintech employer with software engineering and product opportunities.",
      location: "Hyderabad, Telangana"
    }
  }
];

const admin = {
  name: "Demo Admin",
  email: "admin.demo@aviportal.com",
  password: "Admin@123",
  role: "admin"
};

const demoResumeUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function upsertDemoUser(demo, role) {
  const password = await bcrypt.hash(demo.password, 12);
  return User.findOneAndUpdate(
    { email: demo.email },
    {
      $set: {
        name: demo.name,
        email: demo.email,
        password,
        role,
        isActive: true,
        isVerified: role === "company" || role === "admin"
      }
    },
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

async function upsertProfile(user, profile) {
  return Profile.findOneAndUpdate(
    { user: user._id },
    { $set: profile, $setOnInsert: { user: user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertAcademicRecord(user, academic) {
  return AcademicRecord.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        user: user._id,
        studentEmail: user.email,
        college: "ABC Institute of Technology",
        course: "B.Tech",
        ...academic,
        verified: true
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function ensureApplication({ studentId, job, status, note = "" }) {
  const application = await Application.findOneAndUpdate(
    { student: studentId, job: job._id },
    {
      $set: {
        status,
        statusUpdatedAt: new Date(),
        statusHistory: [{ status, at: new Date(), note }],
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
  const studentUsers = [];
  const companyUsers = [];

  for (const studentData of demoStudents) {
    const user = await upsertDemoUser(studentData, "student");
    studentUsers.push(user);
    await upsertProfile(user, studentData.profile);
    await upsertAcademicRecord(user, studentData.academic);

    const existingProfile = await Profile.findOne({ user: user._id });
    if (!existingProfile?.resume?.url) {
      await Profile.findOneAndUpdate(
        { user: user._id },
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
  }

  for (const companyData of demoCompanies) {
    const user = await upsertDemoUser(companyData, "company");
    companyUsers.push(user);
    await upsertProfile(user, companyData.profile);
  }

  await upsertDemoUser(admin, "admin");

  if (reset) {
    const demoCompanyIds = companyUsers.map((company) => company._id);
    const jobs = await Job.find({ company: { $in: demoCompanyIds } }).select("_id");
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
    eligibleBranches: ["Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering"],
    minimumGraduationYear: 2026,
    maximumGraduationYear: 2028
  };

  const company1 = companyUsers[0];
  const company2 = companyUsers[1];
  const company3 = companyUsers[2];
  const [student1, student2, student3, student4] = studentUsers;

  const jobs = {};

  jobs.frontend = await upsertDemoJob(company1._id, {
    title: "Frontend Developer",
    description: "Build responsive React interfaces, collaborate with backend engineers, write maintainable components, and participate in code reviews.",
    location: "Bengaluru / Hybrid",
    salary: 900000,
    ...commonEligibility,
    requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    deadline: futureDate(14)
  });

  jobs.backend = await upsertDemoJob(company1._id, {
    title: "Backend Developer",
    description: "Develop REST APIs using Node.js and Express, work with MongoDB, implement authentication, and support production deployments.",
    location: "Remote",
    salary: 1000000,
    ...commonEligibility,
    minimumCGPA: 8,
    requiredSkills: ["Node.js", "Express", "MongoDB", "REST API", "Git"],
    deadline: futureDate(21)
  });

  jobs.fullStack = await upsertDemoJob(company1._id, {
    title: "Full Stack Developer",
    description: "Work across React frontend and Node.js backend services, build APIs, integrate databases, and deliver complete web features.",
    location: "Bengaluru / Hybrid",
    salary: 1100000,
    ...commonEligibility,
    requiredSkills: ["React", "Node.js", "JavaScript", "MongoDB"],
    deadline: futureDate(28)
  });

  jobs.qa = await upsertDemoJob(company1._id, {
    title: "QA Engineer",
    description: "Design test cases, perform functional testing, report defects, and help maintain software quality across web applications.",
    location: "Pune / Hybrid",
    salary: 700000,
    ...commonEligibility,
    requiredSkills: ["Testing", "JavaScript", "Git"],
    deadline: futureDate(35)
  });

  jobs.data = await upsertDemoJob(company2._id, {
    title: "Data Analyst",
    description: "Analyze business data, prepare dashboards, identify trends, and communicate actionable insights to product and business teams.",
    location: "Remote",
    salary: 800000,
    ...commonEligibility,
    minimumCGPA: 7,
    requiredSkills: ["SQL", "Excel", "Python"],
    deadline: futureDate(42)
  });

  jobs.businessAnalyst = await upsertDemoJob(company2._id, {
    title: "Business Analyst Intern",
    type: "internship",
    description: "Support requirement gathering, dashboard preparation, process analysis and stakeholder communication.",
    location: "Pune / Hybrid",
    salary: 350000,
    ...commonEligibility,
    minimumCGPA: 7,
    requiredSkills: ["Excel", "SQL", "Communication"],
    deadline: futureDate(49)
  });

  jobs.softwareEngineer = await upsertDemoJob(company3._id, {
    title: "Software Engineer",
    description: "Build secure fintech services, write automated tests, review code and collaborate with product engineers.",
    location: "Hyderabad / Hybrid",
    salary: 1200000,
    ...commonEligibility,
    minimumCGPA: 8,
    requiredSkills: ["JavaScript", "Node.js", "SQL", "Git"],
    deadline: futureDate(56)
  });

  jobs.productIntern = await upsertDemoJob(company3._id, {
    title: "Product Engineering Intern",
    type: "internship",
    description: "Work with product and engineering teams to prototype features, document requirements and improve user workflows.",
    location: "Hyderabad / Hybrid",
    salary: 300000,
    ...commonEligibility,
    minimumCGPA: 7,
    requiredSkills: ["JavaScript", "Figma", "Communication", "Git"],
    deadline: futureDate(63)
  });

  // Ensure these two roles remain genuinely unapplied for demo testing.
  await removeApplicationAndInterview(student1._id, jobs.qa._id);
  await removeApplicationAndInterview(student1._id, jobs.data._id);

  // Main demo student: applied, shortlisted, interview-ready and selected/rejected examples.
  const frontendApplication = await ensureApplication({
    studentId: student1._id,
    job: jobs.frontend,
    status: "applied",
    note: "Application submitted by demo student."
  });

  const fullStackApplication = await ensureApplication({
    studentId: student1._id,
    job: jobs.fullStack,
    status: "shortlisted",
    note: "Shortlisted for technical discussion."
  });

  const backendApplication = await ensureApplication({
    studentId: student1._id,
    job: jobs.backend,
    status: "interview",
    note: "Interview scheduled."
  });

  await Interview.deleteMany({ application: { $in: [frontendApplication._id, fullStackApplication._id] } });

  // Additional applications create realistic cross-student/company demo data.
  await ensureApplication({ studentId: student2._id, job: jobs.backend, status: "shortlisted", note: "Shortlisted based on backend skills." });
  await ensureApplication({ studentId: student2._id, job: jobs.softwareEngineer, status: "applied", note: "Application submitted." });
  await ensureApplication({ studentId: student3._id, job: jobs.data, status: "selected", note: "Selected after the demo recruitment process." });
  await ensureApplication({ studentId: student3._id, job: jobs.businessAnalyst, status: "shortlisted", note: "Shortlisted for business case discussion." });
  await ensureApplication({ studentId: student4._id, job: jobs.productIntern, status: "applied", note: "Application submitted by demo student." });
  await ensureApplication({ studentId: student4._id, job: jobs.frontend, status: "rejected", note: "Demo rejected application for status-history testing." });
  await ensureApplication({ studentId: student2._id, job: jobs.businessAnalyst, status: "withdrawn", note: "Demo student withdrew the application." });

  // Remove stale interviews for the main demo interview and recreate it in the future.
  await Interview.deleteMany({ application: backendApplication._id });
  const oldConversations = await Conversation.find({ application: backendApplication._id }).select("_id");
  const oldConversationIds = oldConversations.map((item) => item._id);
  if (oldConversationIds.length) await Message.deleteMany({ conversation: { $in: oldConversationIds } });
  await Conversation.deleteMany({ application: backendApplication._id });

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

  const interview = await Interview.create({
    application: backendApplication._id,
    student: student1._id,
    company: company1._id,
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
    student: student1._id,
    company: company1._id,
    job: jobs.backend._id,
    lastMessage: "Hello! We can use this chat for interview-related communication.",
    lastMessageAt: new Date()
  });

  await Message.create({
    conversation: conversation._id,
    sender: company1._id,
    body: "Hello Demo Student! We can use this chat for interview-related communication. Please let us know if you have any questions before the interview."
  });

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
        companies: companyUsers.map((company) => company._id)
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    students: studentUsers,
    companies: companyUsers,
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
      const result = await seedDemoData({ reset: process.argv.includes("--reset") });
      console.log("Demo users and demo placement data are ready.");
      console.log(`Demo data: ${result.students.length} students, ${result.companies.length} companies, ${Object.keys(result.jobs).length} jobs, and multiple application states.`);
      console.log("Demo flow: 1 applied, 1 shortlisted without interview, 1 interview scheduled, 2 unapplied jobs.");
      console.log("Additional demo flow: selected, rejected, withdrawn, applied and shortlisted applications across multiple students and companies.");
    } catch (error) {
      console.error("Demo seed failed:", error);
      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
    }
  })();
}
