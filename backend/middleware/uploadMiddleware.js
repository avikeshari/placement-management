const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const validExtension = /\.(pdf|doc|docx)$/i.test(file.originalname);

    if (allowedTypes.includes(file.mimetype) || validExtension) {
      return cb(null, true);
    }

    cb(new Error("Only PDF, DOC and DOCX files are allowed"));
  }
});

module.exports = upload;
