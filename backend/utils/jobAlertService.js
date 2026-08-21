const SavedSearch = require('../models/SavedSearch');
const Notification = require('../models/Notification');
const escape = v => String(v || '').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
exports.alertForJob = async job => {
  const searches = await SavedSearch.find({ alertsEnabled: true });
  const ops = [];
  for (const s of searches) {
    const q = s.query || {};
    const hay = `${job.title} ${job.description} ${job.location} ${job.type}`.toLowerCase();
    const terms = [q.q, q.keyword, q.location, q.type].filter(Boolean).map(String);
    if (!terms.length || terms.every(t => hay.includes(t.toLowerCase()))) {
      ops.push({ insertOne: { document: { user: s.user, title: 'New job matches your saved search', message: `${job.title} matches ${s.name}`, type: 'job', link: `/student/jobs/${job._id}` } } });
    }
  }
  if (ops.length) await Notification.bulkWrite(ops);
};
exports.escapeRegex = escape;
