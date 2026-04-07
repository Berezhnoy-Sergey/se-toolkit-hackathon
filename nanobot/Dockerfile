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
    uv sync

ARG REGISTRY_PREFIX_DOCKER_HUB
FROM ${REGISTRY_PREFIX_DOCKER_HUB:-}python:3.14.2-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8

RUN groupadd --gid 1000 nonroot \
    && useradd --uid 1000 --gid 1000 --create-home nonroot

COPY --from=builder --chown=1000:1000 /opt/app /opt/app
COPY --from=builder --chown=1000:1000 /opt/app/.venv /opt/app/.venv

ENV PATH="/opt/app/.venv/bin:$PATH"
ENV PYTHONPATH="/opt/app/mcp/mcp-tasks/src:/opt/app/nanobot"

USER nonroot
WORKDIR /opt/app/nanobot

CMD ["python", "entrypoint.py"]
