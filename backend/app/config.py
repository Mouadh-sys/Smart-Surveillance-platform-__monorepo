from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Surveillance Platform"
    debug: bool = True
    # PostgreSQL by default; can be overridden via DATABASE_URL in .env
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/smart_surveillance"
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
