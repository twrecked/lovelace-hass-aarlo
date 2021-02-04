# lovelace-hass-arlo

Lovelace card designed specifically for the [AArlo Integration](https://github.com/twrecked/hass-aarlo).

## Version 0.2

**Be warned, 0.2 is in alpha**

It's working for me, but it's very alpha so be prepared to return to
version 0.1 if things go wrong.

I've put it out there so people can try it if they want. The underlying
architecture is very different and (I hope) a lot more efficient.

The `library_sizes` config is a good place to start.

The card now supports localisation but only English is provided at the
moment. If anybody fancies translating look at `en.js`
[here](https://github.com/twrecked/lovelace-hass-aarlo/tree/master/lang), you
just need to translate the strings.


## Features
It provides:
* Motion and sound notifications.
* Access to the camera library recordings.
* Live streaming.
* Support for doorbell and door opening notifications.
* Highlighting what caused the event.

## Example
![The Image Window](/images/arlo-glance-01.png)

## Documentation
See [hass-aarlo](https://github.com/twrecked/hass-aarlo/blob/master/README.md) for full documentation.

## Notes
Module has to be installed with `type: module` in UI header.
