import json
import os

# Paths
en_path = "/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/public/locales/en/common.json"
bn_path = "/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/public/locales/bn/common.json"
backup_path = "/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/public/locales/bn/common.json.bak"

# Load EN
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Load BN
with open(bn_path, 'r', encoding='utf-8') as f:
    # Use a custom approach to handle potential duplicate keys in the broken file
    # json.load normally takes the last key if duplicates exist. 
    # But since I might have a mix of translated and untranslated duplicates, 
    # I'll manually parse to prefer translated ones.
    lines = f.readlines()

bn_map = {}
for line in lines:
    line = line.strip()
    if line.startswith('"') and ':' in line:
        try:
            # Simple split to get key and value
            parts = line.split(':', 1)
            key = parts[0].strip().strip('"')
            val = parts[1].strip().rstrip(',').strip('"')
            
            # Prefer non-English/non-placeholder translations
            is_placeholder = val == "বাংলা অনুবাদ" or val.startswith("→") or val == en_data.get(key)
            
            if key not in bn_map or (bn_map[key]['is_placeholder'] and not is_placeholder):
                bn_map[key] = {'val': val, 'is_placeholder': is_placeholder}
        except:
            continue

# Create new BN data matching EN keys
new_bn_data = {}
for key, en_val in en_data.items():
    if key in bn_map:
        new_bn_data[key] = bn_map[key]['val']
    else:
        new_bn_data[key] = en_val # Fallback to English

# Save backup
os.rename(bn_path, backup_path)

# Save fixed BN
with open(bn_path, 'w', encoding='utf-8') as f:
    json.dump(new_bn_data, f, ensure_ascii=False, indent=2)

print("Finished syncing BN with EN order and cleaning duplicates.")
