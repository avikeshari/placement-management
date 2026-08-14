const axios = require("axios");

const createDailyRoom = async ({ applicationId, scheduledAt }) => {
  const start = new Date(scheduledAt);

  const expiry = new Date(
    start.getTime() + 2 * 60 * 60 * 1000
  );

  const response = await axios.post(
    "https://api.daily.co/v1/rooms",
    {
      name: `interview-${applicationId}-${Date.now()}`,
      privacy: "public",
      properties: {
        exp: Math.floor(expiry.getTime() / 1000)
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};

module.exports = { createDailyRoom };
