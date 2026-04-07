#!/bin/bash

echo "🔍 TaskFlow Version 1 - Pre-Build Diagnostic"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERROR: docker-compose.yml not found"
    echo "   Please run this script from the project root"
    exit 1
fi

echo "✅ In project root directory"
echo ""

# Check required files
echo "📁 Checking required files..."

files_ok=true

check_file() {
    if [ -f "$1" ]; then
        echo "  ✅ $1"
    else
        echo "  ❌ $1 - MISSING"
        files_ok=false
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "  ✅ $1/"
    else
        echo "  ❌ $1/ - MISSING"
        files_ok=false
    fi
}

check_file "pyproject.toml"
check_file "uv.lock"
check_file ".env.docker.secret"
check_file "docker-compose.yml"
check_file "backend/Dockerfile"
check_file "nanobot/Dockerfile"
check_file "mcp/mcp-tasks/pyproject.toml"
check_file "nanobot/pyproject.toml"
check_dir "backend/src/lms_backend"
check_dir "mcp/mcp-tasks/src/mcp_tasks"
check_dir "web-client"
check_dir "caddy"

echo ""

if [ "$files_ok" = false ]; then
    echo "❌ Some required files are missing!"
    echo "   Please make sure you've copied everything from lab-8 correctly"
    exit 1
fi

echo "✅ All required files present"
echo ""

# Check package names
echo "📦 Checking package names..."

if grep -q "name = \"mcp-tasks\"" mcp/mcp-tasks/pyproject.toml; then
    echo "  ✅ mcp-tasks package name correct"
else
    echo "  ❌ mcp-tasks/pyproject.toml should have name = \"mcp-tasks\""
    exit 1
fi

if grep -q "name = \"nanobot\"" nanobot/pyproject.toml; then
    echo "  ✅ nanobot package name correct"
else
    echo "  ❌ nanobot/pyproject.toml should have name = \"nanobot\""
    exit 1
fi

echo ""

# Check workspace config
echo "🔧 Checking workspace configuration..."

if grep -q "mcp/mcp-tasks" pyproject.toml; then
    echo "  ✅ mcp-tasks in workspace"
else
    echo "  ❌ mcp/mcp-tasks not in pyproject.toml workspace members"
    exit 1
fi

if grep -q "nanobot" pyproject.toml; then
    echo "  ✅ nanobot in workspace"
else
    echo "  ❌ nanobot not in pyproject.toml workspace members"
    exit 1
fi

if grep -q "backend" pyproject.toml; then
    echo "  ✅ backend in workspace"
else
    echo "  ❌ backend not in pyproject.toml workspace members"
    exit 1
fi

echo ""

# Check environment variables
echo "🔐 Checking environment variables..."

if [ ! -f ".env.docker.secret" ]; then
    echo "❌ .env.docker.secret not found"
    exit 1
fi

if grep -q "LLM_API_KEY=your_openrouter_or_qwen_api_key_here" .env.docker.secret; then
    echo "  ⚠️  LLM_API_KEY still has placeholder value"
    echo "     You'll need to set this to a real API key before running"
else
    echo "  ✅ LLM_API_KEY appears to be set"
fi

echo ""

# Check Docker
echo "🐳 Checking Docker..."

if command -v docker &> /dev/null; then
    echo "  ✅ Docker installed"
else
    echo "  ❌ Docker not found"
    echo "     Please install Docker first"
    exit 1
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "  ✅ Docker Compose available"
else
    echo "  ⚠️  Docker Compose plugin might not be installed"
    echo "     Try: docker compose version"
fi

echo ""
echo "=============================================="
echo "✅ Diagnostic complete! Everything looks good"
echo ""
echo "Next steps:"
echo "  1. Set your LLM_API_KEY in .env.docker.secret"
echo "  2. Run: docker compose --env-file .env.docker.secret up --build -d"
echo "  3. Open: http://localhost:42002"
echo ""
