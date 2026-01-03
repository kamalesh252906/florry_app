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
    # Standardize to postgresql+psycopg2
    if DB_URL.startswith("postgres://"):
        DB_URL = DB_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DB_URL.startswith("postgresql://"):
        DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    # Transaction Pooler (port 6543) requires prepared_statements=false
    if ":6543" in DB_URL and "prepared_statements=false" not in DB_URL:
        separator = "&" if "?" in DB_URL else "?"
        DB_URL += f"{separator}prepared_statements=false"
else:
    # Fallback with transaction pooling settings
    DB_URL = "postgresql+psycopg2://postgres.zbbmszrtcqdworgeaajp:Kamalesh%402503@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&prepared_statements=false"

engine = create_engine(
    DB_URL, 
    poolclass=NullPool,
    connect_args={
        "connect_timeout": 20,
        "sslmode": "require"
    }
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

