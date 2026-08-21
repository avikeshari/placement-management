const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_FROM"
];

const validateEnvironment = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim() === "";
  });

  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
  }

  const emailPort = Number(process.env.EMAIL_PORT);
  if (!Number.isInteger(emailPort) || emailPort <= 0 || emailPort > 65535) {
    throw new Error("EMAIL_PORT must be a valid TCP port number");
  }

  if (process.env.PORT !== undefined) {
    const port = Number(process.env.PORT);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error("PORT must be a valid TCP port number");
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    frontendUrl: process.env.FRONTEND_URL.replace(/\/$/, "")
  };
};

module.exports = validateEnvironment;
