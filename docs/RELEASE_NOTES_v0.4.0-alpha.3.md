# 🚀 lovelace-hass-aarlo v0.4.0-alpha.3 — Release Notes

> ### ⚠️ Alpha Pre-Release Notice
> This pre-release generalizes entity and widget labels in the visual editor and adopts SemVer hyphen formatting (`0.4.0-alpha.3`).
>
> Please report any issues or feedback on [GitHub Issues](https://github.com/twrecked/lovelace-hass-aarlo/issues).

---

## 🌟 What's New in v0.4.0-alpha.3

### 1. Visual Editor Refinements
- **Generalized Labels:** Updated labels for attached device controls from location-specific wording (`"Front Door Lock"` and `"Entrance Light"`) to generic `"Door Lock"` and `"Light"` (with clean `#2` suffixes for secondary devices), making them applicable to backyards, side gates, sheds, and garages.
- **Left/Right Multi-Select Chip Pickers:** Split top and bottom bar configuration into Left and Right multi-select chip selectors, automatically managing widget selection and pipe-separated (`|`) alignment.

### 2. Modern Source Modularization & Build Pipeline
- Re-architected source code into modular files under `src/` (`src/views/image-view.js`, `src/views/library-view.js`, `src/views/stream-view.js`, `src/editor.js`, `src/styles.js`).
- Integrated Rollup build pipeline with fast watch mode (`npm run watch`) and external source maps (`dist/hass-aarlo.js.map`).
- Added automated GitHub Actions for HACS validation and release asset generation.

---

## 📋 Installation & Updating

### Via HACS
1. Search for **lovelace-hass-aarlo** in HACS Frontend.
2. Select version `0.4.0-alpha.3` (ensure pre-releases are enabled).
3. Clear browser cache and reload.
