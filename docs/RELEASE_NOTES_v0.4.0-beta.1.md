# 🚀 Lovelace Hass Aarlo v0.4.0-beta.1 — Release Notes

> Version `0.4.0-beta.1` marks the first official beta release of **Lovelace Hass Aarlo v0.4**. This milestone introduces standard WebRTC live stream capability detection via Home Assistant WebSockets, adds camera siren control widgets and live stream overlay buttons with auto-discovery, aligns the battery display to Home Assistant core sensor standards, adds container and iOS Safari pseudo-fullscreen streaming modes, and provides dual-naming entity compatibility.

---

## 🌟 What's New in v0.4.0-beta.1

### 1. Standard WebRTC Live Streaming Detection (`camera/capabilities`)
* **Official WebSocket Command:** Upgraded WebRTC stream detection to query Home Assistant's official `camera/capabilities` WebSocket command (`type: "camera/capabilities"`).
* **Proxy & External Provider Support:** Works out of the box with native Arlo SIP WebRTC streaming (`ArloSipCam`) as well as external WebRTC proxies like `go2rtc` and RTSPtoWebRTC.
* **Cached Lookups:** Caches capability query responses in card state (`frontendStreamTypes`) to ensure zero-delay subsequent stream starts.
* **Resilient Fallback:** Retains manual card configuration overrides (`webrtcPlay`, `arloPlay`, `haPlay`) and includes fallback to entity state attributes (`sip_streaming`, `frontend_stream_type`) for offline or legacy environments.

### 2. Siren Control Widget & Live Stream Overlay Button
* **Glance View Widget:** Added `"siren"` to available widget options (`image_top` / `image_bottom`). Click toggles the siren via `siren.turn_on` / `siren.turn_off`; Shift/Ctrl+Click opens the Home Assistant `more-info` dialog.
* **Live Video Overlay Controls:** Added a dedicated `"video-siren-on"` overlay button to the live stream view, allowing sirens to be sounded or silenced directly while viewing live video.
* **Auto-Discovery:** Automatically resolves candidate siren entities matching the camera name (e.g. `siren.aarlo_<camera>_siren`, `siren.aarlo_all_sirens`) when `siren` is omitted from card configuration.
* **Visual Editor & Translations:** Added `siren` to widget selection chips and added a dedicated siren entity picker in the visual card editor; added localized status tooltips.

### 3. Battery Display Aligned with Home Assistant Standards
* Aligned `batteryLevelIcon` logic with Home Assistant core sensor icon definitions (`sensor/icons.json` via floor-based range thresholds):
  - 100% displays `mdi:battery` (or `mdi:battery-charging`).
  - 90%–99% displays `mdi:battery-90` (includes the space at the top, perfectly matching official `picture-glance` cards).
  - 80%–89% down to 10% round to the corresponding 10s increment.
  - 0%–9% displays `mdi:battery-alert` (or `mdi:battery-charging-outline` when charging).
  - Unknown/NaN states display `mdi:battery-unknown`.
* Fixed warning/error priority order so critical battery levels (< 15%) properly receive `state-error`.

### 4. Container & iOS Safari Pseudo-Fullscreen
* **Desktop Fullscreen:** Fullscreen expands the entire card container (`ha-card`), keeping door locks, lights, siren controls, and glance sensors interactive over the video stream.
* **iOS Safari Fallback:** Activates a dedicated pseudo-fullscreen mode that expands the card to fill the mobile viewport, dismissing cleanly on stop, touch outside, or `Escape`.

### 5. Dual-Naming Entity Resilience
* Works seamlessly with both modern (`<device>_<function>`, e.g. `sensor.aarlo_front_battery_level`) and legacy (`<function>_<device>`, e.g. `sensor.aarlo_battery_level_front`) entity IDs without requiring card configuration changes.
* Auto-resolves camera spotlights, floodlights, and doorbells automatically.

---

## 📦 Upgrading via HACS

To update to this beta release via HACS:
1. Open **HACS → Frontend → Aarlo Glance**.
2. Select the three dots menu in the top right and choose **Redownload**.
3. Toggle **Show beta versions** on and select **v0.4.0-beta.1**.
4. Clear your browser cache or perform a hard refresh (**Ctrl+Shift+R** / **Cmd+Shift+R**) to load the updated bundle.
