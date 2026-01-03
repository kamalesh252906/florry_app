import os
import sys

# Move up and add backend_api to path
base_dir = os.path.dirname(os.path.dirname(__file__))
backend_path = os.path.join(base_dir, "backend_api")
sys.path.insert(0, backend_path)

try:
    from main import app
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI()
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def crash_log(path: str):
        return {
            "error": "CRITICAL_BOOT_FAILURE",
            "message": str(e),
            "trace": "Vercel Python Builder",
            "path": path
        }
