import os
import glob

files = glob.glob('pages/*.html')
print(f'Found {len(files)} files')

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<link rel="stylesheet" href="../styles/loader.css">' not in content:
            # Insert before </head>
            new_content = content.replace('</head>', '    <link rel="stylesheet" href="../styles/loader.css">\n    <script src="../js/loader.js" defer>\n</head>')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {file_path}')
        else:
            print(f'Already updated {file_path}')
    except Exception as e:
        print(f'Error processing {file_path}: {e}')
