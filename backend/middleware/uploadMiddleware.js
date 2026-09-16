const multer = require("multer");

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE },
  fileFilter: (req, file, cb) => {
    const extensionAllowed = /\.(pdf|doc|docx)$/i.test(file.originalname || "");
    if (extensionAllowed && allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only valid PDF, DOC or DOCX resumes are allowed"));
  }
});

const hasPrefix = (buffer, bytes) => {
  if (!buffer || buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
};

const containsText = (buffer, text) => buffer.toString("latin1").includes(text);

const verifyResumeSignature = (req, res, next) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "Please select a resume" });

  const name = file.originalname.toLowerCase();
  const isPdf = name.endsWith(".pdf");
  const isDoc = name.endsWith(".doc");
  const isDocx = name.endsWith(".docx");

  const pdfSignature = hasPrefix(file.buffer, Buffer.from("%PDF-"));
  const oleSignature = hasPrefix(file.buffer, Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  const zipSignature = hasPrefix(file.buffer, Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const docxStructure = zipSignature && containsText(file.buffer, "[Content_Types].xml") && containsText(file.buffer, "word/");

  const valid = (isPdf && pdfSignature) || (isDoc && oleSignature) || (isDocx && docxStructure);

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "The uploaded file content does not match its extension. Please upload a genuine PDF, DOC or DOCX resume."
    });
  }

  next();
};

module.exports = upload;
module.exports.verifyResumeSignature = verifyResumeSignature;
