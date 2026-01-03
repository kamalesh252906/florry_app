import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

try:
    from main import app
    # Standard Vercel routing
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def diag_handler(path: str):
        return {
            "status": "error",
            "message": "The Florry Backend failed to load.",
            "detail": str(e),
            "path_attempted": f"/api/{path}"
        }

