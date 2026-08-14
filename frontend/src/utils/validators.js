export const validateJob = (form) => {
  const errors = {};

  if (!form.title?.trim()) {
    errors.title = "Job title is required.";
  } else if (form.title.trim().length < 3) {
    errors.title =
      "Job title must contain at least 3 characters.";
  }

  if (!form.description?.trim()) {
    errors.description = "Description is required.";
  }

  if (
    form.minimumCGPA !== "" &&
    form.minimumCGPA !== undefined &&
    (Number(form.minimumCGPA) < 0 ||
      Number(form.minimumCGPA) > 10)
  ) {
    errors.minimumCGPA =
      "CGPA must be between 0 and 10.";
  }

  if (
    form.salary !== "" &&
    form.salary !== undefined &&
    Number(form.salary) < 0
  ) {
    errors.salary = "Salary cannot be negative.";
  }

  if (
    form.deadline &&
    new Date(form.deadline) < new Date()
  ) {
    errors.deadline =
      "Deadline cannot be in the past.";
  }

  return errors;
};
