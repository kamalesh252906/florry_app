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
    
    # Remove prepared_statements if it exists, as psycopg2 doesn't support it in DSN
    if "prepared_statements=" in DB_URL:
        import re
        DB_URL = re.sub(r'[&?]?prepared_statements=[^&]+', '', DB_URL)
else:
    # Fallback without invalid prepared_statements option
    DB_URL = "postgresql+psycopg2://postgres.zbbmszrtcqdworgeaajp:Kamalesh%402503@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"


engine = create_engine(
    DB_URL, 
    poolclass=NullPool,
    pool_pre_ping=True,
    connect_args={
        "connect_timeout": 30,
        "sslmode": "require"
    }
)



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

