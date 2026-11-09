
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
