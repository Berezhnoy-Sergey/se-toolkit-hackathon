# Multi-stage Dockerfile for nanobot agent
# Uses the workspace pattern: builds from the root pyproject.toml

# ---
# Stage 1: build the application in the `/app` directory.
# ---

ARG REGISTRY_PREFIX_DOCKER_HUB
FROM ${REGISTRY_PREFIX_DOCKER_HUB:-}astral/uv:python3.14-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

WORKDIR /app

# Copy root workspace files (needed for MCP dependencies)
COPY --from=workspace pyproject.toml uv.lock ./

# Copy nanobot-specific files
COPY pyproject.toml ./nanobot/pyproject.toml

# Install dependencies (including nanobot-ai and mcp-lms)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-workspace --package nanobot-project

# Copy the rest of the nanobot directory
COPY . /app/nanobot/

# ---
# Stage 2: use a final image with the application
# ---

ARG REGISTRY_PREFIX_DOCKER_HUB
FROM ${REGISTRY_PREFIX_DOCKER_HUB:-}python:3.14.2-slim-bookworm

# Set environment variables for Python and application
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Make sure we use UTF-8
ENV LANG=C.UTF-8

# Accept build args for user/group creation
ARG APP_UID=1000
ARG APP_GID=1000

# Setup a non-root user with specified UID/GID
RUN groupadd --system --gid ${APP_GID} appuser \
    && useradd --system --gid ${APP_GID} --uid ${APP_UID} --create-home appuser

WORKDIR /app

# Copy the application from the builder
COPY --from=builder --chown=appuser:appuser /app /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Use the appuser to run our application
USER appuser

# Set working directory
WORKDIR /app/nanobot

# Run the entrypoint script
CMD ["python", "/app/nanobot/entrypoint.py"]
