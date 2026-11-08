# Lovelace Aarlo Glance Card Configuration Guide (`AGENTS.config.md`)

This guide is designed for AI agents and developers configuring or migrating cards for `custom:aarlo-glance` (v0.4.0+).

---

## 1. Quick Reference: Modern Configuration Anatomy

### 1.1 Minimal Single Camera Card
```yaml
type: custom:aarlo-glance
entity: camera.aarlo_kitchen
name: Kitchen
image_top: name,status
image_bottom: motion,library,stream,snapshot,battery
image_click: stream
library_view: duration,download
library_sizes: 2,3
```

### 1.2 Video Doorbell with Lock & Light Controls
```yaml
type: custom:aarlo-glance
entity: camera.aarlo_front_door
name: Front Door
image_view: square
image_top: name,date
image_bottom: motion,sound,library,stream,snapshot,battery|bell,lock,light
image_click: stream
door_bell: binary_sensor.aarlo_ding_front_door
door_bell_mute: switch.aarlo_silent_mode_front_door
door_lock: lock.front_door_deadbolt
light: light.porch_light
library_view: duration,download
```

### 1.3 Multi-Camera with Blended Library
```yaml
type: custom:aarlo-glance
global: active,blended
image_view: numeric
image_top: name,status
image_bottom: motion,library,stream,snapshot,battery
library_view: download,duration
library_sizes: 2,3,4
entities:
  - entity: camera.aarlo_driveway
    name: Driveway
    light: light.floodlight
  - entity: camera.aarlo_backyard
    name: Backyard
```

---

## 2. Configuration Field Specifications

### 2.1 Core Identity
* `type`: (Required) Must be `custom:aarlo-glance`.
* `entity`: (Single camera) Full entity ID, e.g. `camera.aarlo_front_door`.
* `entities`: (Multi-camera) List of camera configurations or entity IDs.
* `name`: Optional display name override. If omitted, uses Home Assistant's `friendly_name`.

### 2.2 Bar Layout: `image_top` and `image_bottom`
Controls the widgets displayed along the top and bottom overlays of the camera preview.
* Can be formatted as a comma-separated string or a YAML list.
* Use `|` (pipe) to separate left-aligned widgets from right-aligned widgets:
  ```yaml
  image_top: name,status|date
  image_bottom: motion,sound,battery|stream,snapshot
  ```

#### Supported Bar Items:
| Item Key | Type | Description |
|---|---|---|
| `name` | Text | Camera display name. |
| `date` | Text | Timestamp of the last capture or snapshot. |
| `status` | Text | Current camera state (`Idle`, `Streaming`, `Recording`, etc.). |
| `motion` | Icon | Motion sensor state (clicking opens more-info). |
| `sound` | Icon | Audio detection state (clicking opens more-info). |
| `battery` | Icon | Battery percentage and charging indicator. |
| `signal` | Icon | Wi-Fi / base station signal strength. |
| `library` | Icon | Library recording count / open library view. |
| `stream` | Icon | Start or stop the live stream. |
| `onoff` | Icon | Toggle camera power on or off. |
| `snapshot` | Icon | Request an on-demand snapshot. |
| `door` | Icon | Primary door state sensor (`binary_sensor`). |
| `bell` | Icon | Primary doorbell chime sensor. Click to mute/unmute if `door_bell_mute` is provided. |
| `lock` | Icon | Primary door lock entity. Click to toggle; shift-click for more-info. |
| `light` | Icon | Primary light entity. Click to toggle; shift-click for more-info. |
| `door2` / `bell2` / `lock2` / `light2` | Icon | Secondary door, bell, lock, or light controls. |
| `previous` / `next` | Icon | Chevron buttons to cycle cameras in multi-camera setups. |

### 2.3 Streaming Options (`image_view`)
Controls how streaming and preview views operate:
* `ha-stream`: **(Default in v0.4+)** Proxies stream through Home Assistant (`camera/stream`). Receives RTSPS into Home Assistant and delivers HLS to the browser. Avoids CORS and cloud timeouts.
* `arlo-stream`: Direct cloud streaming using MPEG-DASH from Arlo media servers.
* `modal`: Opens live stream or recording in a modal dialog.
* `smart-modal`: Opens in a modal on desktop browsers, but plays inline on mobile screens.
* `start-stream`: Autoplays the live stream as soon as the card mounts.
* `numeric`: Displays badge with actual number of recordings (e.g. `3` or `9+`) over the library icon.
* `square`: Sets aspect ratio to 1:1 (ideal for Arlo Video Doorbells).

### 2.4 Click Actions (`image_click`)
Controls what happens when the camera preview image is clicked:
* `stream`: Clicking the preview starts the live stream.
* `recording`: Clicking the preview plays the most recent recording clip.

### 2.5 Library Viewer Settings
* `library_view`: Comma-separated or list of options:
  * `download`: Displays a download icon over thumbnails to save MP4 files.
  * `duration`: Overlays video duration on each thumbnail.
  * `blended`: Merges library clips from all cameras in a multi-camera card into a single chronological feed.
  * `smart-modal`: Opens library video player in modal on desktop, inline on mobile.
* `library_sizes`: Comma-separated grid sizes (e.g. `2,3,4` for 2x2, 3x3, 4x4). Clicking the grid button cycles through sizes.
* `max_recordings`: Maximum number of clips to fetch (default: `99`).
* `library_animal` / `library_vehicle` / `library_person` / `library_package`: Border highlight colors for detected objects in thumbnails (e.g. `library_person: lime`).

### 2.6 Card & Global Options
* `global`: Comma-separated list of flags: `active` (auto-focus last active camera), `muted` (mute videos by default), `blended`, `small`, `tiny`.
* `logging`: `true` enables verbose diagnostic logging to the browser console.
* `card_size`: Integer card height reported to Lovelace layout engines (default: `3`).

---

## 3. Migrating Legacy (Pre-0.3) Configurations to v0.4

Pre-0.3 configurations used a deprecated `show:` array and individual boolean flags (`top_title`, `top_date`, `play_direct`). Version 0.4 completely replaces this with `image_top` and `image_bottom`.

### 3.1 Migration Mapping Matrix

| Legacy (Pre-0.3) Setting | Modern (v0.4+) Equivalent | Notes |
|---|---|---|
| `top_title: true` | `image_top: ...name...` | Add `name` to `image_top` |
| `top_date: true` | `image_top: ...date...` | Add `date` to `image_top` |
| `top_status: true` | `image_top: ...status...` | Add `status` to `image_top` |
| `show:` list | `image_bottom:` list | Items are translated using the item map below |
| `play_direct: true` | `image_view: arlo-stream` | **Omit unless direct DASH is explicitly needed.** Default `ha-stream` is now recommended. |
| `auto_play: true` | `image_view: start-stream` | Replaced by `start-stream` |
| `image_click: smart` | `image_view: smart-modal` | Replaced by `smart-modal` |
| `image_click: live` or `play` | `image_click: stream` | Standardized to `stream` |
| `image_click: direct` | `image_view: arlo-stream` | Replaced by `arlo-stream` |
| `camera: my_cam` | `entity: camera.aarlo_my_cam` | Full entity ID is required in modern config |
| `prefix: aarlo_` | In `entity:` | Obsolete; include prefix in entity ID |

### 3.2 Legacy Item Translation Map

When converting items inside the old `show:` list into `image_bottom`:

| Old `show:` Item | Modern Item in `image_bottom` |
|---|---|
| `motion` | `motion` |
| `sound` | `sound` |
| `battery_level` | `battery` |
| `battery` | `battery` |
| `signal_strength` | `signal` |
| `signal` | `signal` |
| `captured_today` | `library` |
| `captured` | `library` |
| `library` | `library` |
| `play` | `stream` |
| `on_off` | `onoff` |
| `snapshot` | `snapshot` |

---

## 4. Migration Examples

### Example 1: Basic Single Camera
#### ❌ Legacy (Pre-0.3) Configuration:
```yaml
type: custom:aarlo-glance
camera: front
top_title: true
top_status: true
show:
  - motion
  - battery_level
  - signal_strength
  - captured_today
  - play
  - snapshot
image_click: play
```

#### ✅ Modern (v0.4+) Configuration:
```yaml
type: custom:aarlo-glance
entity: camera.aarlo_front
name: Front
image_top: name,status
image_bottom: motion,battery,signal,library,stream,snapshot
image_click: stream
```

---

### Example 2: Doorbell with Door Lock & Chime Mute
#### ❌ Legacy (Pre-0.3) Configuration:
```yaml
type: custom:aarlo-glance
camera: doorbell
top_title: true
top_date: true
show:
  - motion
  - sound
  - captured_today
  - play
door: binary_sensor.front_door
door_bell: binary_sensor.aarlo_ding_doorbell
door_bell_mute: switch.aarlo_silent_mode_doorbell
door_lock: lock.front_door_lock
image_click: smart
play_direct: true
```

#### ✅ Modern (v0.4+) Configuration:
```yaml
type: custom:aarlo-glance
entity: camera.aarlo_doorbell
image_view: square,smart-modal
image_top: name,date
image_bottom: motion,sound,library,stream|bell,lock
image_click: stream
door: binary_sensor.front_door
door_bell: binary_sensor.aarlo_ding_doorbell
door_bell_mute: switch.aarlo_silent_mode_doorbell
door_lock: lock.front_door_lock
```

---

### Example 3: Multi-Camera Blended Card
#### ❌ Legacy (Pre-0.3) Configuration:
```yaml
type: custom:aarlo-glance
entities:
  - camera: deck
    top_title: true
    show:
      - motion
      - play
  - camera: patio
    top_title: true
    show:
      - motion
      - play
blended: true
active: true
```

#### ✅ Modern (v0.4+) Configuration:
```yaml
type: custom:aarlo-glance
global: active,blended
image_top: name,status
image_bottom: motion,stream,library,battery
image_click: stream
library_view: duration,download
entities:
  - entity: camera.aarlo_deck
  - entity: camera.aarlo_patio
```

---

## 5. Agent Verification Checklist

When generating or editing a card configuration:
1. [ ] Is `type` strictly `custom:aarlo-glance`?
2. [ ] Does `entity` contain a valid entity ID (e.g. `camera.aarlo_*`)?
3. [ ] Are old options (`show:`, `top_title`, `top_date`, `top_status`, `play_direct`, `prefix`) completely absent?
4. [ ] Are widget names modern (`battery` not `battery_level`, `signal` not `signal_strength`, `library` not `captured_today`, `stream` not `play`, `onoff` not `on_off`)?
5. [ ] Is `image_view` utilizing default `ha-stream` unless the user explicitly requested `arlo-stream`?
