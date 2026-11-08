# 🚀 lovelace-hass-aarlo v0.4.0.alpha.1 — Modernization & HA Best Practices

> ### ⚠️ Alpha Release & Testing Notice
> **lovelace-hass-aarlo v0.4 is a modernized release of the custom Lovelace camera card designed for the AArlo Integration.**
>
> This release modernizes JavaScript implementation, removes obsolete dependencies, improves Home Assistant UI discovery, and cleans up deprecated pre-0.3 configuration code.
>
> If you encounter any display or streaming issues, please report them on [GitHub Issues](https://github.com/twrecked/lovelace-hass-aarlo/issues).

---

## 🌟 Highlights

### 1. Offline & Resilient Operation
- **Bundled English Localization:** Embedded `DEFAULT_MESSAGES` directly in the card bundle so the card loads instantly without external network requests or null dereference errors.
- **Removed External W3Schools CSS:** Replaced the external `<link>` to `w3schools.com` with inlined, scoped CSS for modals and animations, preventing network timeouts, HTTP 403 errors, and FOUC (flash of unstyled content).
- **Unconditional Custom Element Registration:** `aarlo-glance` is now registered immediately in the browser registry rather than being blocked behind CDN script loading callbacks.

### 2. Home Assistant Best Practices & Modern UI Support
- **Card Picker UI Discovery:** Registered with `window.customCards` so the card appears in Home Assistant's dashboard card selection dialog.
- **Lovelace Stub Config:** Added `static getStubConfig()` to auto-discover existing `camera.aarlo_*` entities when adding the card via the GUI editor.
- **Sections & Grid View Support:** Added `getLayoutOptions()` for proper responsive rendering in modern Home Assistant grid and section dashboards (HA 2024.3+).
- **Modern Event Dispatching:** Switched `moreInfo()` to standard `CustomEvent('hass-more-info', ...)` with composed event bubbling.
- **Cleaned Up Obsolete Styles:** Replaced deprecated Polymer `--paper-font-common-nowrap_*` variables with standard CSS text truncation rules.

### 3. Lifecycle & Performance Enhancements
- **Lifecycle Cleanups (`connectedCallback` & `disconnectedCallback`):** Properly pauses video playback, destroys HLS/DASH media players, and cancels active timeouts when navigating away from the dashboard tab, preventing orphaned streams and memory leaks.
- **State Change Throttling:** Added `_hasMonitoredEntitiesChanged()` to inspect watched camera and sensor entities, skipping unnecessary DOM queries and re-rendering when unrelated HA entities update.
- **Robust Video Controls:** Video playback and fullscreen requests now handle promise rejections cleanly, with added support for iOS Safari `webkitEnterFullscreen`.

### 4. Configuration Simplification
- **Removed Deprecated Configuration Checks:** Completely removed legacy pre-0.3 `show` error checks and unified camera configuration parsing into `getCameraConfig`.
- **Maintenance Branching:** Version 0.3.x is branched to `version-0.3.x` for ongoing maintenance if needed.

---

## 📋 Installation & Verification

### Via HACS
1. Search for **lovelace-hass-aarlo** in HACS Frontend integrations.
2. Select version `0.4.0.alpha.1` (ensure pre-releases are enabled).
3. Clear your browser cache and reload.

### Manual / Script
```bash
./scripts/install /config
./scripts/install go /config
```
