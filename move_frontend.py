import os
import shutil

base_dir = r"c:\Users\KamaleshElumalai\Documents\app_florry"
frontend_dir = os.path.join(base_dir, "frontend")

if not os.path.exists(frontend_dir):
    os.makedirs(frontend_dir)

to_frontend = ["index.html", "js", "pages", "styles"]

for item in to_frontend:
    src = os.path.join(base_dir, item)
    dst = os.path.join(frontend_dir, item)
    if os.path.exists(src):
        try:
            if os.path.isdir(src):
                if os.path.exists(dst):
                    shutil.rmtree(dst)
                shutil.move(src, dst)
            else:
                shutil.move(src, dst)
            print(f"Moved {item}")
        except Exception as e:
            print(f"Error {item}: {e}")
