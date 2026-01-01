import os
import sys

# Add the backend_api directory to sys.path so its modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend_api"))

from main import app

# Fix for Vercel routing
app.root_path = "/api"
