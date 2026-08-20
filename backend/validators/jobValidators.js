const { body } = require("express-validator");

const parseDeadline = (value) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T23:59:59.999Z`);
  return new Date(value);
};

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
    .notEmpty()
    .isFloat({ gt: 0 })
    .withMessage("Salary must be greater than 0"),
  body("minimumCGPA")
    .notEmpty()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0 and 10"),
  body("deadline")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Please enter a valid application deadline")
    .custom((value) => {
      const deadline = parseDeadline(value);
      if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
        throw new Error("Application deadline must be in the future");
      }
      return true;
    })
];
