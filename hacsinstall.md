# lovelace-hass-arlo

## Hints for HACS installation

These notes are provided to help with a HACS install if you use the GUI rather than edit yaml. 

1. Install "HACS" as per their documentation [![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
2. Let the HACS addon download its data - this takes at least an hour to fetch data initially due to rate limiting - see HACS documentation.
3. Choose HACS from the Sidebar.
4. For installation of this card select the HACS ```Frontend``` option.
5. Click ```+ Explore & Download Repositories``` and search for "Lovelace Hass Arlo".
6. Choose ```Install this repository in HACS```.
7. Choose ```Install```. This completes the installation of the repository. 
8. You will be asked to refresh your browser to allow for the updated resources to be used. Click ```Reload``` to do this automatically.
9. Now you should edit your dashboard as usual to add the new card - one for each camera. When adding the aarlo-glance card you will need to choose the ```Manual``` option (bottom of the GUI list of available cards). Editing manually to insert some configuration.
code to match your camera.

Here is a working config for a camera known to Arlo as ```kitchen``` and to Home Assistant as ```camera.aarlo_kitchen```:
  
  ```
  type: 'custom:aarlo-glance'
  entity: camera.aarlo_kitchen
  name: A camera in my Kitchen
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
  ```
The options of ```top_title```, ```top_status``` and ```top_date``` can be set to ```true``` if you prefer the indicated information at the top of the card.

### Troubleshooting
Older versions of HACS and/or Home Assistant may not automatically load the resource as required, leading to a ```Custom element doesn't exist: aarlo-glance``` error message when trying to create the card. In that case, you can do it manually:

1. Select ```Settings``` or ```Configuration``` (depending on Home Assistant version) from the Sidebar.
2. Choose ```Dashboards``` or ```Lovelace Dashboards``` from the Settings panel.
3. Select ```Resources``` from the menu in the top right or click into the ```Resource``` tab.
4. Click ```+``` button to add a new resource and enter:

```
Url
/hacsfiles/lovelace-hass-aarlo/hass-aarlo.js 

Resource Type:
JavaScript Module
```

You should then be able to add the aarlo-glance element as shown above.
