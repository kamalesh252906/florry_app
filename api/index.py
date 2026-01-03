import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# INITIAL DUMMY APP (The "Lifeline")
app = FastAPI()

@app.get("/api/health-check-direct")
def direct_health():
    return {"status": "ok", "message": "The api/index.py is running. Backend is ready for attempt."}

# Try to load the real backend
try:
    # Get absolute project root
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if ROOT_DIR not in sys.path:
        sys.path.insert(0, ROOT_DIR)
    
    BACKEND_DIR = os.path.join(ROOT_DIR, "backend_api")
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    from backend_api.main import app as real_app
    # SWAP!
    app = real_app
    app.root_path = "/api"

except Exception as e:
    # If the real backend failed to load, register a catch-all error handler on the DUMMY APP
    error_info = {
        "error": "BACKEND_CRASH_DURING_IMPORT",
        "message": str(e),
        "traceback": traceback.format_exc(),
        "suggestion": "Check if deleted tables (rider, ratings, notification) are still mentioned in models.py or routers."
    }
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def crash_handler(path: str):
        return JSONResponse(status_code=500, content=error_info)
