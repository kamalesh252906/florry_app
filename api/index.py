import os
import sys

# Ensure backend_api is in the path
base_dir = os.path.dirname(os.path.dirname(__file__))
backend_path = os.path.join(base_dir, "backend_api")
if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from main import app
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI()
    
    # Enable CORS for the error handler so we can see it in the browser
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Catch ALL methods (POST, GET, etc.) to stop the 405 error and show the real crash
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_all(path: str):
        return {
            "error": "Florry Backend Failed to Start",
            "python_error": str(e),
            "hint": "Check if all dependencies are in api/requirements.txt",
            "path_hit": path
        }
