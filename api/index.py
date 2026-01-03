import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

try:
    from main import app
    # Prefix is now handled by api_router in main.py
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def diag_handler(path: str):
        return {
            "status": "error",
            "message": "The Florry Backend failed to load.",
            "detail": str(e),
            "trace": "Check server logs/DATABASE_URL",
            "path_attempted": f"/{path}"
        }


