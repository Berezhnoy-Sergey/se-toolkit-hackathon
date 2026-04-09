# TaskFlow

**Personal Task Manager with User Authentication** — manage your tasks with a clean, simple web interface.

---

## Demo

### Task List View

![Task List — all tasks with priority badges and action buttons](docs/screenshots/task-list.png)

*All tasks with priority levels (None / Low / Medium / High), due dates, and action buttons (Complete, Edit, Delete).*

### Task Creation

![Create Task — form with title, description, priority, and due date](docs/screenshots/create-task.png)

*Quick task creation with optional priority and due date.*

### Authentication

![Login / Register — user authentication forms](docs/screenshots/auth.png)

*Secure registration and login — each user gets their own private task list.*

---

## Product Context

### End Users

- **Students** balancing coursework, projects, and deadlines
- **Developers** who want a quick, low-friction way to track daily tasks
- **Anyone** who finds traditional to-do apps too rigid or time-consuming

### Problem That Your Product Solves

People often forget tasks or feel overwhelmed by complex task management apps. Existing solutions are either too minimal (no priorities, no dates) or too heavy (hundreds of features you don't need). TaskFlow sits in the middle: simple enough to open and act in seconds, but powerful enough to prioritise, schedule, and filter.

### Your Solution

TaskFlow is a straightforward task manager with:

- A simple web interface for creating, viewing, and managing tasks
- User authentication so each person's tasks stay private
- Priority levels and optional due dates to keep you organised
- Status filtering to focus on what matters right now

---

## Features

### Implemented ✅

| Feature | Version |
|---------|---------|
| User registration & login (JWT-based auth) | v2 |
| User-specific task lists (isolated per user) | v2 |
| Create tasks with title, description, priority, due date | v2 |
| Mark tasks as complete | v1 |
| Edit tasks | v2 |
| Delete tasks | v2 |
| Filter by status (All / Active / Completed) | v2 |
| Priority levels (None, Low, Medium, High) | v2 |
| Dockerised deployment (postgres + backend + nginx) | v2 |
| Swagger API docs (`/docs`) | v1 |

### Not Yet Implemented 🔜

| Feature | Notes |
|---------|-------|
| AI natural language task creation | — |
| Recurring tasks | — |
| Email / browser notifications | — |
| Mobile client (PWA or native) | — |
| Dark mode | — |
| Task categories / tags | — |

---

## Usage

1. **Register** — open the app, click **Register**, choose a username, email, and password.
2. **Login** — enter your credentials to get your personal task dashboard.
3. **Create a task** — click **Add Task**, fill in title (required), description (optional), priority, and due date.
4. **Manage tasks** — mark complete, edit, or delete using the action buttons on each task card.
5. **Filter** — use the status filter buttons (All / Active / Completed) to narrow the list.

### API Quick Reference

```
POST   /api/auth/register   — register {"username": "...", "email": "...", "password": "..."}
POST   /api/auth/login      — login    {"username": "...", "password": "..."}  → returns JWT
GET    /api/tasks/          — list tasks (Bearer token required)
POST   /api/tasks/          — create task (Bearer token required)
PATCH  /api/tasks/{id}      — update task (Bearer token required)
POST   /api/tasks/{id}/complete — mark complete (Bearer token required)
DELETE /api/tasks/{id}      — delete task (Bearer token required)
```

Swagger UI is available at `http://<host>/docs` when the backend is running.

---

## Deployment

### VM Operating System

**Ubuntu 24.04** (same as the university VMs; works on any modern Linux with Docker).

### What Should Be Installed on the VM

| Software | Installation |
|----------|-------------|
| **Git** | `sudo apt update && sudo apt install -y git` |
| **Docker Engine** | Follow [official Docker install guide](https://docs.docker.com/engine/install/ubuntu/) |
| **Docker Compose plugin** | `sudo apt install -y docker-compose-plugin` |

### Step-by-Step Deployment Instructions

#### 1. Clone the repository

```bash
git clone https://github.com/Berezhnoy-Sergey/se-toolkit-hackathon-Berezhnoy-Sergey.git
cd se-toolkit-hackathon-Berezhnoy-Sergey
```

#### 2. Configure environment variables

```bash
cp .env.example .env
nano .env
```

Edit at minimum these values:

```env
POSTGRES_PASSWORD=<your_secure_database_password>
JWT_SECRET_KEY=<your_secure_jwt_secret>
```

> ⚠️ **Never commit `.env` to Git.** It is already in `.gitignore`.

#### 3. Build and start all services

```bash
docker compose up --build -d
```

This starts three containers:

| Service | Internal port | External port |
|---------|--------------|---------------|
| PostgreSQL | 5432 | not exposed |
| Backend (FastAPI) | 8000 | not exposed |
| Nginx (web client) | 80 | **42002** |

#### 4. Open the application

```
http://<YOUR_VM_IP>:42002
```

Register a new account and start adding tasks.

#### 5. Useful commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up --build -d

# Reset database (destructive!)
docker compose down -v
```

#### 6. Access Swagger API docs

```
http://<YOUR_VM_IP>:42002/docs
```

---

## Project Structure

```
se-toolkit-hackathon-Berezhnoy-Sergey/
├── backend/
│   ├── Dockerfile.simple      # Simple Dockerfile for backend
│   ├── requirements.txt       # Python dependencies
│   └── src/lms_backend/
│       ├── models/            # Task and User SQLAlchemy models
│       ├── routers/           # API endpoints (tasks, auth)
│       ├── auth.py            # JWT authentication helpers
│       ├── database.py        # Database engine & session
│       ├── main.py            # FastAPI application entry
│       └── settings.py        # Configuration from env vars
├── web-client/
│   ├── index.html             # Main HTML page
│   ├── style.css              # Styling
│   ├── app.js                 # Frontend logic & API calls
│   └── nginx.conf             # Nginx reverse-proxy config
├── docker-compose.yml         # postgres + backend + nginx
├── .env.example               # Environment variables template
├── .gitignore
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
