import os
import sys
import traceback

# 1. GET ABSOLUTE PATHS
# Vercel's environment can be tricky; abspath is the only way to be sure.
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_api_path = os.path.join(project_root, "backend_api")

# 2. CONFIGURE PATHS
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_api_path not in sys.path:
    sys.path.insert(0, backend_api_path)

# 3. LOAD APP
try:
    from main import app
    # Prefix handling
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def debug_error(path: str):
        return {
            "status": "BACKEND_LOAD_FAILURE",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "sys_path": sys.path,
            "cwd": os.getcwd()
        }
