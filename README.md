# TaskFlow

**Personal Task Manager with User Authentication** — manage your tasks with a clean, simple web interface.

## Demo

### Version 1 Features
- Create, edit, delete tasks
- Mark tasks as complete
- View all tasks in a list
- Filter tasks by status (All / Active / Completed)
- Persistent storage in PostgreSQL
- Web interface with task management

### Version 2 Features
- Multi-user support with authentication (registration, login)
- User-specific task lists (each user sees only their tasks)
- JWT-based authentication
- Priority levels for tasks (None, Low, Medium, High)
- Due date support for tasks
- Improved UI with action buttons and filters

## Product Context

### End Users

- Students balancing coursework, projects, and deadlines
- Developers who want a quick, low-friction way to track daily tasks
- Anyone who finds traditional to-do apps too rigid or time-consuming

### Problem That the Product Solves

People often forget tasks or feel overwhelmed by complex task management apps. TaskFlow provides a simple, intuitive interface where you can quickly create, manage, and track your tasks without unnecessary complexity.

### Our Solution

TaskFlow is a straightforward task manager with:

- Simple web interface with task list and management
- User authentication to keep your tasks private
- Quick task creation with title, description, and priority
- Easy completion tracking
- Status filtering (All / Active / Completed)

## Implementation Overview

### Architecture

| Component | Technology | Role |
|-----------|------------|------|
| Frontend | HTML/CSS/JavaScript | Web interface for task management |
| Backend | FastAPI | REST API for task CRUD and authentication |
| Database | PostgreSQL | Task and user storage |
| Auth | JWT (python-jose) | Secure token-based authentication |
| Password Hashing | bcrypt | Secure password storage |
| Deployment | Docker Compose | Runs all services on Ubuntu VM |

### Version 1

**Core feature: task creation and listing**

- User can create tasks with title, description, and priority
- Tasks stored in PostgreSQL with title, description, status, and timestamp
- User can view all tasks in a list
- Tasks can be marked as complete
- Tasks can be deleted
- All interactions work through web interface

### Version 2

**Improvements and additional features**

- Multi-user support with authentication (registration, login)
- User-specific task lists (JWT-based auth)
- Edit and delete tasks
- Filter tasks by status (active / completed)
- Priority levels (None, Low, Medium, High)
- Due date support
- Dockerized deployment
- Improved UI with task cards, action buttons, and filters

## Features

### Implemented (Version 1)

- Single-user mode (no authentication) — all tasks belong to a default user.
- Natural language task creation
- List all tasks
- Mark tasks as complete
- Persistent storage in PostgreSQL
- Web interface

### Implemented (Version 2)

- Multi-user support with authentication (registration, login, user-specific task lists)
- JWT-based authentication
- Edit and delete tasks
- Task prioritization (None, Low, Medium, High)
- Due date support
- Filter tasks by status (active / completed)
- Improved UI with action buttons and status filters
- Full Docker deployment

### Future Possibilities

- AI-powered natural language task creation
- Due date extraction from natural language
- AI priority suggestion based on task description
- Recurring tasks
- Email or browser notifications
- Mobile client

## Usage

### After Deployment

1. Open the web application in a browser
2. Register a new account (username, email, password)
3. Login with your credentials
4. Create tasks by clicking "Add Task" button
5. View your tasks in the list
6. Mark tasks complete, edit, or delete them

### API Endpoints

**Authentication:**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT token

**Tasks (requires JWT token):**
- `GET /api/tasks/` — List all your tasks (optional: `?status_filter=active`)
- `POST /api/tasks/` — Create a new task
- `PATCH /api/tasks/{id}` — Update a task
- `POST /api/tasks/{id}/complete` — Mark task as complete
- `DELETE /api/tasks/{id}` — Delete a task

### Example Task

```json
{
  "title": "Finish lab report",
  "description": "Complete the lab report for Software Engineering Toolkit course",
  "priority": 2,
  "due_date": "2026-04-10T18:00:00"
}
```

## Deployment

### VM Operating System

**Ubuntu 24.04** (same as university VMs)

### Required Software on the VM

- Git
- Docker Engine
- Docker Compose plugin
- curl (optional, for testing)

### Environment Variables

Create `.env.docker.secret` in the project root:

```env
# Database
POSTGRES_DB=taskflow
POSTGRES_USER=taskflow
POSTGRES_PASSWORD=your_secure_password_here

# Backend
DATABASE_URL=postgresql://taskflow:your_secure_password_here@postgres:5432/taskflow
JWT_SECRET_KEY=your_jwt_secret_key_change_this_in_production
```

### Prerequisites

- Ubuntu 24.04 VM
- Docker and Docker Compose installed
- Git installed

### Deployment Steps

1. Clone the repository on the VM:

```bash
git clone https://github.com/Berezhnoy-Sergey/se-toolkit-hackathon-Berezhnoy-Sergey.git
cd se-toolkit-hackathon-Berezhnoy-Sergey
```

2. Create the environment file:

```bash
cp .env.docker.secret .env
```

3. Edit environment variables:

```bash
nano .env
```

Set secure passwords for `POSTGRES_PASSWORD` and `JWT_SECRET_KEY`.

4. Build and start all services:

```bash
docker compose up --build -d
```

5. Open the application:

```
http://<YOUR_VM_IP>:42002
```

6. View logs if needed:

```bash
docker compose logs -f
```

7. Stop the application:

```bash
docker compose down
```

## Repository Notes

- Repository name: `se-toolkit-hackathon-Berezhnoy-Sergey`
- License: MIT
- All code pushed to GitHub
- Final submission includes deployed Version 2 accessible for demonstration

## Project Structure

```
se-toolkit-hackathon-Berezhnoy-Sergey/
├── backend/
│   ├── Dockerfile.simple      # Simple Dockerfile for backend
│   ├── requirements.txt       # Python dependencies
│   └── src/lms_backend/
│       ├── models/            # Task and User models
│       ├── routers/           # API endpoints (tasks, auth)
│       ├── auth.py            # JWT authentication
│       ├── database.py        # Database setup
│       ├── main.py            # FastAPI app
│       └── settings.py        # Configuration
├── web-client/
│   ├── index.html             # Web interface
│   ├── style.css              # Styling
│   ├── app.js                 # Frontend logic
│   └── nginx.conf             # Nginx configuration
├── docker-compose.yml         # Docker services
├── .env.docker.secret         # Environment variables template
└── README.md                  # This file
```

## Development

### Local Development (without Docker)

```bash
# Create virtual environment
python -m venv .venv
source .venv/Scripts/activate  # On Windows

# Install dependencies
pip install -r backend/requirements.txt

# Start PostgreSQL
docker compose up postgres -d

# Run backend
cd backend/src
uvicorn lms_backend.main:app --host 0.0.0.0 --port 8000 --reload

# Open web interface
# Open web-client/index.html in browser
```

### API Documentation

When backend is running, visit: `http://localhost:8000/docs`
