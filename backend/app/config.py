from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Surveillance Platform"
    debug: bool = True
    database_url: str = "sqlite:///./app.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
