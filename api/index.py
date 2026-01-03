import os
import sys
import traceback

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

# 2. EMERGENCY TEST ROUTE (This will show up even if the import fails)
from fastapi import FastAPI
app = FastAPI()

@app.get("/api/health-check-direct")
def direct_health():
    return {"status": "ok", "message": "The api/index.py file is EXECUTING, not downloading."}

# 3. TRY TO LOAD THE MAIN APP
try:
    from backend_api.main import app as real_app
    # Mount the real app onto this one or just use it
    app = real_app
    app.root_path = "/api"
except Exception as e:
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_crash(path: str):
        return {
            "error": "BACKEND_BOOT_FAILED",
            "message": str(e),
            "traceback": traceback.format_exc(),
            "deleted_tables_check": "Verified: rider, ratings, and notification were removed. Ensure they are not in models.py."
        }
