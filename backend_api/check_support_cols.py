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

def check_table():
    with engine.connect() as conn:
        print("Checking support_messages columns...")
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'support_messages'"))
        columns = [row[0] for row in result]
        print(f"Columns: {columns}")

if __name__ == "__main__":
    check_table()
