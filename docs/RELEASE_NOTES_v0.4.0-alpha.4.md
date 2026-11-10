# 🚀 Lovelace Hass Aarlo v0.4.0-alpha.4 — Release Notes

> Version `0.4.0-alpha.4` introduces **native WebRTC live streaming** for cameras that support it, with instant startup, zero transcoding latency, and seamless switching between live streams and recorded library media.

---

## 🌟 What's New in v0.4.0-alpha.4

### 1. Native Home Assistant WebRTC Live View
* **Automatic Detection**: When streaming a camera that advertises `web_rtc` stream type (or configured with `webrtc` / `sip` in `image_view`), the card automatically connects via native WebRTC instead of HLS.
* **Direct Signaling**: Negotiates live video over Home Assistant's native WebSocket (`camera/webrtc/get_client_config`, `camera/webrtc/offer`, and `camera/webrtc/candidate`).
* **Media Attachment**: Directly assigns the live WebRTC `MediaStream` to the card's `<video>` element, preserving all glance icons, door/light controls, and modal views.
* **Instant Teardown**: Automatically closes the peer connection and unsubscribes from signaling on stream stop or modal close, immediately releasing the camera.

### 2. Seamless Library & Recording Playback
* When clicking a recorded video in the library view, any active WebRTC or HLS stream is automatically stopped to avoid camera firmware conflicts.
* Video source resets cleanly between WebRTC `MediaStream` (`srcObject`) and recorded MP4 playback (`src`).
