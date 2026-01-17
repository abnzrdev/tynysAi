#!/bin/bash
set -e

cd /home/abenezer/Projects/tynysAi

echo "Adding files to git..."
git add docker-compose.yml \
        .env.docker.example \
        .gitignore \
        DEPLOYMENT.md \
        DOCKER_README.md \
        scripts/check-db-stats.js \
        scripts/check_db_stats.py \
        scripts/db_stats.py \
        scripts/commit_docker_setup.sh

echo "Committing..."
git commit -m "feat(docker): complete Docker Compose setup for production deployment

- Add docker-compose.yml with PostgreSQL + App orchestration
- Create .env.docker.example for environment configuration
- Update DEPLOYMENT.md with Docker Compose as recommended method
- Add DOCKER_README.md for quick start guide
- Include multiple database statistics check scripts
- Support healthchecks and persistent volumes
- Auto-restart services on failure

This completes the Docker setup - ready for production deployment."

echo "Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Docker setup successfully pushed to GitHub!"
echo ""
