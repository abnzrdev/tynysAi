# Contributing to Tynys AI

Thank you for your interest in contributing to Tynys AI! This guide will help you get started.

## 🚀 Quick Start

```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/tynys.git
cd tynys

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual database credentials and secrets
```

### Environment Variables Setup

The `.env.example` file contains all required environment variables. Copy it and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**
- `NEXTAUTH_URL` - URL where your app runs (default: `http://localhost:3000`)
- `DB_URL` - PostgreSQL connection string (format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`)
- `NEXTAUTH_SECRET` - Secret for NextAuth session encryption (generate a random string)
- `IOT_DEVICE_SECRET` - Secret for IoT device API authentication

**Optional variables for seeding:**
- `SEED_EMAIL` - Admin account email for initial setup
- `SEED_PASSWORD` - Admin account password
- `SEED_NAME` - Admin account display name

**⚠️ Important:** Never commit `.env.local` - it contains sensitive secrets and is already in `.gitignore`.

### Production Deployment

For deploying to production, use `.env.production.example` as a template:

```bash
cp .env.production.example .env.production
# Edit .env.production with actual production database credentials
```

**Key differences for production:**
- `NEXTAUTH_URL` should be your production domain (e.g., `https://yourdomain.com`)
- `DB_URL` should point to your production PostgreSQL database
- All secrets must be secure and randomly generated
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

**⚠️ CRITICAL:** Never push `.env.production` to git - it's ignored for security reasons.

```bash
# 4. Set up database (⚠️ destructive: wipes sensor_readings data)
npx drizzle-kit push

# 5. Run development server
npm run dev
```

## 🌿 Branch Naming Convention

Use descriptive branch names with the following patterns:

```
feature/short-description
bugfix/short-description
hotfix/critical-issue
```

**Examples:**
- `feature/mqtt-integration`
- `bugfix/chart-rendering`
- `hotfix/auth-security-patch`

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): brief description

[optional body]
[optional footer]
```

### Commit Types

| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style/formatting |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

**Examples:**
```bash
feat(dashboard): add real-time data refresh
fix(api): resolve CSV parsing edge case
docs(readme): update deployment instructions
refactor(db): optimize sensor query performance
```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update relevant documentation


### 3. Test Your Changes

```bash
# Build the project
npm run build

# Check for linting errors
npm run lint

# Test locally
npm run dev

# If you change the DB schema, run:
npx drizzle-kit push
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat(scope): your changes"
git push origin feature/your-feature
```

### 5. Create a Pull Request

1. Go to the repository on GitHub
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill in the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes were made and why
   - **Screenshots**: For UI changes
   - **Testing**: How you tested the changes
5. Submit and wait for review

### 6. Address Review Feedback

```bash
# Make requested changes
git add .
git commit -m "fix(scope): address review feedback"
git push origin feature/your-feature
```

### 7. After Merge

```bash
# Update your local main branch
git checkout main
git pull origin main

# Delete the feature branch
git branch -d feature/your-feature
```

## ⚠️ Important Rules

1. **Never push directly to `main`** - Always create a PR
2. **Keep PRs focused** - One feature/fix per PR
3. **Test before submitting** - Ensure `npm run build` and `npm run lint` succeed
4. **Write clear commit messages** - Help others understand your changes
5. **Update documentation and migrations** - Keep docs and DB schema in sync with code changes

## 🛠️ Useful Git Commands

```bash
# View current status
git status

# View commit history
git log --oneline

# Stash uncommitted changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Update branch with main
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## 📋 Pull Request Checklist

Before submitting your PR, verify:

- [ ] Code builds successfully (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tested locally in development mode
- [ ] All new features have appropriate error handling
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format
- [ ] PR description clearly explains changes
- [ ] No sensitive data (API keys, passwords) in code
- [ ] `.env.local` is NOT committed (check `.gitignore` is respected)
- [ ] If adding new env variables, update `.env.example` file

## Using an External (remote) Database and Sharing Seeded Data

If the maintainer will run the app against a remote (external) PostgreSQL instance and you want them to see your seeded data, follow these steps.

1. Create a dump locally (this file contains data; do NOT commit it):

```bash
# Run on the machine that can reach the database
PGPASSWORD=password123 pg_dump -h localhost -U admin -d tynysdb -Fc -f tynys_prod_dump.dump
```

2. Transfer the dump securely to the maintainer (do NOT send via plain email or commit to git):

- Use a secure channel: SFTP, Secure shared drive, or a password-protected transfer (1Password/Bitwarden file sharing, or an encrypted cloud link).

3. Maintainer restores the dump to the production DB host (example):

```bash
# On the maintainer's host where Postgres is accessible
PGPASSWORD=<target_pass> pg_restore -h <target_host> -U <target_user> -d tynysdb -v tynys_prod_dump.dump
```

4. Update app environment on the maintainer host to point to the external DB (example `DB_URL`):

```
DB_URL=postgresql://admin:<target_pass>@<target_host>:5432/tynysdb
```

5. Start or restart the application on the maintainer host:

```bash
docker-compose up -d --build
# or if they run without docker:
NODE_ENV=production npm run build && NODE_ENV=production node .next/standalone/server.js
```

Security reminders:
- Do not commit real credentials or the dump to the repository.
- Rotate production credentials after sharing if necessary.
- Prefer creating a separate DB user with limited permissions for collaborators.

If you want me to create `tynys_prod_dump.dump` now, I can (it will be saved in the project root and ignored by `.gitignore`).

## 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/yourusername/tynys/issues) with:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots (if applicable)

## 💡 Suggesting Features

Have an idea? [Open a feature request](https://github.com/yourusername/tynys/issues) with:

- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)
- Relevant examples or mockups

## 📚 Code Style Guidelines

- Use **TypeScript** for type safety
- Follow **ESLint** rules
- Use **Prettier** for consistent formatting
- Write **self-documenting code** with clear variable names
- Add **JSDoc comments** for complex functions
- Keep functions **small and focused**
- Use shadcn/ui and Recharts for UI, and follow Bento Grid layout for dashboards
- Use Drizzle ORM for all DB access (see lib/db/ and lib/data-access.ts)

## 🤝 Getting Help

Need assistance?

- Check existing [issues](https://github.com/yourusername/tynys/issues)
- Review [documentation](README.md)
- Ask questions in issue discussions

---

**Thank you for contributing to Tynys AI!** 🎉

