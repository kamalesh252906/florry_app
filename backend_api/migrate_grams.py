from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load from .env if it exists
load_dotenv()

# Use the URL provided by the user earlier or from env
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    # Fallback/Default for local or if not in env yet
    DB_URL = "postgresql+psycopg2://postgres:Kamalesh%402503@db.zbbmszrtcqdworgeaajp.supabase.co:5432/postgres?sslmode=require"

# Standardize URL for psycopg2
if DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"Connecting to: {DB_URL.split('@')[1]}") # Print only host for safety

engine = create_engine(DB_URL)

with engine.connect() as conn:
    print("Checking for weight_grams column...")
    try:
        # Check if column exists
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='flowers' AND column_name='weight_grams'"))
        if not result.fetchone():
            print("Adding weight_grams column to flowers table...")
            conn.execute(text("ALTER TABLE flowers ADD COLUMN weight_grams INTEGER DEFAULT 0"))
            conn.commit()
            print("Successfully added weight_grams column.")
        else:
            print("weight_grams column already exists.")
    except Exception as e:
        print(f"Error during migration: {e}")
