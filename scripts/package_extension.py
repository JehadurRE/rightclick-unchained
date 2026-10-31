import os
import sys
import zipfile
import json

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def package():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_dir = os.path.join(base_dir, "dist")
    os.makedirs(dist_dir, exist_ok=True)

    manifest_file = os.path.join(base_dir, "manifest.json")
    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    version = manifest.get("version", "1.0.0")
    zip_name = f"rightclick-unchained-v{version}.zip"
    zip_path = os.path.join(dist_dir, zip_name)

    included_entries = [
        "manifest.json",
        "background.js",
        "content",
        "popup",
        "options",
        os.path.join("assets", "icons")
    ]

    print(f"Creating Chrome Web Store distribution package: {zip_path}")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for entry in included_entries:
            full_entry_path = os.path.join(base_dir, entry)
            if os.path.isfile(full_entry_path):
                arcname = entry.replace("\\", "/")
                zipf.write(full_entry_path, arcname)
                print(f"  Added file: {arcname}")
            elif os.path.isdir(full_entry_path):
                for root, dirs, files in os.walk(full_entry_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, base_dir).replace("\\", "/")
                        if file.endswith((".py", ".ps1", ".tmp")):
                            continue
                        zipf.write(file_path, rel_path)
                        print(f"  Added file: {rel_path}")

    size_kb = os.path.getsize(zip_path) / 1024
    print(f"\n[OK] Successfully built package: {zip_path} ({size_kb:.2f} KB)")

if __name__ == "__main__":
    package()
