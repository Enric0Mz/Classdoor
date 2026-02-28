#!/usr/bin/env bash
set -euo pipefail

FROM_REF="${1:-HEAD~1}"
TO_REF="${2:-HEAD}"

changed_files="$(
  git diff --name-only --diff-filter=ACMRT "${FROM_REF}" "${TO_REF}" \
    | grep -E '\.(js|jsx|json|md|yml|yaml|css)$' \
    || true
)"

if [ -z "${changed_files}" ]; then
  echo "No changed files to run Prettier check."
  exit 0
fi

echo "Running Prettier check on changed files:"
echo "${changed_files}"

echo "${changed_files}" | xargs npx prettier --check
