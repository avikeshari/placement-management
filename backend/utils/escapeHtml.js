// Escape a value for safe insertion into HTML templates. Prevents stored XSS
// via user-supplied content (names, messages, cover letters, job titles, etc.)
const escapeHtml = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

module.exports = escapeHtml;
