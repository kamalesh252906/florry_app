import os
import sys

# Get the absolute project root (the folder containing both 'api' and 'backend_api')
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_api_path = os.path.join(project_root, "backend_api")

# Add the project root and backend_api to sys.path
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_api_path not in sys.path:
    sys.path.insert(0, backend_api_path)

try:
    from main import app
    # Set root_path so FastAPI is aware of the /api prefix
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI()
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def crash_report(path: str):
        return {
            "status": "CRITICAL_BOOT_ERROR",
            "message": str(e),
            "help": "Check root requirements.txt and backend_api folder structure",
            "attempted_path": f"/api/{path}"
        }
