# lovelace-hass-arlo

## Version 0.2

**Be warned, 0.2 is in alpha**

It's working for me, but it's very alpha so be prepared to return to
version 0.1 if things go wrong.

I've put it out there so people can try it if they want. The underlying
architecture is very different and (I hope) a lot more efficient.

The `library_sizes` config is a good place to start.

The card now supports localisation with English, French, German and Spanish 
provided at the moment. If anybody fancies translating into other languages,
look at `en.js`
[here](https://github.com/twrecked/lovelace-hass-aarlo/tree/master/lang), you
just need to translate the strings in quotes.


## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [How it looks](#how-it-looks)
- [Configuration](#configuration)
- [Further Documentation](#further-documentation)
- [Old Configuration](#old-configuration)


<a name="introduction"></a>
## Introduction
Lovelace card designed specifically for the [AArlo
Integration](https://github.com/twrecked/hass-aarlo).

<a name="introduction-features"></a>
#### Features
It provides:
* Motion and sound notifications.
* Access to the camera library recordings.
* Live streaming.
* Support for doorbell and door opening notifications.
* Support for toggling lights during streaming.

<a name="introduction-notes"></a>
#### Notes
This document assumes you are familiar with Home Assistant setup and configuration.

<a name="introduction-thanks"></a>
#### Thanks
Many thanks to:
* [Button Card](https://github.com/kuuji/button-card/blob/master/button-card.js)
  for a working lovelace card I could understand
* Translations: Spanish by [alceasan](https://github.com/alceasan); German by [TheDK](https://github.com/TheDK)
* [JetBrains](https://www.jetbrains.com/?from=hass-aarlo) for the excellent
  **PyCharm IDE** and providing me with an open source license to speed up the
  project development.

  [![JetBrains](/images/jetbrains.svg)](https://www.jetbrains.com/?from=hass-aarlo)


<a name="installation"></a>
## Installation

<a name="installation-hacs"></a>
#### HACS
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

Aarlo is part of the default HACS store. If you're not interested in
development branches this is the easiest way to install.  See
[hass-aarlo-hacs](hacsinstall.md) for some hints on installing and setup using
HACS and the home assistant interface.

<a name="installation-from-script"></a>
#### From Script

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

The card type is `aarlo-glance.js`.


<a name="how-it-looks"></a>
## How it looks

![The Image View](/images/arlo-glance-01.png?raw=true)

Reading from left to right you have the camera name, motion detection indicator,
captured clip indicator, battery levels, signal level and current state. If you
click the image the last captured clip will play, if you click the last captured
icon you will be show the video library thumbnails - see below. Clicking the
camera icon (not shown) will take a snapshot and replace the current thumbnail.
(See supported features for list of camera statuses)

![The Library View](/images/arlo-glance-02.png)

Clicking on the last captured clip will display thumbnail mode. Clicking on a
thumbnail starts the appropiate video.  You can currently only see the last 99
videos. If you move your mouse over a thumbnail it will show you time of capture
and, if you have a Smart subscription, a reason for the capture. **>** takes you
to the next page, **<** to the previous and **X** closes the window.



<a name="configuration"></a>
## Configuration

__From version 0.2 onwards the configuration settings have changed.__

_To continue using the previous configuration make sure to leave the `show`
option in your settings._

#### Card Type

| Name | Value                 | Description                            |
|------|-----------------------|----------------------------------------|
| type | `custom:aarlo-glance` | Tell lovelace this is an `aarlo` card. |

You have to tell `lovelace` the card type.

#### Simple or Multi Camera Configuration

Choose a single camera configuration or multiple camera configuration.
One of `entity` or `entities` must be used, if you supply both `entity` and
`entities` at the top level `entities` will take priority.

- Single Camera Configuration

| Name   | Type      | Required | Description                                                                                       |
|--------|-----------|----------|---------------------------------------------------------------------------------------------------|
| entity | entity_id | No       | Full entity id of camera this card is controlling - for example, `camera.aarlo_front_door_camera` |
| name   | String    | No       | Display name.                                                                                     |

- Multi Camera Configuration

| Name     | Type  | Required | Description                               |
|----------|-------|----------|-------------------------------------------|
| entities | array | No       | An array of single camera configurations. |

A multi camera configuration is an array of single camera configurations.
You can specify a shared configuration for most options so a multi camera
configuration can be as simple as:

```yaml
entities:
  - entity: camera.aarlo_front_door_camera
  - entity: camera.aarlo_front_camera
# shared options
```

#### Image Options

| Name       | Type  | Required | Supported Values                          |
|------------|-------|----------|-------------------------------------------|
| image_view | list  | No       | active, start-stream, direct, square      |

These are the options that determine the overall behaviour of the card when
showing the image view.
- `active`; for multi camera cards, the image will change to the most recently
  updated camera
- `start-stream`; the card will start streaming when opened
- `start-recording`; _not implemented yet_, the card will play recording when
  finished
- `direct`; when streaming the card will access Arlo directly rather than go
  through Home Assistant
- `square`; use a square image; useful for Arlo Video Doorbells; this affects
  the library view as well.


| Name         | Type | Required | Supported Values                                                                      |
|--------------|------|----------|---------------------------------------------------------------------------------------|
| image_top    | list | No       | name, date, status                                                                    |
| image_bottom | list | No       | name, date, status, motion, sound, battery, signal, library, stream, on_off, snapshot |

These options determine what information and functions are available on the
image view. `image_top` controls what appears at the top and `image_bottom`
what appears at the bottom.
  - `name`; camera name
  - `date`: date/time of last capture
  - `status`: current camera status - for example, `Idle`, `Recording`
  - `motion`: motion detection status, click for history
  - `sound`: sound detection status, click for history
  - `battery`: current battery level, click for history 
  - `signal`: current wifi strength, click for history 
  - `library`: library status - are there any recordings today, any recordings at
    all, click to open the library view
  - `stream`: click to start a live stream
  - `on_off`: click to turn the camera on and off
  - `snapshot`; click to take a snapshot

##### Notes
To get the `aarlo` Device sensors to work correctly you need to enable the
corresponding `binary_sensor` or `sensor`. For example, to get motion
notifications working you need the following binary sensor enabled:


| Name        | Type | Required | Supported Values                |
|-------------|------|----------|---------------------------------|
| image_click | list | No       | modal, smart, stream, recording |

This option determines what happens when you click the image
  - `modal`; open the recording or stream in a modal window
  - `smart`; open the recording or stream in a modal window on a desktop machine,
    shown in line otherwise.
  - `stream`; start a live stream
  - `recording`; play the last recording

| Name           | Type    | Required | Default |
|----------------|---------|----------|---------|
| snapshot_retry | seconds | No       | 2,5     |

This option lets you change the image update retry times. If you find the
snapshot image doesn't update all the time try adding extra time outs.

#### Library Options

| Name         | Type | Required | Supported Values                   |
|--------------|------|----------|------------------------------------|
| library_view | list | No       | blended, start-recording, download |

This option determines the overall behaviour of the card when showing the
library view.
  - `blended`; for multi camera cards; the library view will display all camera
    recordings spliced together
  - `start-recording`; _not implemented yet_, automatically show the recording when
    finished.
  - `download`; show an icon to download the video when the mouse hovers over
    the recording thumbnail

| Name          | Type | Required | Supported Values                |
|---------------|------|----------|---------------------------------|
| library_click | list | No       | modal, smart                    |

This option determine what happens when you click the image
  - `modal`; open the recording or stream in a modal window
  - `smart`; open the recording or stream in a modal window on a desktop
    machine, show inline otherwise.

| Name         | Type         | Required | Default |
|--------------|--------------|----------|---------|
| library_size | Integer list | No       | 3       |

This option sets the available library sizes. It is a comma separated list of
integer values; for example `3,6,1` and you can cycle through the sizes from the
library view. When you open the library view it will return the previous size
used.

| Name            | Type         | Required | Default |
|-----------------|--------------|----------|---------|
| library_regions | Integer list | No       | 3       |

This option sets the library sizes that will highlight the object that caused
the recording. The default value is `library_size`. This is useful for hiding
the highlight for larger library sizes.

| Name            | Type         | Required | Default |
|-----------------|--------------|----------|---------|
| max_recordings  | Integer      | No       | 100     |

This option specifies the maximum number of recordings to show in the library.
It is per camera.

#### Device Options

| Name            | Type      | Description                      |
|-----------------|-----------|----------------------------------|
| door            | entity_id | A door contact switch.           |
| door_lock       | entity_id | A door lock switch.              |
| door_bell       | entity_id | A door bell.                     |
| door_bell_mute  | entity_id | A switch to mute `door_bell`.    |
| door2           | entity_id | A door contact switch.           |
| door2_lock      | entity_id | A door lock switch.              |
| door2_bell      | entity_id | A door bell.                     |
| door2_bell_mute | entity_id | A switch to mute `door2_bell`.   |
| light           | entity_id | A light switch.                  |

These options are useful if the camera is pointing at a door.

As well as reporting camera status the card can report on and operate other
devices. The card can tell you if doors are open, show and operate door locks,
show and operate lights and show and operate door bells.

The door lock and light controls will appear on the live stream.

#### Arlo Device Options

| Name       | Type   | Description                                        | 
|------------|--------|----------------------------------------------------|
| motion_id  | String | Override the calculated motion device name         |
| sound_id   | String | Override the calculated sound device name          |
| battery_id | String | Override the calculated battery device name        |
| signal_id  | String | Override the calculated signal device name         |
| capture_id | String | Override the calculated captured today device name |
| last_id    | String | Override the calculated last captured device name  |

If you don't change the device names `aarlo` gives you won't need to change
these options, they are based on the entity you set. If you do change the name
or want to use a device not provided by `aarlo` then use these.

```yaml
binary_sensor:
  - platform: aarlo
    monitored_conditions:
    - motion
```

#### Advanced Options

You won't generally need to change these.

| Name             | Type    | Default | Description                                                          |
|------------------|---------|---------|----------------------------------------------------------------------|
| card_size        | integer | 3       | Tell `lovelace` how much space to allocate for the card.             |
| id               | string  |         | Override the HTML element `id` the card uses.                        |
| logging          | boolean | false   | Set to true to enable logging to the browser console.                |
| modal_multiplier | float   | 0.8     | Set this to change how much space the modal window will try to take. |
| swipe_threshold  | integer | 150     | Set this to change how long a swipe has to be to register.           |


## Example Configurations

#### A Single Camera Card

This card is a single camera with custom library sizes that can monitor a door
and control the door's lock.

```yaml
type: 'custom:aarlo-glance'
entity: camera.aarlo_front_door_camera
name: front door
image_view: direct
image_top: 'name,status'
image_bottom: 'motion,library,play,snapshot,battery'
image_click: 'recordings'
library_sizes: '3,4,2'
door: binary_sensor.front_door
door_lock: lock.front_door_lock
```

#### Multi Camera Card #1

This card is a multi camera card with custom library sizes where both cameras
are monitoring the same door. The image will change to the most recently
active camera and the library view is blended.

```yaml
type: 'custom:aarlo-glance'
entities:
  - entity: camera.aarlo_front_door_camera
    name: front door
  - entity: camera.aarlo_front_camera
    name: front
image_view: direct,active
library_view: blended
image_top: 'name,status'
image_bottom: 'motion,library,play,snapshot,battery'
image_click: 'recordings'
library_sizes: '3,4,2'
door: binary_sensor.front_door
door_lock: lock.front_door_lock
```

#### Multi Camera Card #2

This card is a multi camera card with custom library sizes where both cameras
are monitoring their own door. The image will change to the most recently
active camera and the library view is blended.

```yaml
type: 'custom:aarlo-glance'
entities:
  - entity: camera.aarlo_front_door_camera
    name: front door
    door: binary_sensor.front_door
    door_lock: lock.front_door_lock
  - entity: camera.aarlo_back_door_camera
    name: back door
    door: binary_sensor.back_door
    door_lock: lock.back_door_lock
image_view: direct,active
library_view: blended
image_top: 'name,status'
image_bottom: 'motion,library,play,snapshot,battery'
image_click: 'recordings'
library_sizes: '3,4,2'
```


<a name="further-documentation"></a>
##  Further Documentation
See [hass-aarlo](https://github.com/twrecked/hass-aarlo/blob/master/README.md)
for general Aarlo documentation.


<a name="old-configuration"></a>
## Old Configuration

__From version 0.2 onwards the configuration settings have changed.__

_This way of configuring the card is deprecated. It will continue to work for
for now but it will be going away. Please use [Configuration](#configuration)
instead._

The card supports the following configuration items:

| Name             | Type          | Default        | Supported options                                                                             | Description                                                                                                          |
| -------------    | ------------- | -------------- | ---------------------------------------------------------------------------------------       | -----------------------------------------                                                                            |
| type             | string        | **required**   | `custom:aarlo-glance`                                                                         |                                                                                                                      |
| entity           | string        | **required**   | full camera entity_id                                                                         |                                                                                                                      |
| camera           | string        | **required**   | camera name                                                                                   |                                                                                                                      |
| name             | string        |                | Display Name                                                                                  |                                                                                                                      |
| show             | string list   | **required**   | [motion, sound, snapshot, battery_level, signal_strength, captured_today, image_date, on_off] | all items are optional but you must provide at least 1                                                               |
| hide             | string list   |                | [title, status, date ]                                                                        | Hide this information from the card.                                                                                 |
| top_title        | boolean       | false          |                                                                                               | Show the title at the top of the card                                                                                |
| top_status       | boolean       | false          |                                                                                               | Show the status at the top of the card                                                                               |
| top_date         | boolean       | false          |                                                                                               | Show the date at the top of the card                                                                                 |
| image_view       | string        |                | ['active']                                                                                    | 'active' will change a multicamera card to the latest camera on activity.                                            |
| image_click      | string        | play           | ['modal','smart','stream','recording']                                                        | Action to perform when image is clicked. Remove attribute to play last recorded video when image is clicked.         |
| aspect_ratio     | string        |                | ['square']                                                                                    | Use 'square' if you have a video doorbell camera.                                                                    |
| library_view     | string        |                | ['blended']                                                                                   | 'blended' will join all the camera recordings into a single library.                                                 |
| library_click    | string        |                | ['modal','smart']                                                                             | Action to perform when library image is clicked. Remove attribute to play last recorded video when image is clicked. |
| library_sizes    | integer list  | [3]            |                                                                                               | List of grid sizes for the library to use.                                                                           |
| library_regions  | integer list  | library_sizes  |                                                                                               | List of grid sizes to show trigger item in colored box.                                                              |
| library_animal   | css color     | orangered      | Any valid CSS color                                                                           | Color box to use when an animal triggered the recording.                                                             |
| library_vehicle  | css color     | yellow         | Any valid CSS color                                                                           | Color box to use when an vehicle triggered the recording.                                                            |
| library_person   | css color     | lime           | Any valid CSS color                                                                           | Color box to use when an person triggered the recording.                                                             |
| modal_multiplier | float         | 0.7            | float from 0.1 -> 1.0                                                                         | How big to make the modal window, as a fraction of the main window size.                                             |
| auto_play        | boolean       | false          |                                                                                               | If true, automatically start stream when card is viewed.                                                             |
| max_recordings   | integer       | 99             | Any positive integer.                                                                         | Limit the numnber of videos downloaded for the library viewer.                                                       |
| lang             | string        | en             | Any valid language code.                                                                      | Use the language `lang` whrn displaying the card.                                                                    |
| swipe_threshold  | integer       | 150            | Any positive integer.                                                                         | How far to move to reigster a left swipe on the library card.                                                        |
| card_size        | integer       | 3              | Any positive integer.                                                                         | Tell the UI how big to make the card.                                                                                |
| logging          | boolean       | false          | true of false                                                                                 | If true card will write out debug to console.                                                                        |
| door             | string        | entity_id      |                                                                                               | Useful if the camera is pointed at a door.                                                                           |
| door_lock        | string        | entity_id      |                                                                                               |                                                                                                                      |
| door_bell        | string        | entity_id      |                                                                                               |                                                                                                                      |
| door_bell_mute   | string        | entity_id      |                                                                                               | Switch to mute the chime of the door.                                                                                |
| door2            | string        | entity_id      |                                                                                               | Useful if the camera is pointed at a door.                                                                           |
| door2_lock       | string        | entity_id      |                                                                                               |                                                                                                                      |
| door2_bell       | string        | entity_id      |                                                                                               |                                                                                                                      |
| door2_bell_mute  | string        | entity_id      |                                                                                               | Switch to mute the chime of the door.                                                                                |
| light            | string        | entity_id      |                                                                                               | Control a light near the camera.                                                                                     |
| light_left       | boolean       | false          |                                                                                               | Place light control on left of card                                                                                  |
| camera_id        | string        |                |                                                                                               | Override the calculated camera device name                                                                           |
| motion_id        | string        |                |                                                                                               | Override the calculated motion device name                                                                           |
| sound_id         | string        |                |                                                                                               | Override the calculated sound device name                                                                            |
| battery_id       | string        |                |                                                                                               | Override the calculated battery device name                                                                          |
| signal_id        | string        |                |                                                                                               | Override the calculated signal device name                                                                           |
| capture_id       | string        |                |                                                                                               | Override the calculated captured today device name                                                                   |
| last_id          | string        |                |                                                                                               | Override the calculated last captured device name                                                                    |

### `entity` vs `camera`
You only need one of these. `entity` is the full camera entity id - for
example, `camera.aarlo_front_door` while `camera` is just the name portion -
for example, `aarlo_front_door`.

### Naming
If you don't change entity names you don't need to worry about this.

The code tries to be smart about mapping cameras to device names and as long as
you follow certain rules the card can automatically generate device names.

Given the entity id `camera.aarlo_front_door`, you get a `prefix` of "aarlo_"
and a `camera_name` of "front_door".

Given the entity id `camera.front_door`, you get a `prefix` of "" and a
`camera_name` of "front_door".

The device names are calculated as:
* motion device = `binary_sensor.${prefix}motion_${camera_name}`
* sound device = `binary_sensor.${prefix}sound_${camera_name}`
* battery device = `sensor.${prefix}battery_level_${camera_name}`
* signal_device = `sensor.${prefix}signal_strength_${camera_name}`
* capture_today_device = `sensor.${prefix}captured_today_${camera_name}`
* last_capture_device = `sensor.${prefix}last_${camera_name}`

If you rename any of the `aarlo` using a different scheme you will need to
provide the full device name to get motion, sound, battery, signal, capture or
last capture notifications to work. See the corresponding `*_id` configuration
item.

### `show` options
* `motion`: an icon that indicates when motion is detected
* `sound`: an icon that indicates when sound is detected
* `battery_level`: an icon that shows current battery level
* `signal_strength`: an icon that shows wifi signal strength
* `snapshot`: an icon that takes a snapshot when pressed
* `captured_today`: an icon with descriptive text showing how many recordings
  have been captured today.
* `image_date`: an icon with descriptive text showing when the last image was
  taken
* `on_off`: a switch allowing the camera to be turned off and on

### `image_click` and `library_click`
These are comma separated lists that describe how to handle a click on the
image or library window.
* `stream`: play the live stream, does nothing on library click
* `recording`: play the last recording, does nothing on library click which
  always plays the selected recording
* `modal`: force a modal window, might not work well on mobile devices
* `smart`: use a `modal` window on desktops and `non-modal` on mobile devices.

#### Notes
To get the first four `show` items to work correctly you need to enable the
corresponding `binary_sensor` or `sensor`. For example, to get motion
notifications working you need the following binary sensor enabled:

```yaml
binary_sensor:
  - platform: aarlo
    monitored_conditions:
    - motion
```



#### Example

The following is my front door camera configuration.

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
light: light.aarlo_front_light
```

You don't need to reboot to see the GUI changes, a reload is sufficient. And if
all goes will see a card that looks like this:



