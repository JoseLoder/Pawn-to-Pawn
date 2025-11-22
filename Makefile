# Pawn-to-Pawn Makefile
# Useful commands for managing the full stack application

.PHONY: help run stop restart logs clean rebuild build dev setup db-reset db-backup db-restore health check-env

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
RESET := \033[0m

help: ## Show this help message
	@echo "$(CYAN)Pawn-to-Pawn - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# Setup and Installation
setup: ## Create .env file from .env.example and install dependencies
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from .env.example...$(RESET)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created. Please update it with your values!$(RESET)"; \
	else \
		echo "$(YELLOW).env file already exists$(RESET)"; \
	fi
	@echo "$(CYAN)Installing shared dependencies...$(RESET)"
	@cd shared && npm install
	@echo "$(CYAN)Installing backend dependencies...$(RESET)"
	@cd express && npm install
	@echo "$(CYAN)Installing frontend dependencies...$(RESET)"
	@cd react && npm install
	@echo "$(GREEN)✓ Setup complete!$(RESET)"

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found!$(RESET)"; \
		echo "$(YELLOW)Run 'make setup' to create it$(RESET)"; \
		exit 1; \
	fi

# Docker Commands
run: check-env ## Build and start all services in detached mode
	@echo "$(CYAN)Building and starting all services...$(RESET)"
	docker compose up -d --build
	@echo "$(GREEN)✓ Services started successfully!$(RESET)"
	@echo "$(CYAN)Frontend: http://localhost$(RESET)"
	@echo "$(CYAN)Backend: http://localhost:3000$(RESET)"

start: check-env ## Start all services without rebuilding
	@echo "$(CYAN)Starting all services...$(RESET)"
	docker compose up -d
	@echo "$(GREEN)✓ Services started!$(RESET)"

stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(RESET)"
	docker compose down
	@echo "$(GREEN)✓ Services stopped$(RESET)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(RESET)"
	docker compose restart
	@echo "$(GREEN)✓ Services restarted$(RESET)"

# Development
dev: ## Start services with logs visible (not detached)
	@echo "$(CYAN)Starting services in development mode...$(RESET)"
	docker compose up --build

dev-backend: ## Start only backend services (postgres + backend)
	@echo "$(CYAN)Starting backend services...$(RESET)"
	docker compose up -d postgres backend

dev-frontend: ## Start only frontend service
	@echo "$(CYAN)Starting frontend service...$(RESET)"
	docker compose up -d frontend

# Build Commands
build: ## Build all Docker images
	@echo "$(CYAN)Building all images...$(RESET)"
	docker compose build
	@echo "$(GREEN)✓ Build complete$(RESET)"

build-backend: ## Build only backend image
	@echo "$(CYAN)Building backend image...$(RESET)"
	docker compose build backend
	@echo "$(GREEN)✓ Backend build complete$(RESET)"

build-frontend: ## Build only frontend image
	@echo "$(CYAN)Building frontend image...$(RESET)"
	docker compose build frontend
	@echo "$(GREEN)✓ Frontend build complete$(RESET)"

rebuild: clean build run ## Clean, rebuild and restart everything

# Logs
logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-db: ## Show database logs
	docker compose logs -f postgres

# Database Commands
db-reset: ## Reset database (WARNING: deletes all data!)
	@echo "$(RED)WARNING: This will delete all database data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)Stopping services...$(RESET)"; \
		docker compose down; \
		echo "$(YELLOW)Removing database volume...$(RESET)"; \
		docker volume rm pawn-to-pawn_postgres_data || true; \
		echo "$(CYAN)Restarting services...$(RESET)"; \
		docker compose up -d; \
		echo "$(GREEN)✓ Database reset complete$(RESET)"; \
	else \
		echo "$(YELLOW)Database reset cancelled$(RESET)"; \
	fi

db-backup: ## Backup database to backup.sql
	@echo "$(CYAN)Creating database backup...$(RESET)"
	@mkdir -p backups
	docker compose exec -T postgres pg_dump -U postgres pawnshop > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/ directory$(RESET)"

db-restore: ## Restore database from backup.sql (usage: make db-restore FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify backup file$(RESET)"; \
		echo "$(YELLOW)Usage: make db-restore FILE=backups/backup.sql$(RESET)"; \
		exit 1; \
	fi
	@echo "$(CYAN)Restoring database from $(FILE)...$(RESET)"
	docker compose exec -T postgres psql -U postgres -d pawnshop < $(FILE)
	@echo "$(GREEN)✓ Database restored$(RESET)"

db-connect: ## Connect to PostgreSQL database
	@echo "$(CYAN)Connecting to database...$(RESET)"
	docker compose exec postgres psql -U postgres -d pawnshop

db-shell: ## Open shell in database container
	docker compose exec postgres sh

# Service Management
exec-backend: ## Open shell in backend container
	docker compose exec backend sh

exec-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

ps: ## Show running containers
	docker compose ps

# Health Checks
health: ## Check health of all services
	@echo "$(CYAN)Checking service health...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Backend:$(RESET)"
	@curl -s http://localhost:3000/health | jq || echo "$(RED)Backend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(RESET)"
	@curl -s http://localhost/health || echo "$(RED)Frontend not responding$(RESET)"
	@echo ""
	@echo "$(YELLOW)Database:$(RESET)"
	@docker compose exec postgres pg_isready -U postgres || echo "$(RED)Database not ready$(RESET)"

status: ## Show status and resource usage
	@echo "$(CYAN)Service Status:$(RESET)"
	@docker compose ps
	@echo ""
	@echo "$(CYAN)Resource Usage:$(RESET)"
	@docker stats --no-stream

# Cleanup
clean: ## Stop services and remove containers (keeps volumes)
	@echo "$(YELLOW)Cleaning up containers...$(RESET)"
	docker compose down
	@echo "$(GREEN)✓ Cleanup complete$(RESET)"

clean-all: ## Stop services, remove containers and volumes (WARNING: deletes data!)
	@echo "$(RED)WARNING: This will delete all data including database!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)Removing all containers and volumes...$(RESET)"; \
		docker compose down -v; \
		echo "$(GREEN)✓ Complete cleanup done$(RESET)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled$(RESET)"; \
	fi

clean-images: ## Remove all project Docker images
	@echo "$(YELLOW)Removing Docker images...$(RESET)"
	docker compose down
	docker rmi pawn-to-pawn-backend pawn-to-pawn-frontend || true
	@echo "$(GREEN)✓ Images removed$(RESET)"

prune: ## Remove unused Docker resources (system-wide)
	@echo "$(YELLOW)Pruning Docker system...$(RESET)"
	docker system prune -f
	@echo "$(GREEN)✓ Prune complete$(RESET)"

# Testing
test-backend: ## Run backend tests (when implemented)
	docker compose exec backend npm test

test-frontend: ## Run frontend tests (when implemented)
	docker compose exec frontend npm test

# Production
prod-build: ## Build for production with no cache
	@echo "$(CYAN)Building production images...$(RESET)"
	docker compose build --no-cache
	@echo "$(GREEN)✓ Production build complete$(RESET)"

# Quick shortcuts
up: run ## Alias for 'run'
down: stop ## Alias for 'stop'
