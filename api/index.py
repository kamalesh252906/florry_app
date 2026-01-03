import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

try:
    from main import app
    # Standard Vercel + FastAPI routing
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def error_handler(path: str):
        return {
            "error": "Backend initialization failed",
            "detail": str(e),
            "hint": "Check if DATABASE_URL or other env vars are correct"
        }
