import json
import re
import pandas as pd
import numpy as np

# 1. Hapus Emoji di app/main.py
with open('app/main.py', 'r', encoding='utf-8') as f:
    main_py_content = f.read()

main_py_content = main_py_content.replace('✅ ', '[OK] ')
main_py_content = main_py_content.replace('❌ ', '[ERROR] ')

with open('app/main.py', 'w', encoding='utf-8') as f:
    f.write(main_py_content)

# 2. Hapus Emoji di training.ipynb
def remove_emojis(text):
    # Pattern to catch common emojis
    return re.sub(r'[\U00010000-\U0010ffff]', '', text)

with open('notebooks/training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if 'source' in cell:
        # replace common emojis in text
        new_source = []
        for line in cell['source']:
            # manual replacements for typical emojis used in the notebook
            line = line.replace('✅', '[OK]')
            line = line.replace('🔍', '>>')
            line = line.replace('⏳', '>>')
            line = line.replace('📈', '>>')
            line = line.replace('📊', '>>')
            line = line.replace('✂️', '>>')
            line = line.replace('⚖️', '>>')
            line = line.replace('🏋️', '>>')
            line = line.replace('💾', '>>')
            line = line.replace('🏆', '>>')
            line = line.replace('⚠️', '[WARNING]')
            line = line.replace('👉', '>>')
            new_source.append(line)
        cell['source'] = new_source

with open('notebooks/training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

def generate_synthetic_dataset_v2(n_samples: int = 15000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    proportions = {1: 0.25, 2: 0.45, 3: 0.30}
    counts = {k: int(v * n_samples) for k, v in proportions.items()}
    counts[2] += n_samples - sum(counts.values())
    records = []

    for level, n in counts.items():
        if level == 1:
            data = {
                'kondisi_rumah': rng.choice([1, 2, 3], size=n, p=[0.65, 0.30, 0.05]),
                'sumber_listrik': rng.choice([1, 2, 3, 4], size=n, p=[0.45, 0.35, 0.15, 0.05]),
                'kepemilikan_aset': rng.choice([1, 2, 3, 4], size=n, p=[0.75, 0.20, 0.04, 0.01]),
                'pendidikan_kk': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.45, 0.35, 0.13, 0.05, 0.015, 0.005]),
                'jml_tanggungan': rng.choice(range(0, 13), size=n,
                    p=[0.01, 0.01, 0.02, 0.04, 0.07, 0.12, 0.18, 0.19, 0.15, 0.10, 0.06, 0.03, 0.02]),
                'jenis_pekerjaan': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.45, 0.30, 0.15, 0.06, 0.03, 0.01]),
                'akses_air': rng.choice([1, 2, 3, 4], size=n, p=[0.45, 0.35, 0.15, 0.05]),
                'kepemilikan_lahan': rng.choice([1, 2, 3], size=n, p=[0.70, 0.20, 0.10]),
                'level_subsidi': np.full(n, 1),
            }
        elif level == 2:
            data = {
                'kondisi_rumah': rng.choice([1, 2, 3, 4, 5], size=n, p=[0.08, 0.32, 0.40, 0.15, 0.05]),
                'sumber_listrik': rng.choice([1, 2, 3, 4], size=n, p=[0.05, 0.20, 0.55, 0.20]),
                'kepemilikan_aset': rng.choice([1, 2, 3, 4], size=n, p=[0.20, 0.50, 0.25, 0.05]),
                'pendidikan_kk': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.05, 0.20, 0.40, 0.25, 0.07, 0.03]),
                'jml_tanggungan': rng.choice(range(0, 13), size=n,
                    p=[0.02, 0.05, 0.10, 0.18, 0.22, 0.18, 0.12, 0.07, 0.03, 0.015, 0.01, 0.003, 0.002]),
                'jenis_pekerjaan': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.05, 0.15, 0.35, 0.25, 0.15, 0.05]),
                'akses_air': rng.choice([1, 2, 3, 4], size=n, p=[0.05, 0.25, 0.50, 0.20]),
                'kepemilikan_lahan': rng.choice([1, 2, 3], size=n, p=[0.25, 0.45, 0.30]),
                'level_subsidi': np.full(n, 2),
            }
        else:
            data = {
                'kondisi_rumah': rng.choice([1, 2, 3, 4, 5], size=n, p=[0.02, 0.05, 0.18, 0.40, 0.35]),
                'sumber_listrik': rng.choice([1, 2, 3, 4], size=n, p=[0.01, 0.04, 0.25, 0.70]),
                'kepemilikan_aset': rng.choice([1, 2, 3, 4], size=n, p=[0.05, 0.15, 0.45, 0.35]),
                'pendidikan_kk': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.02, 0.08, 0.15, 0.35, 0.25, 0.15]),
                'jml_tanggungan': rng.choice(range(0, 13), size=n,
                    p=[0.08, 0.15, 0.22, 0.22, 0.15, 0.08, 0.05, 0.03, 0.01, 0.005, 0.003, 0.001, 0.001]),
                'jenis_pekerjaan': rng.choice([1, 2, 3, 4, 5, 6], size=n, p=[0.02, 0.05, 0.10, 0.25, 0.30, 0.28]),
                'akses_air': rng.choice([1, 2, 3, 4], size=n, p=[0.01, 0.05, 0.30, 0.64]),
                'kepemilikan_lahan': rng.choice([1, 2, 3], size=n, p=[0.05, 0.15, 0.80]),
                'level_subsidi': np.full(n, 3),
            }
        records.append(pd.DataFrame(data))

    df = pd.concat(records, ignore_index=True)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    return df

df = generate_synthetic_dataset_v2(n_samples=500)
df.to_csv('models/synthetic_dataset_500.csv', index=False)
print("Data sintetis 500 rows berhasil dibuat di models/synthetic_dataset_500.csv")
print("Semua emoji di app/main.py dan notebooks/training.ipynb telah dihapus.")
