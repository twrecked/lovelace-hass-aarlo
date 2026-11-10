# 🚀 Lovelace Hass Aarlo v0.4.0-alpha.5 — Release Notes

> Version `0.4.0-alpha.5` introduces **pseudo-fullscreen streaming and enhanced overlay controls**, ensuring video streams can expand to full screen across desktop and mobile devices without losing access to door locks, lights, or glance icons.

---

## 🌟 What's New in v0.4.0-alpha.5

### 1. Container-Level Fullscreen with Overlay Controls
* **Preserved Controls**: Clicking fullscreen on desktop browsers elevates the entire card container (`ha-card` or modal viewer) into fullscreen rather than isolating the raw `<video>` element.
* **Always Accessible**: Door lock buttons, light switches, glance sensors, and video controls remain interactive over the live stream or recording playback while in fullscreen.
* **Synced Button State**: The fullscreen control button dynamically toggles between `mdi:fullscreen` and `mdi:fullscreen-exit` with matching localized tooltips.

### 2. iOS Safari Pseudo-Fullscreen
* **Viewport Expansion**: On iPhone / iOS Safari where the HTML5 Fullscreen API is restricted for custom DOM elements, clicking fullscreen activates a dedicated **pseudo-fullscreen** mode that expands the card to fill the browser viewport.
* **Keyboard & Touch Dismiss**: Easily exit pseudo-fullscreen using the overlay exit button, touching outside, or pressing the `Escape` key on physical keyboards.
* **Automatic Teardown**: Exiting or stopping a stream or video playback automatically exits all fullscreen states, cleanly restoring background page scrolling.

### 3. Touch & Mobile Refinements
* Extended video control overlay display timeouts on touch and mobile devices (4 seconds vs 2 seconds) for comfortable control interaction.
* Added touch event debouncing to prevent accidental control flashing during multi-touch gestures.

### 4. Secondary Door Sensor Status Fix
* Fixed status tooltip lookup for secondary door contact sensors (`door2`) to correctly use `door_open` and `door_closed` localization keys instead of nonexistent `door2_*` keys.
