#!/bin/bash

echo "🔍 TaskFlow - Critical Build Check"
echo "===================================="
echo ""

PASS=true

# 1. Check root files
echo "1️⃣  Checking root configuration files..."
if [ -f "pyproject.toml" ] && [ -f "uv.lock" ]; then
    echo "   ✅ Root pyproject.toml and uv.lock exist"
else
    echo "   ❌ MISSING root pyproject.toml or uv.lock"
    PASS=false
fi

# 2. Check workspace members in root pyproject.toml
echo ""
echo "2️⃣  Checking workspace configuration..."
if grep -q "mcp/mcp-tasks" pyproject.toml && grep -q "nanobot" pyproject.toml && grep -q "backend" pyproject.toml; then
    echo "   ✅ All workspace members configured"
else
    echo "   ❌ Workspace members missing in pyproject.toml"
    PASS=false
fi

# 3. Check Dockerfiles exist and are correct
echo ""
echo "3️⃣  Checking Dockerfiles..."
if [ -f "backend/Dockerfile" ]; then
    if grep -q "COPY pyproject.toml uv.lock" backend/Dockerfile; then
        echo "   ✅ backend/Dockerfile copies workspace root"
    else
        echo "   ❌ backend/Dockerfile doesn't copy workspace root"
        PASS=false
    fi
else
    echo "   ❌ backend/Dockerfile not found"
    PASS=false
fi

if [ -f "nanobot/Dockerfile" ]; then
    if grep -q "COPY pyproject.toml uv.lock" nanobot/Dockerfile; then
        echo "   ✅ nanobot/Dockerfile copies workspace root"
    else
        echo "   ❌ nanobot/Dockerfile doesn't copy workspace root"
        PASS=false
    fi
else
    echo "   ❌ nanobot/Dockerfile not found"
    PASS=false
fi

# 4. Check package names
echo ""
echo "4️⃣  Checking package names..."
if grep -q 'name = "mcp-tasks"' mcp/mcp-tasks/pyproject.toml; then
    echo "   ✅ mcp-tasks package name correct"
else
    echo "   ❌ mcp-tasks package name wrong"
    PASS=false
fi

if grep -q 'name = "nanobot"' nanobot/pyproject.toml; then
    echo "   ✅ nanobot package name correct"
else
    echo "   ❌ nanobot package name wrong"
    PASS=false
fi

# 5. Check mcp_tasks source directory
echo ""
echo "5️⃣  Checking source directories..."
if [ -d "mcp/mcp-tasks/src/mcp_tasks" ]; then
    echo "   ✅ mcp/mcp-tasks/src/mcp_tasks exists"
else
    echo "   ❌ mcp/mcp-tasks/src/mcp_tasks MISSING"
    PASS=false
fi

if [ -d "backend/src/lms_backend" ]; then
    echo "   ✅ backend/src/lms_backend exists"
else
    echo "   ❌ backend/src/lms_backend MISSING"
    PASS=false
fi

# 6. Check docker-compose uses root context
echo ""
echo "6️⃣  Checking docker-compose.yml..."
if grep -A2 "backend:" docker-compose.yml | grep -q "context: \."; then
    echo "   ✅ backend builds from root context"
else
    echo "   ⚠️  backend might not be using root context"
fi

if grep -A2 "nanobot:" docker-compose.yml | grep -q "context: \."; then
    echo "   ✅ nanobot builds from root context"
else
    echo "   ⚠️  nanobot might not be using root context"
fi

echo ""
echo "===================================="

if [ "$PASS" = true ]; then
    echo "✅ ALL CRITICAL CHECKS PASSED!"
    echo ""
    echo "Ready to build. Run:"
    echo "  docker compose --env-file .env.docker.secret up --build -d"
    echo ""
else
    echo "❌ SOME CHECKS FAILED!"
    echo ""
    echo "Please fix the issues above before building."
    echo ""
    exit 1
fi
