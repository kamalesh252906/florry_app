from sqlalchemy import create_engine, text

DB_URL = "postgresql+psycopg2://postgres:AcademyRootPassword@localhost:5432/florry_database"
engine = create_engine(DB_URL)

def update_table():
    with engine.connect() as conn:
        print("Adding columns to support_messages table...")
        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id)"))
            print("✓ user_id column process complete")
        except Exception as e:
            print(f"Error adding user_id: {e}")

        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS reply TEXT"))
            print("✓ reply column process complete")
        except Exception as e:
            print(f"Error adding reply: {e}")

        try:
            conn.execute(text("ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open'"))
            print("✓ status column process complete")
        except Exception as e:
            print(f"Error adding status: {e}")
        
        conn.commit()
        print("Update complete!")

if __name__ == "__main__":
    update_table()
