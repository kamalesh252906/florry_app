import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "florry_database"),
        user=os.getenv("DB_USERNAME", "postgres"),
        password=os.getenv("DB_PASSWORD", "AcademyRootPassword"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    with open("db_update_log.txt", "w") as f:
        f.write("Starting update...\n")
        try:
            cur.execute("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id)")
            f.write("Added user_id\n")
        except Exception as e:
            f.write(f"Error user_id: {e}\n")
            
        try:
            cur.execute("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS reply TEXT")
            f.write("Added reply\n")
        except Exception as e:
            f.write(f"Error reply: {e}\n")
            
        try:
            cur.execute("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'")
            f.write("Added status\n")
        except Exception as e:
            f.write(f"Error status: {e}\n")
            
    cur.close()
    conn.close()
except Exception as e:
    with open("db_update_log.txt", "w") as f:
        f.write(f"Connection Error: {e}\n")
