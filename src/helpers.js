
export function _real(value) {
    return value !== undefined && value !== null
}
export function _array( config, value = [] ) {
    if( !config ) {
        return value
    }
    if( typeof config === "string" ) {
        return config.includes("|") ? config.split("|") : config.split(",")
    }
    if( typeof config === "number" ) {
        return [ config ]
    }
    return config
}
export function _value( config, value = null ) {
    return config ? config : value
}
export function _value_int( config, value = 0 ) {
    return parseInt( _value( config, value ) )
}
export function _value_float( config, value = 0 ) {
    return parseFloat( _value( config, value ) )
}
export function _includes( config, item, value = false ) {
    if (config) {
        config.split(",").forEach((citem) => {
            if (citem === item) {
                value = true;
            }
        })
    }
    return value;
}

/**
 * Replace all of `from` with `to` and return the new string.
 *
 * @param old_string string we are converting
 * @param from what to replace
 * @param to what to replace it with
 * @returns {*} the new string
 * @private
 */
export function _replaceAll( old_string, from, to ) {
    if (!old_string) {
        return "";
    }
    return old_string.split(from).join(to);
}
export function _mergeArrays( left, right ) {
    let merged = Object.assign( {}, left )
    return Object.assign( merged, right )
}
export function _tsi(title, state, icon ) {
    return {
        title: title,
        state: state,
        icon:  icon
    }
}

const BATTERY_ICONS = {
    0: "mdi:battery-alert",
    10: "mdi:battery-10",
    20: "mdi:battery-20",
    30: "mdi:battery-30",
    40: "mdi:battery-40",
    50: "mdi:battery-50",
    60: "mdi:battery-60",
    70: "mdi:battery-70",
    80: "mdi:battery-80",
    90: "mdi:battery-90",
    100: "mdi:battery",
};

const BATTERY_CHARGING_ICONS = {
    0: "mdi:battery-charging-outline",
    10: "mdi:battery-charging-10",
    20: "mdi:battery-charging-20",
    30: "mdi:battery-charging-30",
    40: "mdi:battery-charging-40",
    50: "mdi:battery-charging-50",
    60: "mdi:battery-charging-60",
    70: "mdi:battery-charging-70",
    80: "mdi:battery-charging-80",
    90: "mdi:battery-charging-90",
    100: "mdi:battery-charging",
};

export function batteryLevelIcon(batteryLevel, isBatteryCharging = false) {
    const batteryValue = Number(batteryLevel);
    if (isNaN(batteryValue)) {
        if (batteryLevel === "off") {
            return "mdi:battery";
        }
        if (batteryLevel === "on") {
            return "mdi:battery-alert";
        }
        return "mdi:battery-unknown";
    }

    if (batteryValue < 0) {
        return "mdi:battery-unknown";
    }

    const threshold = batteryValue >= 100 ? 100 : Math.max(0, Math.floor(batteryValue / 10) * 10);
    if (isBatteryCharging) {
        return BATTERY_CHARGING_ICONS[threshold];
    }
    return BATTERY_ICONS[threshold];
}
