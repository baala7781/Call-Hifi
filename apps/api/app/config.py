import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

# Search and load .env from project root or current directory
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
else:
    load_dotenv(override=True)


@dataclass(frozen=True)
class Settings:
    app_name: str = "HiFi — AI Hotel Procurement & Negotiation Agent"
    api_prefix: str = "/api/v1"
    demo_mode: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hifi")
    google_maps_api_key: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Authorized user credentials
    allowed_emails: str = os.getenv("ALLOWED_EMAILS", "baala3536@gmail.com")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "1234567890")
    
    # Voice Agent Providers: "calle" or "cartesia"
    voice_provider: str = os.getenv("VOICE_PROVIDER", "calle").lower().strip()
    
    # CALL-E Credentials
    calle_api_key: str = os.getenv("CALLE_API_KEY", "")
    
    # Cartesia Credentials
    cartesia_api_key: str = os.getenv("CARTESIA_API_KEY", "")
    cartesia_voice_id: str = os.getenv("CARTESIA_VOICE_ID", "0dc318fb-78af-4ed5-ae5b-b77458a87d0b")
    cartesia_model_id: str = os.getenv("CARTESIA_MODEL_ID", "sonic-english")
    
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    api_base_url: str = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    test_phone_number: str = os.getenv("TEST_PHONE_NUMBER", "+919705730130")


settings = Settings()
