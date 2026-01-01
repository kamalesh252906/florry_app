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

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    DB_URL = "postgresql+psycopg2://postgres:Kamalesh%402503@localhost:5432/florry_database"    

engine = create_engine(DB_URL, pool_pre_ping=True,pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()