# Project Context

Classdoor (package name: "infocampus") is a Glassdoor-like platform for Brazilian universities. Users can review universities, verify their academic email, suggest new universities, and browse courses.

Write code that a Jr Software Engineer can understand, following clean code principles.

## Tech Stack

- **Framework:** Next.js 14 (App Router) — full-stack (API routes + React frontend)
- **Language:** JavaScript only (Node.js) — no TypeScript
- **Database:** PostgreSQL 17 (via Docker Compose)
- **ORM:** Prisma 5 — schema at `prisma/schema.prisma`
- **Styling:** Tailwind CSS 4 — utility-first, brand gradient (indigo/purple)
- **Icons:** lucide-react
- **Auth:** JWT (access token 15min) + refresh token rotation (7 days)
- **Email:** Resend API
- **AI Moderation:** Anthropic SDK (Claude) for review content moderation
- **Testing:** Jest 29
- **CI:** GitHub Actions (lint, tests, prettier, commitlint, secretlint)

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/v1/             # REST API endpoints
│   │   ├── users/          # Auth, CRUD, email verification
│   │   ├── reviews/        # University reviews (CRUD + moderation)
│   │   ├── universities/   # University listing and details
│   │   ├── courses/        # Course marketplace
│   │   ├── university-submissions/  # User-submitted universities
│   │   ├── cron/           # Cron jobs (review moderation)
│   │   └── health/         # Health check
│   ├── admin/              # Admin dashboard pages
│   ├── universities/       # University pages (list + detail)
│   ├── courses/            # Course pages
│   ├── login/, register/   # Auth pages
│   ├── me/                 # User profile
│   ├── avaliar/            # Create review page
│   ├── sugerir-universidade/ # Suggest university page
│   ├── docs/               # Swagger UI
│   └── layout.js           # Root layout (Navbar, fonts, metadata)
├── components/             # Reusable React components (Navbar, UniversityCard)
├── domain/                 # Service layer (business logic)
├── repositories/           # Data access layer (Prisma queries)
├── lib/                    # Utilities (auth, pagination, sanitize, etc.)
├── errors/                 # Custom error classes (AppError)
└── middleware.js            # Next.js middleware
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
└── seed.js                 # Database seeder
tests/                      # Jest test suite (mirrors src structure)
scripts/                    # Utility scripts (seeding, format checking)
```

## Architecture Pattern

Layered architecture: **Route handler → Service → Repository → Prisma → DB**

- **Routes** (`src/app/api/v1/`): HTTP handling, request parsing, response formatting. Wrapped with `withErrorHandler()`.
- **Services** (`src/domain/`): Business logic, validation, orchestration.
- **Repositories** (`src/repositories/`): Data access abstraction over Prisma. Use `USER_PUBLIC_SELECT` to exclude sensitive fields.
- **Lib** (`src/lib/`): Shared utilities (auth, pagination, sanitization, error handling).

## Database Models

Key models (see `prisma/schema.prisma` for full schema):

- **User** — roles: `USER`, `MODERATOR`, `ADMIN`. Has email, universityEmail, verified status.
- **University** — type: `PUBLIC`/`PRIVATE`. Has rating, domains, reviews.
- **Review** — moderation status: `APPROVED`, `PENDING_MODERATION`, `REJECTED_*`. Can be anonymous (null authorId).
- **Course** — marketplace entries with title, link, price, category.
- **UniversitySubmission** — user-proposed universities, reviewed by admin/moderator.
- **RefreshToken**, **EmailVerification**, **UniversityEmailVerification** — supporting models.

## Authentication & Authorization

- JWT access tokens (15min) + refresh tokens (7 days, rotation on use)
- Max 5 refresh tokens per user
- Middleware functions in `src/lib/auth.js` and `src/lib/authorization.js`:
  - `verifyToken()` — validates JWT from `Authorization: Bearer <token>`
  - `requireVerifiedUser()` — enforces email verification (ADMINs exempt)
  - `requireRole(allowedRoles)` — role-based access
  - `requireSelfOrRole(userId, allowedRoles)` — self-access or role check
- Frontend stores tokens in localStorage, uses `fetchWithAuth()` helper
- Password: 8-40 chars, requires uppercase, lowercase, number, symbol

## API Conventions

- Base path: `/api/v1/`
- Paginated responses use `parsePagination()` and `paginatedResponse()` from `src/lib/pagination.js`
- Errors use `AppError` class with HTTP status codes, caught by `withErrorHandler()`
- Input sanitized with `sanitizeString()` from `src/lib/sanitize.js`
- Swagger docs served at `/docs`, defined in `src/lib/swagger.js`

## Frontend Conventions

- Language: Portuguese (pt-BR) throughout the UI
- Server Components by default, `"use client"` only where interactivity is needed
- Tailwind CSS classes inline — brand colors use indigo/purple gradients
- Auth state managed via `auth-change` custom event on localStorage changes
- Path alias: `@/` maps to `src/`

## Standards

- Write tests when creating new features
- Use only JavaScript (Node.js) — no TypeScript
- Prefer verbose variable names over single-letter variables
- Maintain consistent UI/UX across all pages
- Document new routes in Swagger docs (`src/lib/swagger.js`)
- When working in a worktree, copy the `.env` file from the project root into the worktree directory, since `.env` is gitignored and won't be available automatically

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production (runs prisma generate)
npm test                 # Run Jest tests
npm run lint             # ESLint
npm run lint:prettier:check  # Check formatting
npm run lint:prettier:fix    # Fix formatting
npm run commitlint       # Validate last commit message
npm run secretlint       # Scan for leaked secrets
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations + generate client
npm run db:seed          # Seed universities and domains
```

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on PRs and pushes to `main`/`development`:

1. **lint** — ESLint
2. **tests** — Jest (with env secrets)
3. **prettier** — format check on changed files only
4. **commitlint** — conventional commit messages
5. **secretlint** — secret detection

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint).

## Git Workflow

- `main` branch: only accepts hotfix PRs for urgent production bugs
- `development` branch: all feature/fix PRs target this branch
- **IMPORTANT:** Always create new branches from the `development` branch, never from `main`:
  ```bash
  git checkout development
  git pull origin development
  git checkout -b feature/your-feature-name
  ```
- When working in a worktree, always copy the `.env` file from the project root into the worktree directory, since `.env` is gitignored and won't be available automatically
- Use worktrees for parallel work:

1. Commit and push from the worktree:
   ```bash
   cd /path/to/worktree
   git add <files>
   git commit -m "your message"
   git pull origin development
   git push -u origin <branch-name>
   ```
2. Create PR targeting development:
   ```bash
   gh pr create --base development --title "Your title" --body "Description"
   ```
3. After merge, clean up:
   ```bash
   git worktree remove /path/to/worktree
   git branch -d <branch-name>
   ```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret for signing JWTs
- `RESEND_API_KEY` — email service key
- `APP_URL` — application base URL
- `ANTHROPIC_API_KEY` — AI moderation
- `CRON_SECRET` — secures cron endpoints
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME` — initial admin account
