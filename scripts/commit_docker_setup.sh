#!/bin/bash
cd /home/abenezer/Projects/tynysAi

# Add files
git add docker-compose.yml .env.docker.example .gitignore DEPLOYMENT.md scripts/check-db-stats.js scripts/check_db_stats.py

# Commit
git commit -m "feat(docker): add Docker Compose setup and database check script

- Add docker-compose.yml for complete production deployment
- Create .env.docker.example for Docker Compose env variables  
- Update DEPLOYMENT.md with Docker Compose instructions
- Add database statistics checking scripts
- Support PostgreSQL + App in single compose stack
- Include healthchecks and persistent volumes

Docker Compose is now the recommended deployment method."

# Push
git push origin main

echo "Docker setup pushed to GitHub!"
