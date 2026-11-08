# 🚀 lovelace-hass-aarlo v0.4.0.alpha.2 — Release Notes

> ### ⚠️ Alpha Pre-Release Notice
> This pre-release introduces native Visual Card Editor support for `aarlo-glance`.
>
> Please report any issues or feedback on [GitHub Issues](https://github.com/twrecked/lovelace-hass-aarlo/issues).

---

## 🌟 What's New in v0.4.0.alpha.2

### Native Visual Card Editor (`<aarlo-glance-editor>`)
- Implemented native card editor utilizing Home Assistant's `<ha-form>` schema engine.
- Configurable directly from the Home Assistant GUI with live card preview:
  - **Camera Entity**: Dropdown picker with search and icons.
  - **Display Name**: Optional text override.
  - **Click Action**: Selector for "Live Stream" vs. "Last Recording".
  - **Widget Overlays**: Clean multi-select chip pickers for Top Bar (Left/Right) and Bottom Bar (Left/Right), automatically managing widget selection and pipe-separated (`|`) alignment without manual string typing.
  - **Connected Smart Devices**: Native entity selectors for Door Lock, Light, Doorbell Sensor, Doorbell Mute Switch, and Door Contact Sensor.
  - **Library Grid Sizes & Diagnostics**: Easily configure grid cycle dimensions and toggle debug logging.

---

## 📋 Installation & Updating

### Via HACS
1. Search for **lovelace-hass-aarlo** in HACS Frontend.
2. Select version `0.4.0.alpha.2` (ensure pre-releases are enabled).
3. Clear browser cache and reload.
