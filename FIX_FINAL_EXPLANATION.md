# 🔧 Docker Build Fix - Final Solution

## Проблема (The Problem)

Ошибка: `error: Could not find root package 'nanobot'`

**Причина:** Dockerfile пытались запустить `uv sync` внутри директории `nanobot/`, но пакетный менеджер `uv` не мог найти пакет `nanobot`, потому что:
- Не было root `pyproject.toml` в контексте сборки
- Не было workspace конфигурации
- Команда `uv sync --frozen --no-install-workspace --package nanobot` ожидала workspace структуру

## Решение (The Solution)

### Ключевое Изменение

**ДО:** Каждый Dockerfile строил изолированно из своей директории
```yaml
# docker-compose.yml (БЫЛО)
backend:
  build:
    context: ./backend  # ❌ Только backend директория
    
nanobot:
  build:
    context: ./nanobot  # ❌ Только nanobot директория
```

**ПОСЛЕ:** Все Dockerfile строятся из ROOT директории со всеми пакетами
```yaml
# docker-compose.yml (СТАЛО)
backend:
  build:
    context: .                    # ✅ ВСЁ доступно
    dockerfile: backend/Dockerfile
    
nanobot:
  build:
    context: .                    # ✅ ВСЁ доступно  
    dockerfile: nanobot/Dockerfile
```

### Что Изменилось в Dockerfiles

**Новый подход:** Копируем workspace root и все пакеты

```dockerfile
WORKDIR /opt/app

# 1. Копируем root конфигурацию workspace
COPY pyproject.toml uv.lock ./

# 2. Копируем ВСЕ пакеты workspace
COPY backend/ ./backend/
COPY mcp/mcp-tasks/ ./mcp/mcp-tasks/
COPY nanobot/ ./nanobot/

# 3. Запускаем uv sync из ROOT - теперь работает!
RUN uv sync --frozen
```

**Почему это работает:**
- ✅ `pyproject.toml` в root определяет workspace
- ✅ Все пакеты скопированы в правильные места
- ✅ `uv sync` может разрешить все зависимости
- ✅ PYTHONPATH указывает на нужные директории

## Структура Workspace

```
/ (root контекста сборки)
├── pyproject.toml              # Определяет workspace
├── uv.lock                     # Lock файл зависимостей
├── backend/                    # Пакет: lms-backend
│   ├── pyproject.toml
│   └── src/lms_backend/
├── mcp/mcp-tasks/             # Пакет: mcp-tasks
│   ├── pyproject.toml
│   └── src/mcp_tasks/
└── nanobot/                    # Пакет: nanobot
    ├── pyproject.toml
    └── entrypoint.py
```

## Команды для Запуска

```bash
# Очистить старые образы (важно!)
docker compose --env-file .env.docker.secret down
docker system prune -f

# Собрать и запустить
docker compose --env-file .env.docker.secret up --build -d
```

## Проверка Перед Сборкой

```bash
# На Linux/Mac (Git Bash, WSL)
bash check-build.sh

# Или вручную проверьте:
cat pyproject.toml | grep "mcp/mcp-tasks"
cat backend/Dockerfile | grep "COPY pyproject.toml uv.lock"
cat nanobot/Dockerfile | grep "COPY pyproject.toml uv.lock"
```

## Ожидаемый Результат Сборки

```
[+] Building X.Xs
[+] Running 4/4
 ✔ Container postgres   Started
 ✔ Container backend    Started
 ✔ Container nanobot    Started  
 ✔ Container caddy      Started
```

## Доступ к Приложению

- **Web:** http://localhost:42002
- **API Docs:** http://localhost:42002/docs
- **Backend:** http://localhost:42001

## Если Всё Равно Есть Ошибки

1. **Полная очистка Docker:**
```bash
docker compose down -v
docker system prune -af
docker builder prune -af
```

2. **Проверьте .env.docker.secret:**
```bash
# Убедитесь, что LLM_API_KEY установлен
grep "LLM_API_KEY=" .env.docker.secret
```

3. **Посмотрите логи:**
```bash
docker compose logs backend
docker compose logs nanobot
```

## Технические Детали

### Почему Раньше Не Работало

**Старая схема:**
```
Build context: ./nanobot
Внутри контейнера:
  /app/nanobot/pyproject.toml  ← есть
  /app/pyproject.toml          ← НЕТ (workspace root)
  
uv sync --package nanobot
  ↓
Ищет nanobot в workspace
  ↓
Workspace не найден (нет root pyproject.toml)
  ↓
ERROR: Could not find root package 'nanobot'
```

**Новая схема:**
```
Build context: . (root)
Внутри контейнера:
  /opt/app/pyproject.toml      ← есть (workspace root!)
  /opt/app/uv.lock             ← есть
  /opt/app/backend/            ← есть
  /opt/app/mcp/mcp-tasks/      ← есть
  /opt/app/nanobot/            ← есть
  
uv sync (из /opt/app)
  ↓
Читает pyproject.toml workspace
  ↓
Видит все пакеты: backend, mcp-tasks, nanobot
  ↓
Устанавливает все зависимости
  ↓
✅ SUCCESS!
```

### PYTHONPATH в Dockerfile

**backend/Dockerfile:**
```dockerfile
ENV PYTHONPATH="/opt/app/backend/src"
```
Позволяет импортировать `from lms_backend import ...`

**nanobot/Dockerfile:**
```dockerfile
ENV PYTHONPATH="/opt/app/mcp/mcp-tasks/src:/opt/app/nanobot"
```
Позволяет импортировать `from mcp_tasks import ...`

## Итог

Проблема была в том, что Dockerfile строились из изолированных контекстов без доступа к workspace root. 

Решение: все сборки теперь используют root контекст (`.`) и копируют всю workspace структуру, позволяя `uv sync` правильно разрешить все зависимости.

**Это финальное исправление должно работать!** 🚀
