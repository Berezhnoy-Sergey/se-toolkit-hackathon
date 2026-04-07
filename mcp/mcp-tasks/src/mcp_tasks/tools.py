"""Tool schemas, handlers, and registry for the Tasks MCP server."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from mcp.types import Tool
from pydantic import BaseModel, Field

from mcp_tasks.client import TasksClient


class NoArgs(BaseModel):
    """Empty input model for tools that only need server-side configuration."""


class TaskQuery(BaseModel):
    status_filter: str | None = Field(
        default=None, description="Filter by status: 'active' or 'completed'"
    )


class CreateTaskArgs(BaseModel):
    title: str = Field(description="Task title")
    description: str = Field(default="", description="Task description")
    priority: int = Field(default=0, description="Priority: 0=none, 1=low, 2=medium, 3=high")


class CompleteTaskArgs(BaseModel):
    task_id: int = Field(description="ID of the task to mark as complete")


ToolPayload = BaseModel | list[BaseModel]
ToolHandler = Callable[[TasksClient, BaseModel], Awaitable[ToolPayload]]


@dataclass(frozen=True, slots=True)
class ToolSpec:
    name: str
    description: str
    model: type[BaseModel]
    handler: ToolHandler

    def as_tool(self) -> Tool:
        schema = self.model.model_json_schema()
        schema.pop("$defs", None)
        schema.pop("title", None)
        return Tool(name=self.name, description=self.description, inputSchema=schema)


async def _create_task(client: TasksClient, args: CreateTaskArgs) -> ToolPayload:
    return await client.create_task(
        title=args.title,
        description=args.description,
        priority=args.priority,
    )


async def _list_tasks(client: TasksClient, args: TaskQuery) -> ToolPayload:
    return await client.list_tasks(status_filter=args.status_filter)


async def _complete_task(client: TasksClient, args: CompleteTaskArgs) -> ToolPayload:
    return await client.complete_task(task_id=args.task_id)


TOOL_SPECS = (
    ToolSpec(
        "create_task",
        "Create a new task with a title, description, and optional priority",
        CreateTaskArgs,
        _create_task,
    ),
    ToolSpec(
        "list_tasks",
        "List all tasks, optionally filtered by status ('active' or 'completed')",
        TaskQuery,
        _list_tasks,
    ),
    ToolSpec(
        "complete_task",
        "Mark a task as complete by its ID",
        CompleteTaskArgs,
        _complete_task,
    ),
)
TOOLS_BY_NAME = {spec.name: spec for spec in TOOL_SPECS}
