import os
import glob

def inject_to_file(file_path):
    print(f'Processing {file_path}...')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Determine path prefix
        depth = file_path.count(os.sep)
        # Assuming we run from root
        prefix = '../' * depth if depth > 0 else './'
        
        css_path = f'{prefix}styles/loader.css'
        js_path = f'{prefix}js/loader.js'
        
        loader_link = f'<link rel="stylesheet" href="{css_path}">\n    <script src="{js_path}" defer></script>'
        
        if 'loader.css' not in content:
            if '</head>' in content:
                print(f'Injecting loader to {file_path}')
                new_content = content.replace('</head>', f'    {loader_link}\n</head>')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            else:
                print(f'Error: </head> not found in {file_path}')
        else:
            print(f'Skipping {file_path}, already has loader.')
            # Update paths if necessary (e.g. if they were wrong)
            if css_path not in content or js_path not in content:
                 print(f'Warning: Paths might be inconsistent in {file_path}, updating...')
                 # Simple replacement for common patterns if needed, but let's be careful
                 
    except Exception as e:
        print(f'Error processing {file_path}: {e}')

# Process root HTML files
for file in glob.glob('*.html'):
    inject_to_file(file)

# Process pages HTML files
for file in glob.glob('pages/*.html'):
    inject_to_file(file)
