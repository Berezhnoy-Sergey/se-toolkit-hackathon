"""FastAPI router for task CRUD operations."""

from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from sqlmodel import Session, select

from lms_backend.database import engine
from lms_backend.models.task import Task, TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate):
    """Create a new task."""
    with Session(engine) as session:
        task = Task(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            due_date=task_data.due_date,
            status="active",
            created_at=datetime.now(),
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task


@router.get("/", response_model=list[TaskRead])
def list_tasks(status_filter: str | None = None):
    """List all tasks, optionally filtered by status."""
    with Session(engine) as session:
        query = select(Task)
        if status_filter:
            query = query.where(Task.status == status_filter)
        query = query.order_by(Task.created_at.desc())
        tasks = session.exec(query).all()
        return tasks


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int):
    """Get a specific task by ID."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_data: TaskUpdate):
    """Update a task."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        if task.status == "completed" and not task.completed_at:
            task.completed_at = datetime.now()

        session.add(task)
        session.commit()
        session.refresh(task)
        return task


@router.post("/{task_id}/complete", response_model=TaskRead)
def complete_task(task_id: int):
    """Mark a task as complete."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        task.status = "completed"
        task.completed_at = datetime.now()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int):
    """Delete a task."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        session.delete(task)
        session.commit()
