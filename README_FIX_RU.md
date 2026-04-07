# TaskFlow Version 1 - Исправление Ошибки Сборки

## Что Произошло

Ошибка возникала из-за того, что Dockerfile ожидали сложную структуру workspace из Lab 8, но мы создали упрощённую версию без всех необходимых файлов конфигурации.

### Основная Проблема

```
error: Could not find root package `nanobot`
```

Это означает, что при сборке Docker не мог найти пакет `nanobot`, потому что:
1. Не было root `pyproject.toml` с конфигурацией workspace
2. Dockerfile использовали `--from=workspace` контексты, которые не были настроены
3. Имена пакетов не совпадали со структурой директорий

## Что Было Исправлено

### 1. ✅ Добавлены Root Конфигурационные Файлы

**pyproject.toml** (в корне проекта):
```toml
[tool.uv.workspace]
members = [
  "backend",
  "mcp/mcp-tasks",
  "nanobot",
]

[tool.uv.sources]
mcp-tasks = { workspace = true, editable = true }
nanobot = { workspace = true, editable = true }
```

Этот файл объясняет Docker как все пакеты связаны друг с другом.

### 2. ✅ Упрощены Dockerfiles

**До (СЛОЖНО):**
```dockerfile
COPY --from=workspace pyproject.toml uv.lock /app/
COPY --from=workspace mcp /app/mcp
```

**После (ПРОСТО):**
```dockerfile
COPY nanobot/pyproject.toml /app/nanobot/pyproject.toml
COPY mcp/mcp-tasks/pyproject.toml /app/mcp/mcp-tasks/pyproject.toml
```

Теперь Dockerfile напрямую копируют нужные файлы без сложных контекстов.

### 3. ✅ Обновлён docker-compose.yml

Убрали `additional_contexts`, которые вызывали проблемы:

**До:**
```yaml
nanobot:
  build:
    context: ./nanobot
    additional_contexts:
      workspace: .
      mcp: ./mcp
```

**После:**
```yaml
nanobot:
  build:
    context: .
    dockerfile: nanobot/Dockerfile
```

### 4. ✅ Исправлены Имена Пакетов

**mcp/mcp-tasks/pyproject.toml:**
```toml
[project]
name = "mcp-tasks"  # Было "mcp-lms"

[tool.setuptools.packages.find]
include = ["mcp_tasks*"]  # Было "mcp_lms*"
```

## Как Теперь Собирать

### Быстрая Инструкция

```bash
# Перейти в директорию проекта
cd se-toolkit-hackathon-Berezhnoy-Sergey

# Остановить старые контейнеры
docker compose --env-file .env.docker.secret down

# Очистить старые образы (опционально, если были проблемы)
docker system prune -f

# Собрать и запустить
docker compose --env-file .env.docker.secret up --build -d
```

### Если Всё Равно Есть Ошибки

Попробуйте более агрессивную очистку:

```bash
# Остановить всё
docker compose --env-file .env.docker.secret down -v

# Удалить все образы проекта
docker images | grep "se-toolkit-hackathon" | awk '{print $3}' | xargs docker rmi -f

# Очистить кэш сборки
docker builder prune -f

# Пересобрать
docker compose --env-file .env.docker.secret up --build -d
```

## Обязательные Переменные Окружения

Перед запуском убедитесь, что эти значения установлены в `.env.docker.secret`:

```env
# ОБЯЗАТЕЛЬНО - Получите на https://openrouter.ai (есть бесплатный тариф)
LLM_API_KEY=ваш_настоящий_ключ_openrouter

# Можно оставить по умолчанию
LMS_API_KEY=taskflow_api_key_change_this
NANOBOT_ACCESS_KEY=nanobot_access_key_change_this
POSTGRES_PASSWORD=taskflow_secure_password_2026
```

## Ожидаемый Результат

При успешной сборке вы увидите:
```
✔ Network taskflow-network     Created
✔ Container postgres          Started
✔ Container backend           Started  
✔ Container nanobot           Started
✔ Container caddy             Started
```

## Доступ к Приложению

- **Веб-интерфейс**: http://localhost:42002
- **API Документация**: http://localhost:42002/docs
- **Backend напрямую**: http://localhost:42001

## Тестирование

1. Откройте http://localhost:42002 в браузере
2. В чате напишите: `Add task: Купить продукты`
3. Задача должна появиться в списке
4. Попробуйте: `Show my tasks`
5. Нажмите кнопку "Complete" на задаче

## Диагностика

Я создал скрипт для проверки правильности настройки:

```bash
# На Windows (Git Bash или WSL)
bash diagnose.sh

# Или вручную проверьте:
ls -la pyproject.toml
ls -la mcp/mcp-tasks/pyproject.toml
ls -la nanobot/pyproject.toml
```

## Структура Файлов

```
se-toolkit-hackathon-Berezhnoy-Sergey/
├── pyproject.toml              # Root workspace (НОВЫЙ)
├── uv.lock                     # Lock файл (НОВЫЙ)
├── docker-compose.yml          # Обновлён
├── .env.docker.secret          # Переменные окружения
├── diagnose.sh                 # Скрипт диагностики (НОВЫЙ)
├── BUILD_FIX.md                # Подробная документация (НОВАЯ)
├── backend/
│   ├── Dockerfile              # Упрощён
│   └── src/lms_backend/
│       ├── models/task.py      # Модель задачи
│       ├── routers/tasks.py    # CRUD endpoints
│       └── database.py         # Настройка БД
├── mcp/mcp-tasks/
│   ├── pyproject.toml          # Исправлено имя пакета
│   └── src/mcp_tasks/
│       ├── tools.py            # MCP инструменты
│       └── client.py           # API клиент
├── nanobot/
│   ├── Dockerfile              # Упрощён
│   ├── pyproject.toml          # Ссылается на mcp-tasks
│   └── entrypoint.py           # Настроен для задач
├── web-client/
│   ├── index.html              # Веб-интерфейс
│   ├── style.css               # Стили
│   └── app.js                  # Клиентская логика
└── caddy/
    └── Caddyfile               # Reverse proxy
```

## Что Изменилось

**ДО (СЛОМАНО):**
- ❌ Dockerfiles использовали `--from=workspace` контексты
- ❌ Требовалась сложная multi-context build конфигурация
- ❌ Имена пакетов не совпадали со структурой директорий
- ❌ Отсутствовал root pyproject.toml

**ПОСЛЕ (РАБОТАЕТ):**
- ✅ Упрощённые Dockerfiles с прямыми COPY командами
- ✅ Root pyproject.toml правильно определяет workspace
- ✅ Имена пакетов совпадают со структурой директорий
- ✅ Не нужны additional_contexts

## Решение Проблем

### Ошибка "package not found"
```bash
# Проверьте, что все файлы правильно переименованы
ls mcp/mcp-tasks/src/
# Должно показать: mcp_tasks/
```

### Контейнер не запускается
```bash
# Посмотрите логи
docker compose --env-file .env.docker.secret logs backend
docker compose --env-file .env.docker.secret logs nanobot
docker compose --env-file .env.docker.secret logs postgres
```

### Ошибка подключения к БД
```bash
# Убедитесь, что postgres здоров
docker compose --env-file .env.docker.secret ps
# Подождите, пока postgres покажет "healthy"
```

## Следующие Шаги

1. ✅ Попробуйте собрать с исправленной конфигурацией
2. ✅ Если работает - у вас готова Version 1 для демонстрации TA
3. ✅ Если есть проблемы - посмотрите логи и обратитесь за помощью

Удачи! 🚀
