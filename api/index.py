import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

try:
    from main import app
    # Prefix is handled via root_path for Vercel
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/{path:path}")
    def error_handler(path: str):
        return {"error": "Backend failed to load", "detail": str(e)}
