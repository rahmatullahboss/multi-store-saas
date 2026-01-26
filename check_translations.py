import os
import re
import json

# Paths
LANDING_COMPONENTS = "apps/landing/components"
LANDING_TS = "apps/landing/utils/i18n/bn/landing.ts"
COMMON_JSON = "apps/web/public/locales/bn/common.json"

def get_used_keys(directory):
    keys = set()
    # Matches t('key') or t("key")
    pattern = re.compile(r"t\(['\"]([a-zA-Z0-9_]+)['\"]\)")
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        matches = pattern.findall(content)
                        keys.update(matches)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return keys

def get_existing_keys_ts(filepath):
    keys = set()
    # Matches simple object keys:   key: 'value',
    pattern = re.compile(r"^\s*([a-zA-Z0-9_]+):", re.MULTILINE)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            matches = pattern.findall(content)
            keys.update(matches)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return keys

def get_common_translations(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return {}

def main():
    print("Scanning for translation keys...")
    used_keys = get_used_keys(LANDING_COMPONENTS)
    print(f"Found {len(used_keys)} unique keys used in components.")

    existing_keys = get_existing_keys_ts(LANDING_TS)
    print(f"Found {len(existing_keys)} keys already in landing.ts.")

    missing_keys = used_keys - existing_keys
    print(f"Missing keys (used but not in landing.ts): {len(missing_keys)}")
    
    common_data = get_common_translations(COMMON_JSON)
    
    found_in_common = {}
    still_missing = []

    for key in missing_keys:
        if key in common_data:
            found_in_common[key] = common_data[key]
        else:
            still_missing.append(key)

    print(f"Found {len(found_in_common)} keys in common.json.")
    print(f"Still missing {len(still_missing)} keys (not in common.json).")

    print("\n--- TO APPEND TO apps/landing/utils/i18n/bn/landing.ts ---\n")
    for key, value in found_in_common.items():
        # Escape single quotes in value
        safe_value = value.replace("'", "\\'")
        print(f"  {key}: '{safe_value}',")
    
    if still_missing:
        print("\n--- STILL MISSING (Need check) ---\n")
        for key in still_missing:
            print(f"  // {key}: '',")

if __name__ == "__main__":
    main()
