import os
import sys

# Get the absolute project root (it's one level up from the 'api' folder)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add project root to sys.path so we can import 'backend_api'
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Add backend_api folder specifically so main.py can do 'from routers import'
BACKEND_DIR = os.path.join(ROOT_DIR, "backend_api")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from backend_api.main import app
    # Set root_path for Vercel's /api prefix
    app.root_path = "/api"
except Exception as e:
    import traceback
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def debug_log(path: str):
        return {
            "error": "BACKEND_INITIALIZATION_FAILED",
            "message": str(e),
            "traceback": traceback.format_exc(),
            "note": "The backend failed to start. Check if all deleted tables are cleaned up in models.py."
        }
