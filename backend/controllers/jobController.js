const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

exports.getJobs = async (
  req,
  res
) => {
  try {
    const jobs =
      await Job.find({
        status: "open"
      })
        .populate(
          "company",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    return res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error(
      "Get jobs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
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
      skills,
      deadline
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job title is required"
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
        message:
          "Enter a valid salary"
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

    /*
     * Accept requiredSkills as the
     * preferred field and skills as
     * a backward-compatible fallback.
     */
    const incomingSkills =
      requiredSkills !==
        undefined
        ? requiredSkills
        : skills;

    const normalizedSkills =
      Array.isArray(
        incomingSkills
      )
        ? incomingSkills
          .map((skill) =>
            String(skill).trim()
          )
          .filter(Boolean)
        : typeof incomingSkills ===
          "string"
          ? incomingSkills
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean)
          : [];

    if (
      normalizedSkills.length ===
      0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one required skill is required"
      });
    }

    const job =
      await Job.create({
        company: req.user._id,
        title: title.trim(),
        description:
          description.trim(),
        location:
          location?.trim() || "",
        salary: parsedSalary,
        minimumCGPA:
          parsedCGPA,
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

    if (
      req.body.title !==
      undefined
    ) {
      if (
        !String(
          req.body.title
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job title is required"
        });
      }

      job.title =
        String(
          req.body.title
        ).trim();
    }

    if (
      req.body.description !==
      undefined
    ) {
      if (
        !String(
          req.body.description
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job description is required"
        });
      }

      job.description =
        String(
          req.body.description
        ).trim();
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
      if (
        req.body.salary ===
        "" ||
        req.body.salary ===
        null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid salary"
        });
      }

      const salary =
        Number(
          req.body.salary
        );

      if (
        !Number.isFinite(
          salary
        ) ||
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
      if (
        req.body.minimumCGPA ===
        "" ||
        req.body.minimumCGPA ===
        null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid minimum CGPA between 0 and 10"
        });
      }

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

    /*
     * Accept both fields for
     * compatibility with existing
     * frontend code.
     */
    const incomingSkills =
      req.body.requiredSkills !==
        undefined
        ? req.body.requiredSkills
        : req.body.skills;

    if (
      incomingSkills !==
      undefined
    ) {
      const normalizedSkills =
        Array.isArray(
          incomingSkills
        )
          ? incomingSkills
            .map((skill) =>
              String(skill).trim()
            )
            .filter(Boolean)
          : String(
            incomingSkills
          )
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean);

      if (
        normalizedSkills.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one required skill is required"
        });
      }

      job.requiredSkills =
        normalizedSkills;
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

exports.getMyJobs = async (
  req,
  res
) => {
  try {
    const jobs =
      await Job.find({
        company: req.user._id
      }).sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error(
      "Get company jobs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
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
      applicationIds.length >
      0
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