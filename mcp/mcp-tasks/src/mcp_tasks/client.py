"""HTTP client for communicating with the TaskFlow backend API."""

from __future__ import annotations

import httpx
from pydantic import BaseModel


class TaskRead(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: int
    due_date: str | None
    created_at: str
    completed_at: str | None


class TasksClient:
    """Async HTTP client for the TaskFlow backend."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"X-API-Key": self.api_key},
            timeout=30.0,
        )

    async def health_check(self) -> dict:
        """Check if the backend is healthy."""
        response = await self._client.get("/health")
        response.raise_for_status()
        return response.json()

    async def create_task(
        self, title: str, description: str = "", priority: int = 0
    ) -> TaskRead:
        """Create a new task."""
        response = await self._client.post(
            "/api/tasks/",
            json={"title": title, "description": description, "priority": priority},
        )
        response.raise_for_status()
        return TaskRead(**response.json())

    async def list_tasks(self, status_filter: str | None = None) -> list[TaskRead]:
        """List all tasks, optionally filtered by status."""
        params = {"status_filter": status_filter} if status_filter else {}
        response = await self._client.get("/api/tasks/", params=params)
        response.raise_for_status()
        return [TaskRead(**task) for task in response.json()]

    async def complete_task(self, task_id: int) -> TaskRead:
        """Mark a task as complete."""
        response = await self._client.post(f"/api/tasks/{task_id}/complete")
        response.raise_for_status()
        return TaskRead(**response.json())

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()
