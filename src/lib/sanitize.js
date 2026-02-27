/**
 * Removes HTML tags from a string to prevent stored XSS attacks.
 *
 * When user-provided text is stored in the database and later rendered
 * in the browser, malicious HTML/JS could execute if not sanitized first.
 * This function strips all HTML tags before the value reaches the database.
 *
 * @param {string} value - The user-provided string to sanitize
 * @returns {string} The sanitized string with HTML tags removed
 */
export function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>/g, "").trim();
}
