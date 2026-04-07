"""Database connection management."""

from sqlmodel import SQLModel, create_engine
from sqlmodel.pool import StaticPool

from lms_backend.settings import settings


def get_database_url() -> str:
    return (
        f"postgresql://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )


engine = create_engine(get_database_url())


def create_db_and_tables():
    """Create database tables from SQLModel models."""
    # Import models to register them with SQLModel
    from lms_backend.models import Task  # noqa: F401
    
    SQLModel.metadata.create_all(engine)
