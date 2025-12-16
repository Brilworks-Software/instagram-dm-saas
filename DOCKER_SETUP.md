# 🐳 Docker Setup Guide

This guide will help you run BulkDM using Docker and Docker Compose.

## Prerequisites

- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your actual values:

```env
# Backend Environment Variables
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key

# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## Services

The Docker Compose setup includes:

1. **PostgreSQL Database** (`postgres`)
   - Port: 5432
   - Database: `bulkdm_db`
   - User: `bulkdm`
   - Password: `bulkdm_password`

2. **Backend** (`backend`)
   - Port: 3001
   - Automatically runs Prisma migrations on startup
   - Connects to PostgreSQL database

3. **Frontend** (`frontend`)
   - Port: 3000
   - Next.js application
   - Connects to backend API

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes database data)
```bash
docker-compose down -v
```

### Rebuild Services (after code changes)
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Execute Commands in Containers
```bash
# Backend shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev

# Frontend shell
docker-compose exec frontend sh
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Database Management

### Access PostgreSQL
```bash
docker-compose exec postgres psql -U bulkdm -d bulkdm_db
```

### Run Migrations Manually
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Open Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```

Then visit: http://localhost:5555

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 5432 are already in use:

1. Stop the conflicting service
2. Or change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3002:3001"  # Change host port
   ```

### Database Connection Issues

1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify DATABASE_URL in backend container:
   ```bash
   docker-compose exec backend env | grep DATABASE
   ```

### Frontend Not Loading

1. Check frontend logs:
   ```bash
   docker-compose logs frontend
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec frontend env | grep NEXT_PUBLIC
   ```

3. Rebuild frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose rm -f

# Rebuild from scratch
docker-compose up -d --build
```

## Production Considerations

⚠️ **This Docker setup is for development only!**

For production:

1. **Use external database** (Supabase, AWS RDS, etc.)
   - Update `DATABASE_URL` and `DIRECT_URL` in `.env`
   - Remove `postgres` service from `docker-compose.yml`

2. **Use secrets management**
   - Don't commit `.env` file
   - Use Docker secrets or environment variable injection

3. **Use production-ready images**
   - Consider using specific version tags instead of `latest`
   - Use multi-stage builds for smaller images

4. **Add reverse proxy**
   - Use Nginx or Traefik for production
   - Configure SSL/TLS certificates

5. **Resource limits**
   - Add CPU and memory limits to services
   - Configure health checks

## Development Workflow

### Making Code Changes

1. **Backend changes**:
   ```bash
   # Rebuild backend
   docker-compose up -d --build backend
   ```

2. **Frontend changes**:
   ```bash
   # Rebuild frontend
   docker-compose up -d --build frontend
   ```

### Hot Reload (Development Mode)

For hot reload during development, you can run services locally instead of in Docker:

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Use Docker only for PostgreSQL:
```bash
docker-compose up -d postgres
```

## Next Steps

1. ✅ Create `.env` file with your credentials
2. ✅ Run `docker-compose up -d`
3. ✅ Access http://localhost:3000
4. ✅ Set up Supabase project
5. ✅ Configure Instagram account connection
6. ✅ Start using BulkDM!

## Need Help?

- Check logs: `docker-compose logs -f`
- Verify services: `docker-compose ps`
- Restart services: `docker-compose restart`

