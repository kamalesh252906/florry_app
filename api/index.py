import os
import sys

# Get the directory of this file (api/)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (project root)
parent_dir = os.path.dirname(current_dir)

# Add both to sys.path
sys.path.insert(0, parent_dir)
sys.path.insert(0, os.path.join(parent_dir, "backend_api"))

try:
    from main import app
    # DO NOT set root_path here; we handle it via dual-routing in main.py
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "OPTIONS"])
    async def crash(path: str):
        return {"error": "BOOT_FAILURE", "detail": str(e)}
