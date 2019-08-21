# lovelace-hass-arlo

Lovelace card designed specifically for the [AArlo Integration](https://github.com/twrecked/hass-aarlo).

## Features
It provides:
* Motion and sound notifications.
* Access to the camera library recordings.
* Live streaming.
* Support for doorbell and door opening notifications.

## HACS Installtion
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
Aarlo is part of the default HACS store. If you're not interested in development branches this is the easiest way to install. HACS will tell you what to add to your UI configuration.

## Manual Installtion

```sh
install /config
# check output looks good
install go /config
```

Add the following to the top of your UI configuration file.

```yaml
resources:
  - type: module
    url: /local/aarlo-glance.js
```

## Custom Lovelace Card Configuration

| Name | Type | Default | Supported options | Description |
|-------------|-------------|--------------|---------------------------------------------------------------------------------------|-----------------------------------------|
| type | string | **required** | `custom:aarlo-glance` |  |
| entity | string | **required** | camera entity_id |  |
| name | string |  | Display Name |  |
| show | string list | **required** | [motion, sound, snapshot, battery_level, signal_strength, captured_today, image_date] | all items are optional but you must provide at least 1 |
| hide | string list | | [title, status, date ] | Hide this information from the card. |
| top_title | boolean | false |  | Show the title at the top of the card |
| top_status | boolean | false |  | Show the status at the top of the card |
| top_date | boolean | false |  | Show the date at the top of the card |
| image_click | string |  | ['play'] | Action to perform when image is clicked. Remove attribute to play last recorded video when image is clicked. |
| door | string | entity_id |  | Useful if the camera is pointed at a door. |
| door_lock | string | entity_id |  |  |
| door_bell | string | entity_id |  |  |
| door2 | string | entity_id |  | Useful if the camera is pointed at a door. |
| door2_lock | string | entity_id |  |  |
| door2_bell | string | entity_id |  |  |

### Example
```yaml
type: 'custom:aarlo-glance'
entity: camera.aarlo_front_door_camera
name: Front Door
show:
  - motion
  - sound
  - snapshot
  - battery_level
  - signal_strength
  - captured_today
  - image_date
top_title: false
top_status: false
top_date: false
image_click: play
door: binary_switch.front_door
door_lock: lock.front_door_lock
door_bell: binary_switch.aarlo_ding_front_door_bell
door2: binary_switch.front_door
door2_lock: lock.front_door_lock
door2_bell: binary_switch.aarlo_ding_front_door_bell
```

You don't need to reboot to see the GUI changes, a reload is sufficient. And if all goes will see a card that looks like this:

![Aarlo Glance](https://github.com/twrecked/hass-aarlo/blob/master/images/aarlo-glance-02.png)

Reading from left to right you have the camera name, motion detection indicator, captured clip indicator, battery levels, signal level and current state. If you click the image the last captured clip will play, if you click the last captured icon you will be show the video library thumbnails - see below. Clicking the camera icon (not shown) will take a snapshot and replace the current thumbnail. (See supported features for list of camera statuses)

Clicking on the last captured clip will display thumbnail mode. Clicking on a thumbnail starts the appropiate video.  You can currently only see the last 99 videos. If you move your mouse over a thumbnail it will show you time of capture and, if you have a Smart subscription, a reason for the capture. **>** takes you to the next page, **<** to the previous and **X** closes the window.

![Aarlo Thumbnails](https://github.com/twrecked/hass-aarlo/blob/master/images/thumbnails.png)

## Documentation
See [hass-aarlo](https://github.com/twrecked/hass-aarlo/blob/master/README.md) for general Aarlo documentation.

## Thanks
Many thanks to:
* [Button Card](https://github.com/kuuji/button-card/blob/master/button-card.js) for a working lovelace card I could understand
* [![JetBrains](/images/jetbrains.svg)](https://www.jetbrains.com/?from=hass-aarlo) for the excellent **PyCharm IDE** and providing me with an open source license to speed up the project development.

