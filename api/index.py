import os
import sys

# Standard Python Path Setup for Vercel
# The project root is one level up from the 'api' folder
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend_api")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from main import app
    # DO NOT set root_path here; we handle local pathing in index.py
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "OPTIONS"])
    async def crash_log(path: str):
        import traceback
        return {
            "error": "BACKEND_BOOT_FAILED",
            "detail": str(e),
            "traceback": traceback.format_exc(),
            "path": path
        }
