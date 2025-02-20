# lovelace-hass-arlo

## Version 0.3

**Be warned, 0.3 is beta**

It's working for me, but be prepared to return to version 0.2 if things go
wrong.

### **Breaking Changes**

**The "Old Configuration" format has been deprecated, this code throw an error
if it detects the old style.** 

`smart` has been replaced with `smart-modal`

`direct` is ignored, the default is a _smart stream_ mode where it chooses to
stream directly from Arlo if it thinks it can. `arlo-stream` replaces `direct` and `ha-stream` is
new.

### Localisation
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
  Italian by [QuakeGio83](https://github.com/QuakeGio83); Swedish by [pierrebengtsson](https://github.com/pierrebengtsson)
* [JetBrains](https://www.jetbrains.com/?from=hass-aarlo) for the excellent
  **PyCharm IDE** and providing me with an open source license to speed up the
  project development.

  [![JetBrains](/images/jetbrains.svg)](https://www.jetbrains.com/?from=hass-aarlo)


<a name="installation"></a>
## Installation

Use one of the following 2 ways to install the card, I recommend 
**HACS**.

If, after installation, you can't see the card, you might need to clear the
browser cache and reload the page. On Chrome you can force this with
`CTRL+SHIFT+I` to open the developer tools and then `CTRL+SHIFT+R` to reload
the page.

<a name="installation-hacs"></a>
#### HACS
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

Aarlo is part of the default HACS store. If you're not interested in
development branches this is the easiest way to install.  See
[hass-aarlo-hacs](hacsinstall.md) for some hints on installing and setup using
HACS and the home assistant interface.

<a name="installation-from-script"></a>
#### From Script

You don't need to run this if you used **HACS** to install.

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

The card type is `custom:aarlo-glance`.


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

#### Global Options

| Name       | Type | Required | Supported Values                            |
|------------|------|----------|---------------------------------------------|
| global     | list | No       | active, muted, square, blended, small, tiny |

These are the options that determine the overall behaviour of the card.
  - `active`; for multi camera cards, the image will change to the most recently
    updated camera
  - `muted`; start in a muted state, mute state is remember across recordings
    and streams
  - `square`; use a square image; useful for Arlo Video Doorbells; this affects
    the library view as well.
  - `blended`; for multi camera cards; the library view will display all camera
    recordings spliced together
  - `small`; use smaller fonts and icons
  - `tiny`; use even smaller fonts and icons


#### Image Options

| Name       | Type | Required | Supported Values                                                                   |
|------------|------|----------|------------------------------------------------------------------------------------|
| image_view | list | No       | start-stream, start-recording, arlo-stream, ha-stream, modal, smart-modal, numeric |

These are the options that determine the overall behaviour of the card when
showing the image view.
  - `start-stream`; the card will start streaming when opened
  - `start-recording`; _not implemented yet_, the card will play recording when
    finished
  - `arlo-stream`; when streaming the card will access Arlo directly rather
    than go through Home Assistant
  - `ha-stream`; when streaming the card will always go through Home Assistant
  - `modal`; open the recording or stream in a modal window
  - `smart-modal`; open the recording or stream in a modal window on a desktop
    machine, show inline otherwise.
  - `numeric`;  have the library display the number of entries. After nine it
    will display 9+.

You only need to specify `arlo-stream` or `ha-stream` if you run into streaming
issues, the card will try to do the correct thing if neither of these is
specified.


| Name         | Type | Required | Supported Values                                                                        |
|--------------|------|----------|-----------------------------------------------------------------------------------------|
| image_top    | list | No       | name, date, status, motion, sound, battery, signal, library, stream, onoff, snapshot... |
| image_bottom | list | No       | name, date, status, motion, sound, battery, signal, library, stream, onoff, snapshot... |

These options determine what information and functions are available on the
image view. `image_top` controls what appears at the top and `image_bottom`
what appears at the bottom. If you leave one of the options blank nothing will
appear at that place on the image.
  - `name`; camera name
  - `date`; date/time of last capture
  - `status`; current camera status - for example, `Idle`, `Recording`
  - `motion`; motion detection status, click for history
  - `sound`; sound detection status, click for history
  - `battery`; current battery level, click for history 
  - `signal`; current wifi strength, click for history 
  - `library`; library status - are there any recordings today, any recordings at
    all, click to open the library view
  - `stream`; click to start a live stream
  - `onoff`; click to turn the camera on and off
  - `snapshot`; click to take a snapshot

If you have multiple cameras showing on one card the following options are
available:
  - `previous`; click to move to the previous camera
  - `next`; click to move to the next camera

The following options can be used if you used any Device Options. You can
always `SHIFT+CLICK` to see a device history.
  - `door`; door status
  - `lock`; lock status; click to lock and unlock
  - `bell`; door bell status, if you supply a mute switch then click to
    mute/unmute
  - `door2`; door2 status
  - `lock2`; lock status; click to lock and unlock
  - `bell2`; door bell status, if you supply a mute switch then click to
    mute/unmute
  - `light`; light status, click to turn off and on

##### Notes
To get the `aarlo` Device sensors to work correctly you need to enable the
corresponding `binary_sensor` or `sensor`. For example, to get motion
notifications working you need the following binary sensor enabled:

```yaml
binary_sensor:
  - platform: aarlo
    monitored_conditions:
    - motion
```


| Name        | Type | Required | Supported Values                |
|-------------|------|----------|---------------------------------|
| image_click | list | No       | stream, recording               |

This option determines what happens when you click the image
  - `stream`; start a live stream
  - `recording`; play the last recording

| Name           | Type    | Required | Default |
|----------------|---------|----------|---------|
| snapshot_retry | seconds | No       | 2,5     |

This option lets you change the image update retry times. If you find the
snapshot image doesn't update all the time try adding extra time outs.

#### Library Options

| Name         | Type | Required | Supported Values                                        |
|--------------|------|----------|---------------------------------------------------------|
| library_view | list | No       | start-recording, download, modal, smart-modal, duration |

This option determines the overall behaviour of the card when showing the
library view.
  - `start-recording`; _not implemented yet_, automatically show the recording when
    finished.
  - `download`; show an icon to download the video when the mouse hovers over
    the recording thumbnail
  - `modal`; open the recording or stream in a modal window
  - `smart-modal`; open the recording or stream in a modal window on a desktop
    machine, show inline otherwise.
  - `duration`; show how long the recording is

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

| Name            | Type      | Required | Default   |
|-----------------|-----------|----------|-----------|
| library_animal  | css color | no       | orangered |
| library_vehicle | css color | no       | yellow    |
| library_person  | css color | no       | lime      |
| library_package | css color | no       | cyan      |

These options determine the color of the highligh box.
  - `library_animal`; color to use when highlighting an animal
  - `library_vehicle`; color to use when highlighting a vehicle
  - `library_person`; color to use when highlighting a person
  - `library_package`; color to use when highlighting a package

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


## Customizing the Layout

You can use `image_top` and `image_bottom` to customize the icons and text in
the image. The card will keep the order you entered the icons in and will
allow you to groups items together. And unlink previous versions you can place
the icons at the top of the screen.

For example, the following entry will place some camera icons at the bottom of
the image. They are in the same group so the card will spread them across its
entire width.

```yaml
image_bottom: 'onoff,motion,library,stream,signal,sound,snapshot,battery'
```

![A Single Group](/images/single-group.png?raw=true)

In this example we create 2 groups using the `|` symbol. Now the first group
is placed to the left of the card and the second group to the right.

```yaml
image_bottom: 'onoff,motion,library,stream,signal,sound|snapshot,battery'
```

![Two Groups](/images/two-groups.png?raw=true)

In this example we create an empty group at the beginning which forces all the
icons to appear on the right of the card.

```yaml
image_bottom: '|onoff,motion,library,stream,signal,sound,snapshot,battery'
```

And this one places them at the top:

```yaml
image_top: 'onoff,motion,library,stream,signal,sound,snapshot,battery'
```

If you find the configuration is getting too wide you can also split the
groups up this way:

```yaml
image_bottom:
  - 'previous,sound,motion,battery,library,stream,snapshot'
  - 'door,lock,light,next'
```

If you find things too closely placed together a `,,` will insert a gap.

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
image_bottom: 'motion,library,stream,snapshot,battery'
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
global: active,blended
image_view: direct
image_top: 'name,status'
image_bottom: 'motion,library,stream,snapshot,battery'
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
global: active,blended
image_view: direct
image_top: 'name,status'
image_bottom: 'motion,library,play,snapshot,battery'
image_click: 'recordings'
library_sizes: '3,4,2'
```


<a name="further-documentation"></a>
##  Further Documentation
See [hass-aarlo](https://github.com/twrecked/hass-aarlo/blob/master/README.md)
for general Aarlo documentation.

