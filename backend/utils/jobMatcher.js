const normalize = v => String(v || '').trim().toLowerCase();
exports.calculateJobMatch = (job, profile = {}, academic = {}) => {
  let score = 0; const reasons = [];
  if (job.minimumCGPA != null) { if (Number(academic.cgpa ?? profile.cgpa ?? -1) >= Number(job.minimumCGPA)) { score += 25; reasons.push('CGPA requirement met'); } }
  if (Array.isArray(job.requiredSkills) && job.requiredSkills.length) {
    const skills = new Set((profile.skills || []).map(normalize)); const matched = job.requiredSkills.filter(s => skills.has(normalize(s))).length;
    score += Math.round(40 * matched / job.requiredSkills.length); if (matched) reasons.push(`${matched}/${job.requiredSkills.length} required skills matched`);
  } else { score += 40; }
  if (Array.isArray(job.eligibleBranches) && job.eligibleBranches.length) {
    if (job.eligibleBranches.some(b => normalize(b) === normalize(academic.branch || profile.branch))) { score += 20; reasons.push('Branch requirement met'); }
  } else score += 20;
  if (job.type && (profile.preferredJobTypes || []).map(normalize).includes(normalize(job.type))) { score += 10; reasons.push('Matches preferred opportunity type'); }
  return { score: Math.min(100, score), reason: reasons.join(' · ') || 'Explore this opportunity' };
};
module.exports = exports;
