ARG REGISTRY_PREFIX_DOCKER_HUB
FROM ${REGISTRY_PREFIX_DOCKER_HUB:-}astral/uv:python3.14-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
ENV UV_NO_DEV=1
ENV UV_PYTHON_DOWNLOADS=0
ENV UV_PROJECT_ENVIRONMENT=/opt/app/.venv

WORKDIR /opt/app

COPY pyproject.toml uv.lock ./

COPY backend/ ./backend/
COPY mcp/mcp-tasks/ ./mcp/mcp-tasks/
COPY nanobot/ ./nanobot/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

ARG REGISTRY_PREFIX_DOCKER_HUB
FROM ${REGISTRY_PREFIX_DOCKER_HUB:-}python:3.14.2-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8

RUN groupadd --system --gid 999 nonroot \
    && useradd --system --gid 999 --uid 999 --create-home nonroot

COPY --from=builder --chown=999:999 /opt/app /opt/app

ENV PATH="/opt/app/.venv/bin:$PATH"
ENV PYTHONPATH="/opt/app/backend/src"

USER nonroot
WORKDIR /opt/app

CMD ["opentelemetry-instrument", "uvicorn", "lms_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
