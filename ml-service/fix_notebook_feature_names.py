import json

with open('notebooks/training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cell_17_source = [
    "# ---- Feature importance XGBoost ----\n",
    "xgb_model = results['XGBoost']['model']\n",
    "importances = xgb_model.feature_importances_\n",
    "\n",
    "ALL_FEATURES = FEATURE_COLS + [\n",
    "    'skor_kerentanan', 'rasio_tanggungan_aset', 'skor_infrastruktur',\n",
    "    'skor_ekonomi', 'interaksi_pend_kerja'\n",
    "]\n",
    "\n",
    "feat_imp_df = pd.DataFrame({'Fitur': ALL_FEATURES, 'Importance': importances})\\\n",
    "               .sort_values('Importance', ascending=True)\n",
    "\n",
    "plt.figure(figsize=(9, 5))\n",
    "colors_imp = ['#e74c3c' if v > feat_imp_df['Importance'].mean() else '#3498db'\n",
    "              for v in feat_imp_df['Importance']]\n",
    "plt.barh(feat_imp_df['Fitur'], feat_imp_df['Importance'], color=colors_imp, alpha=0.85)\n",
    "plt.xlabel('Feature Importance (Gain)', fontsize=12)\n",
    "plt.title('Feature Importance \u2014 XGBoost', fontsize=14, fontweight='bold')\n",
    "plt.axvline(feat_imp_df['Importance'].mean(), color='black', linestyle='--',\n",
    "            linewidth=1, label=f'Mean = {feat_imp_df[\"Importance\"].mean():.3f}')\n",
    "plt.legend()\n",
    "plt.tight_layout()\n",
    "plt.savefig('../models/feature_importance.png', dpi=150, bbox_inches='tight')\n",
    "plt.show()\n",
    "print('\u2705 Feature importance disimpan')\n"
]

# Find the cell index again just to be safe
cell_idx = next(i for i, c in enumerate(nb['cells']) if 'xgb_model.feature_importances_' in ''.join(c['source']))
nb['cells'][cell_idx]['source'] = cell_17_source

with open('notebooks/training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
