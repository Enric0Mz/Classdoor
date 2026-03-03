import { readFileSync } from "fs";
import { join } from "path";

const DOMAINS_FILE_PATH = join(
  process.cwd(),
  "data",
  "university-domains.json",
);

function loadUniversityDomains() {
  const fileContents = readFileSync(DOMAINS_FILE_PATH, "utf-8");
  return JSON.parse(fileContents);
}

/**
 * Looks up a university entry from the JSON file by email domain.
 * Returns the matching entry or null if the domain is not recognized.
 *
 * @param {string} domain - e.g. "usp.br"
 * @returns {object|null}
 */
export function findUniversityByDomain(domain) {
  const universityList = loadUniversityDomains();
  const normalizedDomain = domain.toLowerCase();

  const matchedUniversity = universityList.find((university) =>
    university.domains.some(
      (universityDomain) => universityDomain.toLowerCase() === normalizedDomain,
    ),
  );

  return matchedUniversity ?? null;
}
