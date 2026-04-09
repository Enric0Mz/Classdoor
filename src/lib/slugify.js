/**
 * Converts a string into a URL-friendly slug.
 * Strips accents/diacritics, lowercases, and replaces spaces with hyphens.
 *
 * @param {string} text - The text to slugify (e.g. "Universidade de São Paulo")
 * @returns {string} The slug (e.g. "universidade-de-sao-paulo")
 */
export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
