const Job = require("../models/Job");
const Application = require("../models/Application");
const AcademicRecord = require("../models/AcademicRecord");
const SavedSearch = require("../models/SavedSearch");
const Notification = require("../models/Notification");
const Profile = require("../models/Profile");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDate = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T23:59:59.999Z`);
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const validateDeadline = (value) => {
  if (!value) return { date: null };
  const date = parseDate(value);
  if (!date) return { error: "Please enter a valid application deadline" };
  if (date.getTime() <= Date.now()) {
    return { error: "Application deadline must be in the future" };
  }
  return { date };
};

const normalizeSkills = (value) => {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
};

const normalizeBranches = (value) => {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
};

const buildEligibility = (job, academicRecord) => {
  const reasons = [];
  if (!academicRecord || academicRecord.verified !== true) {
    return { eligible: false, reasons: ["Verified academic record is required"] };
  }

  if (Number.isFinite(job.minimumCGPA) && (academicRecord.cgpa === undefined || academicRecord.cgpa < job.minimumCGPA)) {
    reasons.push(`CGPA must be at least ${job.minimumCGPA}`);
  }

  if (Number.isFinite(job.maxBacklogs) && (academicRecord.backlogs ?? 0) > job.maxBacklogs) {
    reasons.push(`Maximum allowed backlogs: ${job.maxBacklogs}`);
  }

  if (job.eligibleBranches?.length) {
    const branch = String(academicRecord.branch || "").toLowerCase();
    const allowed = job.eligibleBranches.map((item) => String(item).toLowerCase());
    if (!allowed.includes(branch)) reasons.push("Your branch is not eligible for this job");
  }

  if (Number.isInteger(job.minimumGraduationYear) &&
      (!Number.isInteger(academicRecord.graduationYear) || academicRecord.graduationYear < job.minimumGraduationYear)) {
    reasons.push(`Graduation year must be ${job.minimumGraduationYear} or later`);
  }

  if (Number.isInteger(job.maximumGraduationYear) &&
      (!Number.isInteger(academicRecord.graduationYear) || academicRecord.graduationYear > job.maximumGraduationYear)) {
    reasons.push(`Graduation year must be ${job.maximumGraduationYear} or earlier`);
  }

  const requiredSkills = (job.requiredSkills || []).map((item) => String(item).toLowerCase());
  const studentSkills = new Set((academicRecord.skills || []).map((item) => String(item).toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill));
  if (missingSkills.length) {
    reasons.push(`Missing required skills: ${missingSkills.join(", ")}`);
  }

  return { eligible: reasons.length === 0, reasons };
};

exports.getJobs = async (req, res) => {
  try {
    const {
      q,
      location,
      minSalary,
      maxSalary,
      minCGPA,
      skill,
      page = 1,
      limit = 12
    } = req.query;

    const safePage = Math.min(Math.max(Number.parseInt(page, 10) || 1, 1), 10000);
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 50);
    const now = new Date();

    const filter = {
      status: "open",
      isDeleted: false,
      $or: [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gte: now } }
      ]
    };

    if (q?.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), "i");
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ title: regex }, { description: regex }, { requiredSkills: regex }] }
      ];
    }

    if (location?.trim()) filter.location = new RegExp(escapeRegex(location.trim()), "i");
    if (minSalary !== undefined && minSalary !== "" && Number.isFinite(Number(minSalary))) {
      filter.salary = { ...(filter.salary || {}), $gte: Number(minSalary) };
    }
    if (maxSalary !== undefined && maxSalary !== "" && Number.isFinite(Number(maxSalary))) {
      filter.salary = { ...(filter.salary || {}), $lte: Number(maxSalary) };
    }
    if (minCGPA !== undefined && minCGPA !== "" && Number.isFinite(Number(minCGPA))) {
      filter.minimumCGPA = { $lte: Number(minCGPA) };
    }
    if (skill?.trim()) filter.requiredSkills = new RegExp(escapeRegex(skill.trim()), "i");

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("company", "name email")
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Job.countDocuments(filter)
    ]);

    if (req.user?.role === "student") {
      const academicRecord = await AcademicRecord.findOne({ user: req.user._id }).lean();
      const studentProfile = await Profile.findOne({ user: req.user._id }).lean();
      jobs.forEach((job) => {
        job.eligibility = buildEligibility(job, academicRecord);
        const interests = new Set([...(studentProfile?.jobInterests || []), ...(studentProfile?.skills || [])].map(x => String(x).toLowerCase()));
        const text = `${job.title} ${(job.requiredSkills || []).join(" ")}`.toLowerCase();
        const matched = [...interests].filter(x => x && text.includes(x)).length;
        const locationMatch = (studentProfile?.preferredLocations || []).some(x => String(job.location || "").toLowerCase().includes(String(x).toLowerCase()));
        job.matchScore = Math.min(100, matched * 15 + (locationMatch ? 20 : 0) + (job.eligibility.eligible ? 35 : 0));
        job.recommendationReason = job.matchScore >= 70 ? "Strong match for your profile and preferences" : job.matchScore >= 40 ? "Potential match based on your interests" : "Explore this opportunity";
      });
      jobs.sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return res.json({
      success: true,
      jobs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return res.status(500).json({ success: false, message: "Unable to load jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isDeleted: false })
      .populate("company", "name email")
      .lean();

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (req.user?.role === "student") {
      const record = await AcademicRecord.findOne({ user: req.user._id }).lean();
      job.eligibility = buildEligibility(job, record);
    }

    return res.json({ success: true, job });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }
};

const validateJobFields = ({ title, description, salary, minimumCGPA, maxBacklogs }) => {
  if (!title?.trim()) return "Job title is required";
  if (title.trim().length > 100) return "Job title must be 100 characters or fewer";
  if (!description?.trim() || description.trim().length < 10) return "Job description must contain at least 10 characters";

  const parsedSalary = Number(salary);
  if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) return "Enter a valid salary";

  const parsedCGPA = Number(minimumCGPA);
  if (!Number.isFinite(parsedCGPA) || parsedCGPA < 0 || parsedCGPA > 10) return "Enter a valid minimum CGPA between 0 and 10";

  if (maxBacklogs !== undefined && maxBacklogs !== "") {
    const value = Number(maxBacklogs);
    if (!Number.isInteger(value) || value < 0) return "Maximum backlogs must be a non-negative integer";
  }

  return null;
};

exports.createJob = async (req, res) => {
  try {
    const User = require("../models/User");
    const company = await User.findOne({ _id: req.user._id, role: "company" }).select("isVerified");
    if (!company?.isVerified) return res.status(403).json({ success: false, message: "Company verification is required before publishing jobs." });
    const errorMessage = validateJobFields(req.body);
    if (errorMessage) return res.status(400).json({ success: false, message: errorMessage });

    const normalizedSkills = normalizeSkills(req.body.requiredSkills);
    if (!normalizedSkills.length) return res.status(400).json({ success: false, message: "At least one required skill is required" });

    const deadlineResult = validateDeadline(req.body.deadline);
    if (deadlineResult.error) return res.status(400).json({ success: false, message: deadlineResult.error });

    const eligibleBranches = normalizeBranches(req.body.eligibleBranches);
    const minYear = req.body.minimumGraduationYear === "" || req.body.minimumGraduationYear === undefined
      ? undefined : Number(req.body.minimumGraduationYear);
    const maxYear = req.body.maximumGraduationYear === "" || req.body.maximumGraduationYear === undefined
      ? undefined : Number(req.body.maximumGraduationYear);

    if (minYear !== undefined && (!Number.isInteger(minYear) || minYear < 2000 || minYear > 2100)) {
      return res.status(400).json({ success: false, message: "Enter a valid minimum graduation year" });
    }
    if (maxYear !== undefined && (!Number.isInteger(maxYear) || maxYear < 2000 || maxYear > 2100)) {
      return res.status(400).json({ success: false, message: "Enter a valid maximum graduation year" });
    }
    if (minYear !== undefined && maxYear !== undefined && minYear > maxYear) {
      return res.status(400).json({ success: false, message: "Minimum graduation year cannot exceed maximum graduation year" });
    }

    const job = await Job.create({
      company: req.user._id,
      title: req.body.title.trim(),
      type: req.body.type === "internship" ? "internship" : "job",
      description: req.body.description.trim(),
      location: req.body.location?.trim() || "",
      salary: Number(req.body.salary),
      minimumCGPA: Number(req.body.minimumCGPA),
      maxBacklogs: req.body.maxBacklogs === "" || req.body.maxBacklogs === undefined ? 0 : Number(req.body.maxBacklogs),
      eligibleBranches,
      minimumGraduationYear: minYear,
      maximumGraduationYear: maxYear,
      requiredSkills: normalizedSkills,
      deadline: deadlineResult.date,
      status: "open"
    });

    try {
      const searches = await SavedSearch.find({ alertsEnabled: true }).lean();
      const matches = searches.filter(search => {
        const q = search.query || {};
        const hay = `${job.title} ${job.description} ${job.location} ${(job.requiredSkills || []).join(" ")}`.toLowerCase();
        return (!q.q || hay.includes(String(q.q).toLowerCase())) && (!q.location || String(job.location || "").toLowerCase().includes(String(q.location).toLowerCase())) && (!q.skill || (job.requiredSkills || []).some(s => String(s).toLowerCase().includes(String(q.skill).toLowerCase())));
      });
      if (matches.length) await Notification.insertMany(matches.map(m => ({ user:m.user, title:"New job matches your saved search", message:`${job.title} matches your saved search.`, type:"job_alert", link:"/student/jobs" })));
    } catch (alertError) { console.error("Job alert notification failed:", alertError.message); }
    return res.status(201).json({ success: true, message: "Job published successfully", job });
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ success: false, message: "Unable to create job" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user._id, isDeleted: false });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const next = { ...job.toObject(), ...req.body };
    const errorMessage = validateJobFields(next);
    if (errorMessage) return res.status(400).json({ success: false, message: errorMessage });

    const skills = req.body.requiredSkills !== undefined ? normalizeSkills(req.body.requiredSkills) : job.requiredSkills;
    if (!skills.length) return res.status(400).json({ success: false, message: "At least one required skill is required" });

    const nextMinYear = req.body.minimumGraduationYear === "" || req.body.minimumGraduationYear === undefined ? job.minimumGraduationYear : Number(req.body.minimumGraduationYear);
    const nextMaxYear = req.body.maximumGraduationYear === "" || req.body.maximumGraduationYear === undefined ? job.maximumGraduationYear : Number(req.body.maximumGraduationYear);
    if (nextMinYear !== undefined && (!Number.isInteger(nextMinYear) || nextMinYear < 2000 || nextMinYear > 2100)) {
      return res.status(400).json({ success: false, message: "Enter a valid minimum graduation year" });
    }
    if (nextMaxYear !== undefined && (!Number.isInteger(nextMaxYear) || nextMaxYear < 2000 || nextMaxYear > 2100)) {
      return res.status(400).json({ success: false, message: "Enter a valid maximum graduation year" });
    }
    if (nextMinYear !== undefined && nextMaxYear !== undefined && nextMinYear > nextMaxYear) {
      return res.status(400).json({ success: false, message: "Minimum graduation year cannot exceed maximum graduation year" });
    }

    if (req.body.deadline !== undefined) {
      const deadlineResult = validateDeadline(req.body.deadline);
      if (deadlineResult.error) return res.status(400).json({ success: false, message: deadlineResult.error });
      job.deadline = deadlineResult.date;
    }

    if (req.body.title !== undefined) job.title = req.body.title.trim();
    if (req.body.description !== undefined) job.description = req.body.description.trim();
    if (req.body.location !== undefined) job.location = String(req.body.location).trim();
    if (req.body.salary !== undefined) job.salary = Number(req.body.salary);
    if (req.body.minimumCGPA !== undefined) job.minimumCGPA = Number(req.body.minimumCGPA);
    if (req.body.requiredSkills !== undefined) job.requiredSkills = skills;
    if (req.body.maxBacklogs !== undefined) job.maxBacklogs = Number(req.body.maxBacklogs);
    if (req.body.eligibleBranches !== undefined) job.eligibleBranches = normalizeBranches(req.body.eligibleBranches);
    if (req.body.minimumGraduationYear !== undefined) job.minimumGraduationYear = req.body.minimumGraduationYear === "" ? undefined : Number(req.body.minimumGraduationYear);
    if (req.body.maximumGraduationYear !== undefined) job.maximumGraduationYear = req.body.maximumGraduationYear === "" ? undefined : Number(req.body.maximumGraduationYear);

    if (req.body.status !== undefined) {
      const allowedTransitions = {
        draft: ["draft", "open"],
        open: ["open", "closed"],
        closed: ["closed", "open"]
      };
      if (!allowedTransitions[job.status]?.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: `Cannot change job status from ${job.status} to ${req.body.status}` });
      }
      job.status = req.body.status;
    }

    await job.save();
    return res.json({ success: true, message: "Job updated successfully", job });
  } catch (error) {
    console.error("Update job error:", error);
    return res.status(500).json({ success: false, message: "Unable to update job" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    const ids = jobs.map((job) => job._id);
    const counts = await Application.aggregate([
      { $match: { job: { $in: ids } } },
      { $group: { _id: "$job", applicants: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } } } }
    ]);
    const map = new Map(counts.map((item) => [String(item._id), item]));

    return res.json({
      success: true,
      jobs: jobs.map((job) => ({
        ...job,
        applicantCount: map.get(String(job._id))?.applicants || 0,
        selectedCount: map.get(String(job._id))?.selected || 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load company jobs" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user._id, isDeleted: false });
    if (!job) return res.status(404).json({ success: false, message: "Job not found or already deleted" });

    // Soft delete preserves applications and interview history.
    job.isDeleted = true;
    job.deletedAt = new Date();
    job.status = "closed";
    await job.save();

    return res.json({ success: true, message: "Job archived successfully. Application and interview history has been preserved." });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({ success: false, message: "Unable to archive job" });
  }
};

exports.buildEligibility = buildEligibility;
