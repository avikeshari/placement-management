const SavedCandidate = require('../models/SavedCandidate');
const User = require('../models/User');

exports.list = async (req, res) => {
  const rows = await SavedCandidate.find({ company: req.user._id })
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, candidates: rows });
};
exports.save = async (req, res) => {
  const student = await User.findOne({ _id: req.params.studentId, role: 'student', isActive: true });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  const row = await SavedCandidate.findOneAndUpdate(
    { company: req.user._id, student: student._id },
    { $setOnInsert: { company: req.user._id, student: student._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('student', 'name email');
  res.json({ success: true, candidate: row });
};
exports.remove = async (req, res) => {
  await SavedCandidate.deleteOne({ company: req.user._id, student: req.params.studentId });
  res.json({ success: true });
};
