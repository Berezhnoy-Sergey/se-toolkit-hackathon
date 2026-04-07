"""TaskFlow - AI-Powered Task Manager Backend."""

import logging
import time
import traceback
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from lms_backend.auth import verify_api_key
from lms_backend.routers import tasks
from lms_backend.settings import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from lms_backend.database import create_db_and_tables
    create_db_and_tables()
    logging.getLogger("uvicorn.access").propagate = True
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    description="AI-Powered Personal Task Manager API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    logger.exception("unhandled_exception")
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "path": request.url.path,
        },
    )


@app.middleware("http")
async def log_requests(request: Request, call_next: RequestResponseEndpoint) -> Response:
    response = await call_next(request)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    tasks.router,
    dependencies=[Depends(verify_api_key)],
)
