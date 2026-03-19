/**
 * Escapes HTML special characters in a string to prevent stored XSS attacks.
 *
 * When user-provided text is stored in the database and later rendered
 * in the browser, malicious HTML/JS could execute if not sanitized first.
 * This function escapes &, <, >, ", and ' so they render as literal text
 * instead of being interpreted as HTML. It also strips any remaining HTML tags.
 *
 * @param {string} value - The user-provided string to sanitize
 * @returns {string} The sanitized string with HTML characters escaped
 */
export function sanitizeString(value) {
  if (typeof value !== "string") return value;

  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return escaped.trim();
}
