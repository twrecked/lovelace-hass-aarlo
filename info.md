# lovelace-hass-arlo

Lovelace card designed specifically for the [AArlo Integration](https://github.com/twrecked/hass-aarlo).

### **Breaking Changes**

**The "Old Configuration" format has been deprecated, this code throws an error
if it detects the old style.**

## Version 0.3

**Be warned, 0.3 is beta**

It's working for me, but be prepared to return to version 0.2 if things go
wrong.

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
