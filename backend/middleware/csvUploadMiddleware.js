const multer = require("multer");

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      return cb(null, true);
    }

    cb(new Error("Only CSV files are allowed"));
  }
});

module.exports = csvUpload;
