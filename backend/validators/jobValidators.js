const { body } = require("express-validator");

exports.createJobValidator = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Job title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must contain at least 10 characters"),

  body("salary")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Salary cannot be negative"),

  body("minimumCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0 and 10"),

  body("deadline")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid deadline")
];
