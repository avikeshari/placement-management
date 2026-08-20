const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getMyConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead
} = require("../controllers/messageController");

const router = express.Router();
const messagingRoles = authorize("student", "company");

router.get("/", protect, messagingRoles, getMyConversations);
router.get("/:id/messages", protect, messagingRoles, getConversationMessages);
router.post("/:id/messages", protect, messagingRoles, sendMessage);
router.patch("/:id/read", protect, messagingRoles, markConversationRead);

module.exports = router;
