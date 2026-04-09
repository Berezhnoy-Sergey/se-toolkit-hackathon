"""
Entrypoint script for running nanobot gateway in Docker.

This script reads config.json, injects environment variables
(LLM API key, base URL, model, gateway host/port, backend URL, etc.),
writes a resolved config.resolved.json, and then execs into nanobot gateway.
"""

import json
import os
import sys


def resolve_config():
    """Read config.json and inject environment variables."""
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    resolved_path = os.path.join(os.path.dirname(__file__), "config.resolved.json")

    # Read the base config
    with open(config_path, "r") as f:
        config = json.load(f)

    # Inject LLM provider settings
    llm_api_key = os.environ.get("LLM_API_KEY")
    llm_api_base_url = os.environ.get("LLM_API_BASE_URL")
    llm_api_model = os.environ.get("LLM_API_MODEL")

    if llm_api_key:
        config.setdefault("providers", {}).setdefault("custom", {})["apiKey"] = llm_api_key
    if llm_api_base_url:
        config.setdefault("providers", {}).setdefault("custom", {})["apiBase"] = llm_api_base_url
    if llm_api_model:
        config.setdefault("agents", {}).setdefault("defaults", {})["model"] = llm_api_model

    # Inject gateway settings
    gateway_host = os.environ.get("NANOBOT_GATEWAY_CONTAINER_ADDRESS")
    gateway_port = os.environ.get("NANOBOT_GATEWAY_CONTAINER_PORT")

    if gateway_host:
        config.setdefault("gateway", {})["host"] = gateway_host
    if gateway_port:
        config.setdefault("gateway", {})["port"] = int(gateway_port)

    # Inject MCP server environment variables
    mcp_lms_env = config.setdefault("tools", {}).setdefault("mcpServers", {}).setdefault("lms", {}).setdefault("env", {})

    lms_backend_url = os.environ.get("NANOBOT_LMS_BACKEND_URL")
    lms_api_key = os.environ.get("NANOBOT_LMS_API_KEY")
    victorialogs_url = os.environ.get("NANOBOT_VICTORIALOGS_URL")
    victoriatraces_url = os.environ.get("NANOBOT_VICTORIATRACES_URL")

    if lms_backend_url:
        mcp_lms_env["NANOBOT_LMS_BACKEND_URL"] = lms_backend_url
    if lms_api_key:
        mcp_lms_env["NANOBOT_LMS_API_KEY"] = lms_api_key
    if victorialogs_url:
        mcp_lms_env["NANOBOT_VICTORIALOGS_URL"] = victorialogs_url
    if victoriatraces_url:
        mcp_lms_env["NANOBOT_VICTORIATRACES_URL"] = victoriatraces_url

    # Write resolved config
    with open(resolved_path, "w") as f:
        json.dump(config, f, indent=2)

    print(f"Using config: {resolved_path}", file=sys.stderr)
    return resolved_path


def main():
    """Resolve config and exec into nanobot gateway."""
    resolved_config = resolve_config()

    workspace = os.path.join(os.path.dirname(__file__), "workspace")

    # Build the command
    cmd = [
        "nanobot",
        "gateway",
        "--config",
        resolved_config,
        "--workspace",
        workspace,
    ]

    # Exec into nanobot gateway (replaces this process)
    os.execvp("nanobot", cmd)


if __name__ == "__main__":
    main()
