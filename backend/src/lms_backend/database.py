"""Database connection management."""

from sqlmodel import SQLModel, create_engine

from lms_backend.settings import settings


engine = create_engine(settings.db_url)


def create_db_and_tables():
    """Create database tables from SQLModel models."""
    from lms_backend.models import Task  # noqa: F401
    SQLModel.metadata.create_all(engine)
