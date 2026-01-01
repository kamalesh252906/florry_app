from database import engine
from sqlalchemy import text
import sys

def test_conn():
    print("Attempting to connect to database...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Connection successful! Result:", result.scalar())
            
            # Check for columns as we did before
            print("Checking support_messages columns...")
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'support_messages'"))
            columns = [row[0] for row in result]
            print(f"Columns: {columns}")
            
    except Exception as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    test_conn()
