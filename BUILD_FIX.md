# TaskFlow Version 1 - Build Fix Instructions

## Issue Summary
The Docker build was failing because the project structure didn't properly match what the Dockerfiles expected from Lab 8. The main issues were:

1. Missing root `pyproject.toml` with workspace configuration
2. Dockerfiles were using `--from=workspace` contexts that weren't properly configured
3. Package names needed to be updated from `mcp-lms` to `mcp-tasks`

## Changes Made

### 1. Added Root Configuration Files
- ✅ Copied `pyproject.toml` from lab-8 and updated workspace members
- ✅ Copied `uv.lock` for dependency resolution
- ✅ Updated workspace to include: `backend`, `mcp/mcp-tasks`, `nanobot`

### 2. Fixed Dockerfiles

#### Backend Dockerfile
- Simplified to not require workspace context
- Direct build without additional contexts
- Fixed registry prefix to have fallback

#### Nanobot Dockerfile  
- Simplified to copy packages directly
- Removed dependency on workspace and mcp contexts
- Set proper PYTHONPATH for mcp-tasks

### 3. Updated Docker Compose
- Removed `additional_contexts` from build configuration
- Simplified nanobot build to use root context
- Removed volume mounts that conflicted with builds

### 4. Fixed Package Names
- Updated `mcp/mcp-tasks/pyproject.toml` to use `mcp-tasks` name
- Updated setuptools to find `mcp_tasks*` packages
- Root pyproject.toml properly references `mcp-tasks`

## How to Build and Run

### Option 1: Clean Build (Recommended)

```bash
# Navigate to project directory
cd se-toolkit-hackathon-Berezhnoy-Sergey

# Stop any running containers
docker compose --env-file .env.docker.secret down

# Remove old build artifacts
docker system prune -f

# Build and start all services
docker compose --env-file .env.docker.secret up --build -d
```

### Option 2: If You Still Get Errors

If the build still fails, try this more aggressive cleanup:

```bash
# Stop everything
docker compose --env-file .env.docker.secret down -v

# Remove all Docker images for this project
docker images | grep "se-toolkit-hackathon" | awk '{print $3}' | xargs docker rmi -f

# Clean Docker build cache
docker builder prune -f

# Rebuild
docker compose --env-file .env.docker.secret up --build -d
```

## Required Environment Variables

Before running, make sure these are set in `.env.docker.secret`:

```env
# REQUIRED - Get from https://openrouter.ai (free tier available)
LLM_API_KEY=your_actual_openrouter_key_here

# Can keep defaults for these
LMS_API_KEY=taskflow_api_key_change_this
NANOBOT_ACCESS_KEY=nanobot_access_key_change_this
POSTGRES_PASSWORD=taskflow_secure_password_2026
```

## Expected Output

When successful, you should see:
```
✔ Network taskflow-network     Created
✔ Container postgres          Started
✔ Container backend           Started
✔ Container nanobot           Started
✔ Container caddy             Started
```

## Access the Application

- **Web Interface**: http://localhost:42002
- **Backend API Docs**: http://localhost:42002/docs
- **Backend Direct**: http://localhost:42001

## Test the Application

1. Open http://localhost:42002 in your browser
2. In the chat, type: `Add task: Buy groceries`
3. You should see the task created in the task list
4. Try: `Show my tasks`
5. Click the "Complete" button on a task

## Troubleshooting

### Build Fails with "package not found"
```bash
# Check that all files are properly renamed
ls mcp/mcp-tasks/src/
# Should show: mcp_tasks/
```

### Container Won't Start
```bash
# Check logs
docker compose --env-file .env.docker.secret logs backend
docker compose --env-file .env.docker.secret logs nanobot
docker compose --env-file .env.docker.secret logs postgres
```

### Database Connection Error
```bash
# Make sure postgres is healthy
docker compose --env-file .env.docker.secret ps
# Wait until postgres shows "healthy" before accessing the app
```

## File Structure Summary

```
se-toolkit-hackathon-Berezhnoy-Sergey/
├── pyproject.toml              # Root workspace config (NEW)
├── uv.lock                     # Dependency lock file (NEW)
├── docker-compose.yml          # Updated for simplified builds
├── .env.docker.secret          # Environment variables
├── backend/
│   ├── Dockerfile              # Simplified
│   └── src/lms_backend/
│       ├── models/task.py      # Task model
│       ├── routers/tasks.py    # CRUD endpoints
│       └── database.py         # DB setup
├── mcp/mcp-tasks/
│   ├── pyproject.toml          # Fixed package name
│   └── src/mcp_tasks/
│       ├── tools.py            # MCP tools
│       └── client.py           # API client
├── nanobot/
│   ├── Dockerfile              # Simplified
│   ├── pyproject.toml          # References mcp-tasks
│   └── entrypoint.py           # Configured for tasks
├── web-client/
│   ├── index.html              # Web interface
│   ├── style.css               # Styling
│   └── app.js                  # Client logic
└── caddy/
    └── Caddyfile               # Reverse proxy config
```

## What Changed from the Error

**Before (BROKEN):**
- Dockerfiles used `--from=workspace` contexts
- Needed complex multi-context build setup
- Package names didn't match directory structure

**After (FIXED):**
- Simplified Dockerfiles with direct COPY commands
- Root pyproject.toml defines workspace properly
- Package names match directory structure
- No additional_contexts needed

## Next Steps

1. Try building with the fixed configuration
2. If it works, you have Version 1 ready for TA demo
3. If issues persist, check logs and error messages

Good luck! 🚀
