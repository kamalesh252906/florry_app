import os
import sys
import traceback

# Setup paths for Vercel
# ROOT_DIR is the folder containing 'api' and 'backend_api'
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend_api")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from main import app
    # root_path helps FastAPI know it's behind a proxy (/api)
    app.root_path = "/api"
    
    @app.get("/health-check-direct")
    def health_check_direct():
        return {"status": "ok", "info": "Directly from api/index.py"}
        
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def error_handling(path: str):
        return {
            "error": "Backend failed to load",
            "details": str(e),
            "traceback": traceback.format_exc(),
            "path": path
        }
