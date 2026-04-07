"""Pydantic models for tasks."""

from datetime import datetime

from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """A task in the TaskFlow application."""

    __tablename__ = "task"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    description: str = Field(default="", max_length=2000)
    status: str = Field(default="active", max_length=20)  # active, completed
    priority: int = Field(default=0)  # 0=none, 1=low, 2=medium, 3=high
    due_date: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: datetime | None = Field(default=None)


class TaskCreate(SQLModel):
    """Schema for creating a task."""

    title: str
    description: str = ""
    priority: int = 0
    due_date: datetime | None = None


class TaskRead(SQLModel):
    """Schema for reading a task (response)."""

    id: int
    title: str
    description: str
    status: str
    priority: int
    due_date: datetime | None
    created_at: datetime
    completed_at: datetime | None


class TaskUpdate(SQLModel):
    """Schema for updating a task."""

    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: int | None = None
    due_date: datetime | None = None
