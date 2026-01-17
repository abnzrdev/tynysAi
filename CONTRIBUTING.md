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

