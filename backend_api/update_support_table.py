from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

username = os.getenv("DB_USERNAME", "postgres")
password = os.getenv("DB_PASSWORD", "AcademyRootPassword")
hostname = os.getenv("DB_HOST", "localhost")
port = os.getenv("DB_PORT", "5432")
db_name = os.getenv("DB_NAME", "florry_database")

DB_URL = f"postgresql+psycopg2://{username}:{password}@{hostname}:{port}/{db_name}"
engine = create_engine(DB_URL)

def update_table():
    with engine.connect() as conn:
        print("Adding columns to support_messages table...", flush=True)
        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN user_id INTEGER REFERENCES users(user_id)"))
            print("Added user_id column", flush=True)
        except Exception as e:
            print(f"Error adding user_id: {e}", flush=True)

        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN reply TEXT"))
            print("Added reply column", flush=True)
        except Exception as e:
            print(f"Error adding reply: {e}", flush=True)

        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN status VARCHAR(20) DEFAULT 'open'"))
            print("Added status column", flush=True)
        except Exception as e:
            print(f"Error adding status: {e}", flush=True)
        
        conn.commit()
        print("Update complete!", flush=True)

if __name__ == "__main__":
    update_table()
