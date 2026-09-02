const User = require("../models/User");
const Profile = require("../models/Profile");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const AcademicRecord = require("../models/AcademicRecord");
const sanitizeError = require("../utils/sanitizeError");

const csvEscape = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const sendCsv = (res, filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  return res.send(csv);
};

exports.getStats = async (req, res) => {
  try {
    const [
      students,
      companies,
      jobs,
      openJobs,
      applications,
      shortlisted,
      interviews,
      selected,
      rejected,
      offersAccepted,
      placedStudents,
      salaryStats
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "company" }),
      Job.countDocuments({ isDeleted: false }),
      Job.countDocuments({ status: "open", isDeleted: false }),
      Application.countDocuments(),
      Application.countDocuments({ status: "shortlisted" }),
      Interview.countDocuments(),
      Application.countDocuments({ status: "selected" }),
      Application.countDocuments({ status: "rejected" }),
      Application.countDocuments({ status: "selected", offerStatus: "accepted" }),
      Application.distinct("student", { status: "selected" }),
      Job.aggregate([
        { $match: { isDeleted: false, salary: { $type: "number", $gt: 0 } } },
        {
          $group: {
            _id: null,
            average: { $avg: "$salary" },
            highest: { $max: "$salary" },
            lowest: { $min: "$salary" }
          }
        }
      ])
    ]);

    const placementRate = students
      ? Number(((placedStudents.length / students) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      stats: {
        students,
        companies,
        jobs,
        openJobs,
        applications,
        shortlisted,
        interviews,
        selected,
        rejected,
        offersAccepted,
        placements: placedStudents.length,
        placementRate,
        averageSalary: Math.round(salaryStats[0]?.average || 0),
        highestSalary: salaryStats[0]?.highest || 0,
        lowestSalary: salaryStats[0]?.lowest || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email role isActive isVerified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const ids = students.map((student) => student._id);
    const profiles = await Profile.find({ user: { $in: ids } }).lean();
    const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));

    const counts = await Application.aggregate([
      { $match: { student: { $in: ids } } },
      { $group: { _id: "$student", applications: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      students: students.map((student) => ({
        ...student,
        profile: profileMap.get(String(student._id)) || null,
        applications: countMap.get(String(student._id))?.applications || 0,
        selected: countMap.get(String(student._id))?.selected || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: "company" })
      .select("name email role isActive isVerified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const ids = companies.map((company) => company._id);
    const jobs = await Job.aggregate([
      { $match: { company: { $in: ids }, isDeleted: false } },
      { $group: { _id: "$company", jobs: { $sum: 1 }, openJobs: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } } } }
    ]);
    const jobMap = new Map(jobs.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      companies: companies.map((company) => ({
        ...company,
        jobs: jobMap.get(String(company._id))?.jobs || 0,
        openJobs: jobMap.get(String(company._id))?.openJobs || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isDeleted: false })
      .populate("company", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const ids = jobs.map((job) => job._id);
    const counts = await Application.aggregate([
      { $match: { job: { $in: ids } } },
      { $group: { _id: "$job", applicants: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      jobs: jobs.map((job) => ({
        ...job,
        applicants: countMap.get(String(job._id))?.applicants || 0,
        selected: countMap.get(String(job._id))?.selected || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .select("-coverLetter -screeningAnswers -statusHistory -rejectionReason -withdrawalReason -resume")
      .populate("student", "name email")
      .populate("job", "title location salary company")
      .sort({ createdAt: -1 })
      .lean();

    await Application.populate(applications, {
      path: "job.company",
      select: "name email"
    });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("student", "name email")
      .populate("company", "name email")
      .populate({
        path: "application",
        populate: { path: "job", select: "title location" }
      })
      .sort({ scheduledAt: 1 })
      .lean();

    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [applicationsByMonth, placementsByBranch, placementsByCompany] = await Promise.all([
      Application.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]),
      Application.aggregate([
        { $match: { status: "selected" } },
        { $lookup: { from: "profiles", localField: "student", foreignField: "user", as: "profile" } },
        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$profile.branch", "Unknown"] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Application.aggregate([
        { $match: { status: "selected" } },
        { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "job" } },
        { $unwind: "$job" },
        { $lookup: { from: "users", localField: "job.company", foreignField: "_id", as: "company" } },
        { $unwind: "$company" },
        { $group: { _id: "$company.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        applicationsByMonth: applicationsByMonth.map((item) => ({ month: item._id, count: item.count })),
        placementsByBranch: placementsByBranch.map((item) => ({ branch: item._id, count: item.count })),
        placementsByCompany: placementsByCompany.map((item) => ({ company: item._id, count: item.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["student", "company"] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = Boolean(req.body.isActive);
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "Account activated" : "Account deactivated",
      user: { _id: user._id, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["student", "company"] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "student") {
      const applications = await Application.find({ student: user._id }).select("_id");
      const applicationIds = applications.map((item) => item._id);

      await Interview.deleteMany({
        $or: [
          { student: user._id },
          { application: { $in: applicationIds } }
        ]
      });
      await Application.deleteMany({ student: user._id });
      await Profile.deleteOne({ user: user._id });
      await AcademicRecord.deleteMany({ studentEmail: user.email });
    } else {
      const jobs = await Job.find({ company: user._id }).select("_id");
      const jobIds = jobs.map((job) => job._id);
      const applications = await Application.find({ job: { $in: jobIds } }).select("_id");
      const applicationIds = applications.map((item) => item._id);

      await Interview.deleteMany({
        $or: [
          { company: user._id },
          { application: { $in: applicationIds } }
        ]
      });
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ company: user._id });
      await Profile.deleteOne({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.isDeleted = true;
    job.deletedAt = new Date();
    job.status = "closed";
    await job.save();

    res.json({ success: true, message: "Job archived successfully. Application and interview history has been preserved." });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.getDriveReport=async(req,res)=>{try{const Drive=require("../models/PlacementDrive");const Application=require("../models/Application");const Interview=require("../models/Interview");const Job=require("../models/Job");const drives=await Drive.find().populate("companies","name").lean();const rows=[];for(const d of drives){const companyIds=(d.companies||[]).map(c=>c._id);const participantIds=d.participants||[];const jobs=await Job.find({company:{$in:companyIds},isDeleted:{$ne:true}}).select("_id").lean();const applications=await Application.find({job:{$in:jobs.map(j=>j._id)},student:{$in:participantIds}}).select("_id status offerStatus").lean();const interviews=applications.length?await Interview.countDocuments({application:{$in:applications.map(a=>a._id)},status:{$ne:"cancelled"}}):0;const offersMade=applications.filter(a=>a.status==="selected").length;const offersAccepted=applications.filter(a=>a.status==="selected"&&a.offerStatus==="accepted").length;const success=participantIds.length?((offersAccepted/participantIds.length)*100).toFixed(1):"0.0";rows.push([d.name,d.startAt?.toISOString(),d.endAt?.toISOString(),d.status,(d.companies||[]).map(c=>c.name).join("; "),participantIds.length,applications.length,interviews,offersMade,offersAccepted,success+"%"]);}return sendCsv(res,"placement-drives.csv",["Drive","Start","End","Status","Companies","Participants","Applications","Interviews","Offers Made","Offers Accepted","Placement Success Rate"],rows);}catch(e){res.status(500).json({success:false,message:e.message});}};

exports.getReport = async (req, res) => {
  try {
    const { type } = req.params;

    if (type === "students") {
      const students = await User.find({ role: "student" }).select("name email isActive createdAt").lean();
      return sendCsv(
        res,
        "students.csv",
        ["Name", "Email", "Status", "Registered"],
        students.map((item) => [item.name, item.email, item.isActive === false ? "Inactive" : "Active", item.createdAt?.toISOString()])
      );
    }

    if (type === "companies") {
      const companies = await User.find({ role: "company" }).select("name email isActive createdAt").lean();
      return sendCsv(
        res,
        "companies.csv",
        ["Company", "Email", "Status", "Registered"],
        companies.map((item) => [item.name, item.email, item.isActive === false ? "Inactive" : "Active", item.createdAt?.toISOString()])
      );
    }

    if (type === "jobs") {
      const jobs = await Job.find().populate("company", "name").lean();
      return sendCsv(
        res,
        "jobs.csv",
        ["Title", "Company", "Location", "Salary", "Minimum CGPA", "Status", "Deadline"],
        jobs.map((item) => [item.title, item.company?.name, item.location, item.salary, item.minimumCGPA, item.status, item.deadline?.toISOString()])
      );
    }

    if (type === "applications") {
      const applications = await Application.find()
        .populate("student", "name email")
        .populate("job", "title")
        .lean();
      return sendCsv(
        res,
        "applications.csv",
        ["Student", "Student Email", "Job", "Status", "Applied On"],
        applications.map((item) => [item.student?.name, item.student?.email, item.job?.title, item.status, item.createdAt?.toISOString()])
      );
    }

    if (type === "placements") {
      const applications = await Application.find({ status: "selected" })
        .populate("student", "name email")
        .populate({ path: "job", select: "title salary", populate: { path: "company", select: "name" } })
        .lean();
      return sendCsv(
        res,
        "placements.csv",
        ["Student", "Student Email", "Company", "Job", "Salary", "Selected On"],
        applications.map((item) => [item.student?.name, item.student?.email, item.job?.company?.name, item.job?.title, item.job?.salary, item.createdAt?.toISOString()])
      );
    }

    return res.status(400).json({ success: false, message: "Unknown report type" });
  } catch (error) {
    res.status(500).json({ success: false, message: sanitizeError(error) });
  }
};

exports.exportCompanyDatabase=async(req,res)=>{try{const companies=await User.find({role:"company"}).lean();const profiles=await Profile.find({user:{$in:companies.map(x=>x._id)}}).lean();const map=new Map(profiles.map(x=>[String(x.user),x]));return sendCsv(res,"company-database.csv",["Name","Email","Phone","Industry","Website","Location","Description"],companies.map(c=>{const p=map.get(String(c._id))||{};return [c.name,c.email,p.phone,p.industry,p.website,p.location,p.description];}));}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.importCompanyDatabase=async(req,res)=>{try{if(!req.file)return res.status(400).json({success:false,message:"Please upload a CSV file"});const csv=require("csv-parser");const {Readable}=require("stream");const rows=[];await new Promise((resolve,reject)=>Readable.from(req.file.buffer).pipe(csv()).on("data",r=>rows.push(r)).on("end",resolve).on("error",reject));const entries=[];for(const row of rows){const email=String(row.email||row.Email||"").trim().toLowerCase();if(!email)continue;entries.push({email,row});}let count=0;if(entries.length){const emails=[...new Set(entries.map(e=>e.email))];const users=await User.find({email:{$in:emails},role:"company"}).select("_id email").lean();const userByEmail=new Map(users.map(u=>[u.email.toLowerCase(),u]));const ops=[];for(const {email,row} of entries){const user=userByEmail.get(email);if(!user)continue;ops.push({updateOne:{filter:{user:user._id},update:{$set:{phone:row.phone||row.Phone||"",industry:row.industry||row.Industry||"",website:row.website||row.Website||"",location:row.location||row.Location||"",description:row.description||row.Description||""}},upsert:true}});}if(ops.length){await Profile.bulkWrite(ops,{ordered:false});count=ops.length;}}res.json({success:true,message:`Updated ${count} existing company records`});}catch(e){res.status(500).json({success:false,message:"Unable to import company CSV"});}};
