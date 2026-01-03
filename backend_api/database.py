from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# username = os.getenv("DB_USERNAME", "postgres")
# password = os.getenv("DB_PASSWORD", "AcademyRootPassword")
# hostname = os.getenv("DB_HOST", "localhost")
# port = os.getenv("DB_PORT", "5432")
# db_name = os.getenv("DB_NAME", "florry_database")

# DB_URL = f"postgresql+psycopg2://{username}:{password}@{hostname}:{port}/{db_name}"

from sqlalchemy.pool import NullPool

DB_URL = os.getenv("DATABASE_URL")

if DB_URL:
    # SQLAlchemy requires postgresql:// instead of postgres://
    if DB_URL.startswith("postgres://"):
        DB_URL = DB_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DB_URL.startswith("postgresql://"):
        DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    # Use the Supabase URL as fallback for now if env var is missing
    DB_URL = "postgresql+psycopg2://postgres:Kamalesh%402503@db.zbbmszrtcqdworgeaajp.supabase.co:5432/postgres?sslmode=require"

engine = create_engine(
    DB_URL, 
    poolclass=NullPool,
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

