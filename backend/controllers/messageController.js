const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const canUseConversation = (conversation, userId) =>
  String(conversation.student) === String(userId) ||
  String(conversation.company) === String(userId);

const getConversationForUser = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return { error: { status: 404, message: "Conversation not found" } };
  if (!canUseConversation(conversation, userId)) {
    return { error: { status: 403, message: "You are not authorized to access this conversation" } };
  }
  return { conversation };
};

exports.getMyConversations = async (req, res) => {
  try {
    const filter = req.user.role === "student"
      ? { student: req.user._id }
      : { company: req.user._id };

    const conversations = await Conversation.find(filter)
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("job", "title location")
      .populate("application", "status")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.json({ success: true, conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ success: false, message: "Unable to load conversations" });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const result = await getConversationForUser(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });

    const messages = await Message.find({ conversation: result.conversation._id })
      .populate("sender", "name role")
      .sort({ createdAt: 1 })
      .limit(500);

    await Message.updateMany(
      {
        conversation: result.conversation._id,
        sender: { $ne: req.user._id },
        readAt: null
      },
      { $set: { readAt: new Date() } }
    );

    return res.json({ success: true, conversation: result.conversation, messages });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    return res.status(500).json({ success: false, message: "Unable to load messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ success: false, message: "Message cannot be empty" });
    if (body.length > 2000) return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters" });

    const result = await getConversationForUser(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });

    const message = await Message.create({
      conversation: result.conversation._id,
      sender: req.user._id,
      body
    });

    await Conversation.findByIdAndUpdate(result.conversation._id, {
      $set: { lastMessage: body, lastMessageAt: new Date() }
    });

    await message.populate("sender", "name role");

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ success: false, message: "Unable to send message" });
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const result = await getConversationForUser(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });

    await Message.updateMany(
      { conversation: result.conversation._id, sender: { $ne: req.user._id }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return res.json({ success: true, message: "Conversation marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update conversation" });
  }
};
