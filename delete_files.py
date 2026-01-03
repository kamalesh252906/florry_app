import os

print("Starting deletion...", flush=True)

files_to_remove = [
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\check_env.py",
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\cleanup_riders_notifications.py",
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\cleanup_supabase.py",
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\routers\\notifications.py",
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\routers\\ratings.py",
    "c:\\Users\\KamaleshElumalai\\Documents\\app_florry\\backend_api\\cleanup_log.txt"
]

for file_path in files_to_remove:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        else:
            print(f"Not found: {file_path}")
    except Exception as e:
        print(f"Error deleting {file_path}: {e}")
