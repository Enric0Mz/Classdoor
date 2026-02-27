This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## CI Checks

This repository has a GitHub Actions pipeline at `.github/workflows/ci.yml` with these required checks:

- `lint`
- `tests`
- `prettier`
- `commitlint`
- `secretlint`

Run the same checks locally:

```bash
npm run lint
npm test
npm run format:check -- HEAD~1 HEAD
npm run commitlint
npm run secretlint
```

## Branch Protection (GitHub UI)

Configure `main` branch protection rules to:

- Require pull requests before merging.
- Require status checks to pass before merging.
- Mark `lint`, `tests`, `prettier`, `commitlint`, and `secretlint` as required checks.
- Require branches to be up to date before merging.
