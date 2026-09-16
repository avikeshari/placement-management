const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (
  buffer,
  originalName
) => {
  return new Promise((resolve, reject) => {
    const extension =
      (
        originalName?.match(
          /\.([^.]+)$/
        )?.[1] || "pdf"
      ).toLowerCase();

    const baseName =
      (originalName || "resume")
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      "resume";

    /*
     * Let Cloudinary detect the asset type.
     * PDFs are handled as image assets, while
     * DOC/DOCX are handled as raw assets.
     */
    const publicId =
      `placement-resumes/${baseName}-${Date.now()}`;

    const stream =
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: publicId,
          use_filename: false,
          unique_filename: false,
          filename_override: originalName
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve({
            ...result,
            originalName,
            originalExtension: extension
          });
        }
      );

    streamifier
      .createReadStream(buffer)
      .pipe(stream);
  });
};

module.exports = uploadToCloudinary;
