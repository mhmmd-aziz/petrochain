import json

with open('notebooks/training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if 'source' in cell:
        new_source = []
        for line in cell['source']:
            # Ganti teks di markdown
            line = line.replace('kuota 40 liter/bulan', 'kuota 50 liter/bulan')
            # Ganti di dict LEVEL_QUOTA di skenario simulasi
            line = line.replace("3: (3, 40, 'Rentan Miskin')", "2: (3, 50, 'Rentan Miskin')")
            line = line.replace("2: (3, 40, 'Rentan Miskin')", "2: (3, 50, 'Rentan Miskin')")
            new_source.append(line)
        cell['source'] = new_source

with open('notebooks/training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
