import os
import shutil

base_dir = r"c:\Users\KamaleshElumalai\Documents\app_florry"
frontend_dir = os.path.join(base_dir, "frontend")
api_dir = os.path.join(base_dir, "api")
backend_api_dir = os.path.join(base_dir, "backend_api")

# Create frontend if it doesn't exist
if not os.path.exists(frontend_dir):
    os.makedirs(frontend_dir)

# Files/Dirs to move to frontend
to_frontend = ["index.html", "js", "pages", "styles"]

for item in to_frontend:
    src = os.path.join(base_dir, item)
    dst = os.path.join(frontend_dir, item)
    if os.path.exists(src):
        try:
            if os.path.isdir(src):
                # If dst exists, remove it first to avoid nesting
                if os.path.exists(dst):
                    shutil.rmtree(dst)
                shutil.move(src, dst)
            else:
                shutil.move(src, dst)
            print(f"Moved {item} to frontend/")
        except Exception as e:
            print(f"Error moving {item}: {e}")

# Rename backend_api to api
if os.path.exists(backend_api_dir) and not os.path.exists(api_dir):
    try:
        os.rename(backend_api_dir, api_dir)
        print("Renamed backend_api to api")
    except Exception as e:
        print(f"Error renaming backend_api: {e}")
