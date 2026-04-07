from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App settings
    app_name: str = "TaskFlow"
    debug: bool = False
    
    # Server settings
    address: str = "0.0.0.0"
    port: int = 8000
    
    # API key (simple version)
    api_key: str = "taskflow_api_key_change_this"
    
    # CORS
    cors_origins: list[str] = ["*"]
    
    # Database
    db_url: str = Field(
        default="postgresql://taskflow:taskflow_password@postgres:5432/taskflow",
        alias="DATABASE_URL"
    )


settings = Settings.model_validate({})
