# TaskFlow Version 1 - Quick Start Guide

## Overview
TaskFlow is an AI-powered personal task manager that allows you to create, list, and complete tasks through natural language commands.

## Architecture (Version 1)
- **Backend**: FastAPI (Python) - Task CRUD operations
- **Database**: PostgreSQL - Task storage
- **AI Agent**: Nanobot with MCP tools - Natural language understanding
- **Frontend**: Simple HTML/JS web interface
- **Deployment**: Docker Compose

## Prerequisites
- Docker and Docker Compose
- Git
- An API key for LLM (OpenRouter or Qwen)

## Quick Start

### 1. Clone and Setup
```bash
cd se-toolkit-hackathon-Berezhnoy-Sergey

# Copy environment file
cp .env.docker.secret .env

# Edit the environment file and set your API keys
nano .env  # or use your favorite editor
```

### 2. Set Required Environment Variables
At minimum, you need to set:
- `LLM_API_KEY` - Your OpenRouter or Qwen API key
- `LMS_API_KEY` - API key for backend authentication
- `NANOBOT_ACCESS_KEY` - Access key for nanobot

### 3. Build and Start
```bash
docker compose --env-file .env up --build -d
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:42002
```

### 5. Try It Out
In the chat, type:
- "Add task: Buy groceries"
- "Show my tasks"
- "Mark Buy groceries as done"

## Stopping the Application
```bash
docker compose --env-file .env down
```

## Viewing Logs
```bash
docker compose --env-file .env logs -f
```

## API Documentation
Once running, you can view the API documentation at:
```
http://localhost:42002/docs
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is healthy: `docker compose ps`
- Check database logs: `docker compose logs postgres`

### Backend Issues
- Check backend logs: `docker compose logs backend`
- Verify environment variables are set correctly

### Nanobot Issues
- Check nanobot logs: `docker compose logs nanobot`
- Ensure LLM_API_KEY is valid

## File Structure
```
se-toolkit-hackathon-Berezhnoy-Sergey/
├── backend/                 # FastAPI backend
│   └── src/lms_backend/
│       ├── models/         # Task model
│       ├── routers/        # API routes
│       └── ...
├── mcp/mcp-tasks/          # MCP tools for task management
├── nanobot/                # Nanobot AI agent
├── web-client/             # Simple web interface
├── caddy/                  # Reverse proxy
├── docker-compose.yml      # Docker services
├── .env.docker.secret      # Environment variables template
└── README.md              # Project documentation
```

## Next Steps (Version 2)
- Multi-user support with authentication
- Edit and delete tasks
- Due date extraction
- Task prioritization
- Improved UI with Flutter web client
- Full deployment to VM
