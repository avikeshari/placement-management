// Returns a client-safe error message. Raw error internals (Mongo/Cloudinary
// connection strings, stack traces, file paths) are only exposed to clients in
// non-production environments for debugging; production always gets a generic
// message to avoid leaking internals.
const sanitizeError = (error, fallback = "Unable to process request") => {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }
  return (error && error.message) || fallback;
};

module.exports = sanitizeError;
