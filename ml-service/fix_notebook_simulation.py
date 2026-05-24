import json

with open('notebooks/training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cell_24_source = [
    "# Load ulang model dan coba predict beberapa skenario realistis\n",
    "loaded_model = joblib.load(MODEL_DIR / 'petrochain_model.pkl')\n",
    "\n",
    "FEATURE_ORDER = [\n",
    "    'kondisi_rumah', 'sumber_listrik', 'kepemilikan_aset', 'pendidikan_kk',\n",
    "    'jml_tanggungan', 'jenis_pekerjaan', 'akses_air', 'kepemilikan_lahan'\n",
    "]\n",
    "\n",
    "LEVEL_QUOTA = {0: (1, 150, 'Miskin Ekstrem'), 1: (2, 80, 'Miskin'), 2: (3, 40, 'Rentan Miskin')}\n",
    "\n",
    "skenario = [\n",
    "    # Deskripsi, [kondisi_rumah, sumber_listrik, kepemilikan_aset, pendidikan_kk, jml_tanggungan, jenis_pekerjaan, akses_air, kepemilikan_lahan]\n",
    "    ('Buruh harian, 6 tanggungan, rumah sangat buruk, sumur gali', [1, 2, 1, 2, 6, 2, 2, 1]),\n",
    "    ('Nelayan, 4 tanggungan, rumah sedang, PLN prasejahtera',       [3, 3, 2, 2, 4, 3, 3, 2]),\n",
    "    ('Karyawan, 2 tanggungan, rumah baik, PDAM',                   [4, 4, 3, 4, 2, 6, 4, 3]),\n",
    "    ('Tidak bekerja, 8 tanggungan, tanpa listrik, tanpa air',      [1, 1, 1, 1, 8, 1, 1, 1]),\n",
    "    ('Pedagang kecil, 3 tanggungan, rumah cukup',                  [3, 3, 2, 3, 3, 4, 3, 2]),\n",
    "]\n",
    "\n",
    "print('\U0001f50d SIMULASI PREDIKSI PRODUKSI')\n",
    "print('='*75)\n",
    "for desc, feats in skenario:\n",
    "    X_base = np.array([feats], dtype=float)\n",
    "    X_sim = compute_engineered_features(X_base)\n",
    "    pred_idx = int(loaded_model.predict(X_sim)[0])\n",
    "\n",
    "    # Adjust index jika XGBoost (0-indexed)\n",
    "    if isinstance(loaded_model, XGBClassifier):\n",
    "        level, kuota, label = LEVEL_QUOTA[pred_idx]\n",
    "        proba = loaded_model.predict_proba(X_sim)[0][pred_idx]\n",
    "    else:\n",
    "        level, kuota, label = LEVEL_QUOTA[pred_idx - 1]\n",
    "        proba = loaded_model.predict_proba(X_sim)[0][pred_idx - 1]\n",
    "\n",
    "    print(f'\\n\u2022 {desc}')\n",
    "    print(f'  -> Level {level}: {label} | Kuota: {kuota} liter/bulan | Confidence: {proba:.2%}')\n",
    "\n",
    "print('\\n\u2705 Verifikasi selesai. Model siap digunakan di produksi.')\n"
]

cell_idx = next(i for i, c in enumerate(nb['cells']) if 'loaded_model.predict' in ''.join(c['source']))
nb['cells'][cell_idx]['source'] = cell_24_source

with open('notebooks/training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
