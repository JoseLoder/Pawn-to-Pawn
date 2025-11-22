# Docker Setup Guide for Pawn-to-Pawn

This guide explains how to run the Pawn-to-Pawn application using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Docker Commands](#docker-commands)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

To verify your installation:
```bash
docker --version
docker compose version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Pawn-to-Pawn
```

### 2. Create Environment File

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

**IMPORTANT**: Update the following values in `.env`:
- `SECRET_JWT_KEY` - Change to a secure random string
- `POSTGRES_PASSWORD` - Set a strong password
- `ADMIN_DEFAULT_PASSWORD` - Set admin user password
- Other configuration as needed

### 3. Start All Services

```bash
docker compose up -d
```

This will:
- Build the backend and frontend images
- Start PostgreSQL database
- Initialize the database schema
- Start the Express backend API
- Start the React frontend with Nginx

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### 5. Default Admin Credentials

Login with the admin credentials configured in your `.env` file:
- Email: Value of `ADMIN_EMAIL` (default: admin@pawnshop.com)
- Password: Value of `ADMIN_DEFAULT_PASSWORD`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

## Architecture

The Docker setup consists of three main services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: `postgres_data` for data persistence
- **Init Script**: `database/init.sql` creates all tables automatically

### 2. Express Backend (`backend`)
- **Build**: Multi-stage build from `express/Dockerfile`
- **Port**: 3000 (configurable via `BACKEND_PORT`)
- **Dependencies**: PostgreSQL (waits for healthy status)
- **Health Check**: GET `/health` endpoint

### 3. React Frontend (`frontend`)
- **Build**: Multi-stage build from `react/Dockerfile`
- **Port**: 80 (configurable via `FRONTEND_PORT`)
- **Server**: Nginx for serving static files
- **Features**:
  - Gzip compression
  - SPA routing support
  - Optimized caching
  - Security headers

## Configuration

### Environment Variables

All environment variables are defined in the `.env` file:

#### Database Configuration
```bash
POSTGRES_DB=pawnshop              # Database name
POSTGRES_USER=postgres            # Database user
POSTGRES_PASSWORD=your_password   # Database password (CHANGE THIS!)
DATABASE_URL=postgresql://postgres:your_password@postgres:5432/pawnshop?sslmode=disable
```

#### Backend Configuration
```bash
NODE_ENV=production               # Node environment
SECRET_JWT_KEY=your-secret-key    # JWT signing key (CHANGE THIS!)
FRONTEND_URL=http://localhost     # CORS allowed origin
BACKEND_PORT=3000                 # Backend port mapping
```

#### Admin User Configuration
```bash
ADMIN_ID_NUMBER=12345678
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@pawnshop.com
ADMIN_DEFAULT_PASSWORD=change_me  # (CHANGE THIS!)
```

#### Frontend Configuration
```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
FRONTEND_PORT=80                     # Frontend port mapping
```

### Using Supabase Instead of Local PostgreSQL

If you want to use Supabase or an external PostgreSQL database:

1. Comment out or remove the `postgres` service in `docker-compose.yml`
2. Update `DATABASE_URL` in `.env` with your Supabase connection string:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```
3. Remove the `depends_on` constraint from the `backend` service
4. Run the database schema manually in Supabase (use `database/init.sql`)

## Docker Commands

### Start Services

```bash
# Start all services in detached mode
docker compose up -d

# Start specific service
docker compose up -d backend

# Start with logs visible
docker compose up
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes database data!)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 backend
```

### Rebuild Images

```bash
# Rebuild all images
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild without cache
docker compose build --no-cache

# Rebuild and restart
docker compose up -d --build
```

### Service Management

```bash
# Restart a service
docker compose restart backend

# Check service status
docker compose ps

# Execute command in running container
docker compose exec backend sh
docker compose exec postgres psql -U postgres -d pawnshop
```

### Health Checks

```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend health
curl http://localhost/health

# Check database connection
docker compose exec postgres pg_isready -U postgres
```

## Database Management

### Access PostgreSQL

```bash
# Using docker compose exec
docker compose exec postgres psql -U postgres -d pawnshop

# Using docker directly
docker exec -it pawn-to-pawn-db psql -U postgres -d pawnshop
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres pawnshop > backup.sql

# With timestamp
docker compose exec postgres pg_dump -U postgres pawnshop > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Restore Database

```bash
# Restore from backup
docker compose exec -T postgres psql -U postgres -d pawnshop < backup.sql
```

### Reset Database

```bash
# Stop services
docker compose down

# Remove database volume
docker volume rm pawn-to-pawn_postgres_data

# Restart (will reinitialize database)
docker compose up -d
```

### View Database Tables

```sql
-- Connect to database
docker compose exec postgres psql -U postgres -d pawnshop

-- List tables
\dt

-- Describe table structure
\d users
\d orders
\d products

-- Exit
\q
```

## Troubleshooting

### Port Already in Use

If you get a "port already allocated" error:

```bash
# Find process using port 3000
lsof -i :3000

# Or for port 80
lsof -i :80

# Kill the process or change port in .env
BACKEND_PORT=3001
FRONTEND_PORT=8080
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Verify connection string in .env
# Ensure DATABASE_URL matches POSTGRES_* variables
```

### Backend Not Starting

```bash
# Check backend logs
docker compose logs backend

# Common issues:
# 1. Database not ready - wait for postgres to be healthy
# 2. Missing environment variables - check .env file
# 3. Build errors - rebuild with: docker compose build --no-cache backend
```

### Frontend Not Loading

```bash
# Check frontend logs
docker compose logs frontend

# Check nginx configuration
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Verify build arguments
# Make sure VITE_API_URL is correct during build
```

### CORS Errors

Update `FRONTEND_URL` in `.env` to match your frontend URL exactly:

```bash
# For local development
FRONTEND_URL=http://localhost

# For production
FRONTEND_URL=https://yourdomain.com
```

Then rebuild backend:
```bash
docker compose up -d --build backend
```

### Rebuild Everything from Scratch

```bash
# Stop all services
docker compose down -v

# Remove all images
docker compose rm -f
docker rmi pawn-to-pawn-backend pawn-to-pawn-frontend

# Rebuild and start
docker compose up -d --build
```

### Check Container Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats pawn-to-pawn-backend
```

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change `SECRET_JWT_KEY` to a strong random value
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Change `ADMIN_DEFAULT_PASSWORD` and update via admin panel
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for `FRONTEND_URL` and `VITE_API_URL`
- [ ] Review and restrict database access
- [ ] Enable firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging

### Production Environment Variables

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-db-host:5432/pawnshop?sslmode=require
SECRET_JWT_KEY=<strong-random-key-at-least-32-characters>
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### Using External Services

For production, consider:

1. **Database**: Use managed PostgreSQL (Supabase, AWS RDS, DigitalOcean)
2. **Frontend**: Deploy to Vercel, Netlify, or serve via CDN
3. **Backend**: Deploy to cloud platform with proper scaling
4. **SSL/TLS**: Use reverse proxy (Nginx, Traefik) with Let's Encrypt

### Docker Compose Production Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    restart: always
    environment:
      NODE_ENV: production

  frontend:
    restart: always
```

Deploy with:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Performance Optimization

### Limit Container Resources

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

### Monitoring

```bash
# View logs with timestamps
docker compose logs -f -t

# Export logs
docker compose logs > logs.txt

# Watch resource usage
watch docker stats
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues or questions:
1. Check the logs: `docker compose logs`
2. Review this documentation
3. Check the main CLAUDE.md for application details
4. Open an issue on the project repository
