const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

exports.getJobs = async (req, res) => {
  try {
    const { q, location, minSalary, maxSalary, minCGPA, skill } = req.query;
    const filter = { status: "open" };

    if (q?.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { requiredSkills: regex }
      ];
    }

    if (location?.trim()) filter.location = new RegExp(location.trim(), "i");
    if (minSalary !== undefined && minSalary !== "") filter.salary = { ...(filter.salary || {}), $gte: Number(minSalary) };
    if (maxSalary !== undefined && maxSalary !== "") filter.salary = { ...(filter.salary || {}), $lte: Number(maxSalary) };
    if (minCGPA !== undefined && minCGPA !== "") filter.minimumCGPA = { $lte: Number(minCGPA) };
    if (skill?.trim()) filter.requiredSkills = new RegExp(skill.trim(), "i");

    const jobs = await Job.find(filter)
      .populate("company", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobById = async (
  req,
  res
) => {
  try {
    const job =
      await Job.findById(
        req.params.id
      ).populate(
        "company",
        "name email"
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    return res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error(
      "Get job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createJob = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      location,
      salary,
      minimumCGPA,
      requiredSkills,
      deadline
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required"
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is required"
      });
    }

    const parsedSalary =
      Number(salary);

    if (
      salary === undefined ||
      salary === null ||
      salary === "" ||
      !Number.isFinite(
        parsedSalary
      ) ||
      parsedSalary <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid salary"
      });
    }

    const parsedCGPA =
      Number(minimumCGPA);

    if (
      minimumCGPA === undefined ||
      minimumCGPA === null ||
      minimumCGPA === "" ||
      !Number.isFinite(
        parsedCGPA
      ) ||
      parsedCGPA < 0 ||
      parsedCGPA > 10
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid minimum CGPA between 0 and 10"
      });
    }

    const normalizedSkills =
      Array.isArray(requiredSkills)
        ? requiredSkills
          .map((skill) =>
            String(skill).trim()
          )
          .filter(Boolean)
        : typeof requiredSkills ===
          "string"
          ? requiredSkills
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean)
          : [];

    if (
      normalizedSkills.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one required skill is required"
      });
    }

    const job = await Job.create({
      company: req.user._id,
      title: title.trim(),
      description:
        description.trim(),
      location:
        location?.trim() || "",
      salary: parsedSalary,
      minimumCGPA: parsedCGPA,
      requiredSkills:
        normalizedSkills,
      deadline:
        deadline || undefined
    });

    return res.status(201).json({
      success: true,
      message:
        "Job published successfully",
      job
    });
  } catch (error) {
    console.error(
      "Create job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateJob = async (
  req,
  res
) => {
  try {
    const job =
      await Job.findOne({
        _id: req.params.id,
        company: req.user._id
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Job title is required"
        });
      }

      job.title =
        req.body.title.trim();
    }

    if (
      req.body.description !==
      undefined
    ) {
      if (
        !req.body.description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job description is required"
        });
      }

      job.description =
        req.body.description.trim();
    }

    if (
      req.body.location !==
      undefined
    ) {
      job.location =
        req.body.location;
    }

    if (
      req.body.salary !==
      undefined
    ) {
      const salary = Number(
        req.body.salary
      );

      if (
        !Number.isFinite(salary) ||
        salary <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid salary"
        });
      }

      job.salary = salary;
    }

    if (
      req.body.minimumCGPA !==
      undefined
    ) {
      const minimumCGPA =
        Number(
          req.body.minimumCGPA
        );

      if (
        !Number.isFinite(
          minimumCGPA
        ) ||
        minimumCGPA < 0 ||
        minimumCGPA > 10
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid minimum CGPA between 0 and 10"
        });
      }

      job.minimumCGPA =
        minimumCGPA;
    }

    if (
      req.body.requiredSkills !==
      undefined
    ) {
      job.requiredSkills =
        Array.isArray(
          req.body.requiredSkills
        )
          ? req.body.requiredSkills
            .map((skill) =>
              String(skill).trim()
            )
            .filter(Boolean)
          : String(
            req.body.requiredSkills
          )
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean);
    }

    if (
      req.body.deadline !==
      undefined
    ) {
      job.deadline =
        req.body.deadline ||
        undefined;
    }

    if (
      req.body.status !==
      undefined
    ) {
      job.status =
        req.body.status;
    }

    await job.save();

    return res.json({
      success: true,
      message:
        "Job updated successfully",
      job
    });
  } catch (error) {
    console.error(
      "Update job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id }).sort({ createdAt: -1 }).lean();
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        applicantCount: await Application.countDocuments({ job: job._id }),
        selectedCount: await Application.countDocuments({ job: job._id, status: "selected" })
      }))
    );

    return res.json({ success: true, jobs: jobsWithCounts });
  } catch (error) {
    console.error("Get company jobs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (
  req,
  res
) => {
  try {
    const job =
      await Job.findOne({
        _id: req.params.id,
        company: req.user._id
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found or you are not authorized to delete it"
      });
    }

    const applications =
      await Application.find({
        job: job._id
      }).select("_id");

    const applicationIds =
      applications.map(
        (application) =>
          application._id
      );

    if (
      applicationIds.length > 0
    ) {
      await Interview.deleteMany({
        application: {
          $in: applicationIds
        }
      });
    }

    await Application.deleteMany({
      job: job._id
    });

    await job.deleteOne();

    return res.json({
      success: true,
      message:
        "Job deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete job error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};