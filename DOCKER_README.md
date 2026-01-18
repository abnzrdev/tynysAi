# Docker Deployment Quick Start

## Using Docker Compose (Easiest Method)

1. **Copy environment template:**
   ```bash
   cp .env.docker.example .env
   ```

2. **Edit `.env` with your secrets:**
   ```bash
   # Generate secure secrets
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   openssl rand -base64 32  # For IOT_DEVICE_SECRET
   
   # Edit the .env file
   nano .env
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Access the app:**
   - App: http://localhost:3000
   - Database: localhost:5432

## What's Included

- **PostgreSQL Database**: Runs on port 5432 with persistent volume
- **Next.js App**: Runs on port 3000
- **Health Checks**: Automatic service monitoring
- **Auto-restart**: Services restart on failure

## Stopping Services

```bash
docker-compose down
```

## Checking Database Statistics

```bash
node scripts/check-db-stats.js
```

For full deployment documentation, see [DEPLOYMENT.md](DEPLOYMENT.md).
