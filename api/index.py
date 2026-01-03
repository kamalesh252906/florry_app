import os
import sys

# 1. SETUP PATHS
# Get absolute path to the project root
API_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(API_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend_api")

# Add paths for importing
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# 2. LOAD THE MAIN APP
try:
    from backend_api.main import app
    app.root_path = "/api"
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_crash(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "BACKEND_BOOT_FAILED",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )
