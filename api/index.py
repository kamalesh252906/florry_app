import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

try:
    from main import app
    # Set root path so FastAPI handles /api prefix automatically
    app.root_path = "/api"
except Exception as e:
    from fastapi import FastAPI, Response
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def diag_handler(path: str):
        return {
            "status": "critical_failure",
            "message": "Backend failed to mount correctly",
            "detail": str(e),
            "environment": "Vercel Production",
            "path_hit": f"/api/{path}"
        }
    
    # Force a non-405/404 status to distinguish from routing errors
    @app.middleware("http")
    async def status_override(request, call_next):
        response = await call_next(request)
        if response.status_code in [200, 404, 405]:
            response.status_code = 418 # I'm a teapot (easy to spot in logs)
        return response



