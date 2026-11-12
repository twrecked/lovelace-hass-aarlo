import { CARD_VERSION } from "./const.js";
import { DEFAULT_MESSAGES } from "./localize.js";
import { CARD_STYLES } from "./styles.js";
import { ImageViewMixin } from "./views/image-view.js";
import { LibraryViewMixin } from "./views/library-view.js";
import { StreamViewMixin } from "./views/stream-view.js";
import {
    _real,
    _array,
    _value,
    _value_int,
    _value_float,
    _includes,
    _replaceAll,
    _mergeArrays,
    _tsi,
} from "./helpers.js";

export class AarloGlance extends HTMLElement {

    constructor() {
        super();

        // current version
        this._version = CARD_VERSION

        // State and config.
        this._ready = "stopped"
        this._hass = null;
        this._config = null;

        // Internationalisation.
        this._i = DEFAULT_MESSAGES

        // Maybe gs should be cs/ls; think about multiple videos going...
        this._gc = {}
        this._gs = {}
        this._cc = {}
        this._cs = {}
        this._lc = {}
        this._ls = {}
        this._cameraIndex = 0
        this._oldHassStates = null
    }

    render() {
        this.innerHTML = `
            <style>${CARD_STYLES}</style>
            <div class="w3-modal"
                 id="${this._id('modal-viewer')}"
                 style="display:none">
                <div class="w3-modal-content w3-animate-opacity aarlo-modal-base"
                     id="${this._id('modal-content')}">
                    <div class="aarlo-modal-video-wrapper"
                         id="${this._id('modal-video-wrapper')}">
                        <div class="aarlo-modal-video-background"
                             id="${this._id('modal-video-background')}">
                        </div>
                        <video class="aarlo-modal-video"
                               id="${this._id('modal-video-player')}"
                               style="display:none" playsinline muted>
                            Your browser does not support the video tag.
                        </video>
                        <div class="box box-bottom"
                               id="${this._id('modal-video-controls')}">
                        </div>
                    </div>
                </div>
            </div>
            <ha-card>
                <div class="aarlo-base aarlo-aspect-${this.gc.aspectRatio}"
                     id="${this._id('aarlo-wrapper')}">
                    <video class="aarlo-video"
                           id="${this._id('video-player')}"
                           style="display:none" playsinline muted>
                        Your browser does not support the video tag.
                    </video>
                    <img class="aarlo-image"
                         id="${this._id('camera-viewer')}"
                         style="display:none">
                    <div class="aarlo-image"
                         id="${this._id('library-viewer')}"
                         style="display:none">
                    </div>
                    <div class="aarlo-image aarlo-broken-image" 
                         id="${this._id('broken-image')}"
                         style="height: 100px">
                    </div>
                </div>
                <div class="box box-top"
                     id="${this._id('top-bar')}"
                     style="display:none">
                </div>
                <div class="box box-bottom"
                     id="${this._id('bottom-bar')}"
                     style="display:none">
                </div>
                <div class="box box-bottom"
                     id="${this._id('library-controls')}"
                     style="display:none">
                </div>
                <div class="box box-bottom"
                     id="${this._id('video-controls')}"
                     style="display:none">
                </div>
            </ha-card>`
    }

    static get properties() {
        return {
            // All handle internally
        }
    }

    updated(_changedProperties) {
        // All handle internally
    }

    connectedCallback() {
        if (this._ready === "ready") {
            this.updateView();
        }
    }

    disconnectedCallback() {
        this.exitAllFullScreen();
        if (this._keydownHandler) {
            window.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        if (this._fullscreenChangeHandler) {
            document.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
            document.removeEventListener('webkitfullscreenchange', this._fullscreenChangeHandler);
            this._fullscreenChangeHandler = null;
        }
        this.hideVideoControlsCancel();
        if (this.cs && this.cs.autoPlayTimer !== null) {
            clearTimeout(this.cs.autoPlayTimer);
            this.cs.autoPlayTimer = null;
        }
        this.destroyWebRTCStream();
        this.destroyHLSStream();
        if (this.gs && this.gs.dash) {
            try {
                this.gs.dash.reset();
            } catch (e) {}
            this.gs.dash = null;
        }
        const video = this._melement('video-player');
        if (video) {
            try {
                video.pause();
                video.src = "";
            } catch (e) {}
        }
    }

    _hasMonitoredEntitiesChanged(newHass) {
        if (!this._oldHassStates || !newHass || !newHass.states) {
            return true;
        }
        for (const ci in this._cc) {
            const cc = this._cc[ci];
            if (!cc) continue;
            const watched = [
                cc.id, cc.motionId, cc.soundId, cc.batteryId,
                cc.signalId, cc.capturedTodayId, cc.lastCaptureId,
                cc.doorId, cc.doorBellId, cc.doorBellMuteId, cc.doorLockId,
                cc.door2Id, cc.door2BellId, cc.door2BellMuteId, cc.door2LockId,
                cc.lightId, cc.light2Id, cc.sirenId
            ];
            for (const entityId of watched) {
                if (entityId && this._oldHassStates[entityId] !== newHass.states[entityId]) {
                    return true;
                }
            }
        }
        return false;
    }

    _recordMonitoredEntityStates(hass) {
        if (!hass || !hass.states) return;
        this._oldHassStates = {};
        for (const ci in this._cc) {
            const cc = this._cc[ci];
            if (!cc) continue;
            const watched = [
                cc.id, cc.motionId, cc.soundId, cc.batteryId,
                cc.signalId, cc.capturedTodayId, cc.lastCaptureId,
                cc.doorId, cc.doorBellId, cc.doorBellMuteId, cc.doorLockId,
                cc.door2Id, cc.door2BellId, cc.door2BellMuteId, cc.door2LockId,
                cc.lightId, cc.light2Id, cc.sirenId
            ];
            for (const entityId of watched) {
                if (entityId && hass.states[entityId]) {
                    this._oldHassStates[entityId] = hass.states[entityId];
                }
            }
        }
    }

    set hass( hass ) {
        this._resolveCameraEntities(hass);
        const hasChanged = this._hasMonitoredEntitiesChanged(hass);
        this._hass = hass;
        if ( this._ready === "stopped" ) {
            this._ready = "starting";
            this.initialSetup();
            this.render();
            this._recordMonitoredEntityStates(hass);
        } else if ( this._ready === "ready" && hasChanged ) {
            this._recordMonitoredEntityStates(hass);
            this.updateView();
        }
    }

    static async getConfigElement() {
        return document.createElement("aarlo-glance-editor");
    }

    static getStubConfig(hass, entities, entitiesFallback) {
        let cameraEntity = "camera.aarlo_camera";
        if (entities && entities.length > 0) {
            const found = entities.find(e => e.startsWith("camera.aarlo_") || e.startsWith("camera."));
            if (found) cameraEntity = found;
        } else if (hass && hass.states) {
            const found = Object.keys(hass.states).find(e => e.startsWith("camera.aarlo_"));
            if (found) cameraEntity = found;
        }
        return {
            type: "custom:aarlo-glance",
            entity: cameraEntity,
            image_top: "name,status",
            image_bottom: "motion,library,play,snapshot,battery",
        };
    }

    getLayoutOptions() {
        return {
            grid_columns: 4,
            grid_rows: 3,
            grid_min_columns: 2,
            grid_min_rows: 2,
        };
    }

    getCardSize() {
        return this.gc.cardSize
    }

    moreInfo( id ) {
        const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { entityId: id },
        });
        this.dispatchEvent(event);
        return event;
    }

    throwError( error ) {
        console.error( error );
        throw new Error( error )
    }

    _log( msg ) {
        if( this.gc.log ) {
            console.log( `${this.cc.id}: ${msg}` )
        }
    }

    _id( id ) {
        return `${id}-${this.gc.idSuffix}`
    }

    _mid( id ) {
        return (this.gs.viewer === "modal" ? "modal-" : "") + this._id(id)
    }

    /**
     * Look for card element in document.
     *
     * @param id The element or `null`
    */
    _element( id ) {
        return this.querySelector( "#" + this._id(id) )
    }

    /**
     * Look for modal card element in document.
     *
     * Automatically chooses modal name if modal window open.
     *
     * @param id The element or `null`
    */
    _melement( id ) {
        return this.querySelector( "#" + this._mid(id) )
    }

    __show( element, show ) {
        if ( element ) { element.style.display = (show ? '' : 'none') }
    }
    _show( id, show = true ) {
        this.__show( this._element(id), show )
    }
    _mshow( id, show = true ) {
        this.__show( this._melement(id), show )
    }

    __hide( element ) {
        if ( element ) { element.style.display = 'none' }
    }
    _hide( id ) {
        this.__hide( this._element(id) )
    }
    _mhide( id ) {
        this.__hide( this._melement(id) )
    }

    __isHidden( element ) {
        return element && element.style.display === 'none'
    }
    _misHidden( id ) {
        return this.__isHidden( this._melement(id) )
    }

    __title( element, title ) {
        if ( element ) { element.title = title }
    }
    __text( element, text ) {
        if ( element ) { element.innerText = text }
    }
    __alt( element, alt ) {
        if ( element ) { element.alt = alt }
    }
    __src( element, src ) {
        if ( element ) { element.src = src }
    }
    __poster( element, poster ) {
        if ( element ) { element.poster = poster }
    }
    __icon( element, icon ) {
        if ( element ) { element.icon = icon }
    }
    __state( element, state ) {
        let color = ""
        switch( state ) {
            case "on":
            case "state-on":
                color = "white"
                break
            case "warn":
            case "state-warn":
                color = "orange"
                break
            case "error":
            case "state-error":
                color = "red"
                break
            case "update":
            case "state-update":
                color = "#cccccc"
                break
            case "off":
            case "state-off":
                color = "#505050"
                break
        }
        if ( element ) {
            element.style.color = color
        }
    }

    /**
     * Set a variety of element values.
     *
     * It gets called a lot.
     */
    __set( element, title, text, icon, state, src, alt, poster ) {
        if (_real(title))  { this.__title( element, title ) }
        if (_real(text))   { this.__text ( element, text ) }
        if (_real(icon))   { this.__icon ( element, icon ) }
        if (_real(state))  { this.__state( element, state ) }
        if (_real(src))    { this.__src( element, src ) }
        if (_real(alt))    { this.__alt( element, alt ) }
        if (_real(poster)) { this.__poster( element, poster ) }
    }

    /**
     * Set a variety pieces of element data.
     *
     * @param id - ID of element to change
     * @param dictionary - Object containing changes. Not all entries need to
     *     be set.
     */
    _set( id, { title, text, icon, state, src, alt, poster } = {} ) {
        this.__set( this._element(id), title, text, icon, state, src, alt, poster )
    }
    /**
     * Set a variety pieces of element data.
     *
     * This uses the modal version when a modal window is open.
     *
     * @param id - ID of element to change
     * @param dictionary - Object containing changes. Not all entries need to
     *     be set.
     */
    _mset( id, { title, text, icon, state, src, alt, poster } = {} ) {
        this.__set( this._melement(id), title, text, icon, state, src, alt, poster )
    }

    _widthHeight(id, width, height, width_suffix = '' ) {
        let element = this._element(id)
        if ( element ) {
            if ( width !== null ) {
                element.style.setProperty("width",`${width}px`,width_suffix)
            }
            if ( height !== null ) {
                element.style.height = `${height}px`
            }
        }
    }

    _sizeSuffix() {
        if( this.gc.small ) {
            return "small"
        } else if( this.gc.tiny ) {
            return "tiny"
        }
        return "medium"
    }

    _paddingTop( id, top ) {
        let element = this._element(id)
        if ( element ) {
            if ( top !== null ) {
                element.style.paddingTop=`${top}px`
            }
        }
    }

    _findEgressToken( url ) {
        let parser = document.createElement('a');
        parser.href = url;
        let queries = parser.search.replace(/^\?/, '').split('&');
        for( let i = 0; i < queries.length; i++ ) {
            const split = queries[i].split('=');
            if( split[0] === 'egressToken' ) {
                return split[1]
            }
        }
        return 'unknown'
    }

    get gc() {
        return this._gc
    }
    set gc( value ) {
        this._gc = value
    }
    get gs() {
        return this._gs
    }
    set gs( value ) {
        this._gs = value
    }
    get cc() {
        if( !(`${this._cameraIndex}` in this._cc) ) {
            this._cc[`${this._cameraIndex}`] = {}
        }
        return this._cc[`${this._cameraIndex}`]
    }
    set cc( value ) {
        this._cc[`${this._cameraIndex}`] = value
    }
    get cs() {
        if( !(`${this._cameraIndex}` in this._cs) ) {
            this._cs[`${this._cameraIndex}`] = {}
        }
        return this._cs[this._cameraIndex]
    }
    set cs( value ) {
        this._cs[this._cameraIndex] = value
    }
    get lc() {
        if( !(`${this._cameraIndex}` in this._lc) ) {
            this._lc[`${this._cameraIndex}`] = {}
        }
        return this._lc[this.gc.blendedMode ? this._cameraCount : this._cameraIndex]
    }
    set lc( value ) {
        this._lc[this._cameraIndex] = value
    }
    get ls() {
        if( !(`${this._cameraIndex}` in this._ls) ) {
            this._ls[`${this._cameraIndex}`] = {}
        }
        return this._ls[this.gc.blendedMode ? this._cameraCount : this._cameraIndex]
    }
    set ls( value ) {
        this._ls[this._cameraIndex] = value
    }

    /**
     * Find `what` in `section` of language pack.
     *
     * The code removes punctuation and replaces spaces with underscores
     * in `what`.
     * @param section - the section of `this._i` to look at
     * @param what - what to look for
     * @returns {*}
     * @private
     */
    _tr(section, what) {
        const new_what = what.replace(/[^\w\s]|_/g, "")
                .replace(/\s+/g, " ")
                .replace(/\s/g, "_")
                .toLowerCase()
        return new_what in this._i[section] ? this._i[section][new_what] : what
    }

    _getState(_id, default_value = '') {
        return this._hass !== null && _id in this._hass.states ?
            this._hass.states[_id] : {
                state: default_value,
                attributes: {
                    friendly_name: 'unknown',
                    wired_only: false,
                    image_source: "unknown",
                    charging: false
                }
            };
    }

    _updateStatuses() {

        // CAMERA
        const camera = this._getState(this.cc.id,'unknown');

        // Set the camera name now. We have to wait until now to ensure `_hass`
        // is set and we can get to the camera state.
        if ( this.cc.name === null ) {
            this.cc.name = camera.attributes.friendly_name
        }

        // Camera state has changed. Update the image URL so we update the
        // view. If we've moved from "taking snapshot" to anything else then
        // queue up some image update requests.
        if ( camera.state !== this.cs.state ) {
            this._log( `state-update: ${this.cs.state} --> ${camera.state}` )
            if( camera.state !== 'off' ) {
                this.generateImageURL()
            } else {
                this.cs.image = camera.attributes.last_thumbnail
            }
            if ( this.cs.state === 'taking snapshot' ) {
                this.cc.snapshotTimeouts.forEach( (seconds) => {
                    this.generateImageURLLater( seconds )
                })
            }
            this.gc.lastActive = this._cameraIndex
            this.cs.state = camera.state
            this.cs.details.status = { text: this._tr("state",this.cs.state) }
        }

        // Entity picture has changed. This means there is a new auth key
        // attached. Update the image URL so we update the view.
        if ( this.cs.imageBase !== camera.attributes.entity_picture ) {
            this._log( `auth-update: ${this.cs.imageBase} --> ${camera.attributes.entity_picture}` )
            this.generateImageURL()
        }

        // Image source has changed. This means it was from a new capture or
        // snapshot. Update the image URL so we update the view.
        if ( this.cs.imageSource !== camera.attributes.image_source ) {
            this._log( `source-update: ${this.cs.imageSource} --> ${camera.attributes.image_source}` )
            this.generateImageURL()
            this.gc.lastActive = this._cameraIndex
            this.cs.imageSource = camera.attributes.image_source
        }

        // Update status details.
        if( this.cs.image !== null ) {
            let date = ""
            let full_date = this.cs.imageSource ? this.cs.imageSource : ''
            if( full_date.startsWith('capture/') ) { 
                date      = full_date.substring(8);
                full_date = `${this._i.image.automatic_capture} ${date}`
            } else if( full_date.startsWith('snapshot/') ) { 
                date      = full_date.substring(9);
                full_date = `${this._i.image.snapshot_capture} ${date}`
            }
            this.cs.details.viewer = {title: full_date, alt: full_date, src: this.cs.image}
            this.cs.details.date = {title: full_date, text: date}
        } else {
            this.cs.details.viewer = {title: "", alt: "", src: null}
            this.cs.details.date = {title: "", text: ""}
        }

        // LIBRARY
        // Check for video update. We can go from:
        // - having no recordings to having one or more
        // - having one or more recordings to none
        // - having new recordings
        if( "last_video" in camera.attributes ) {
            if( this.cs.lastRecording !== camera.attributes.last_video ) {
                this._log( `video-changed: updating library` )
                this.asyncLoadLibrary( this._cameraIndex ).then( () => {
                    this.mergeLibraries()
                    this._updateLibraryView()
                })
                this.cs.lastRecording = camera.attributes.last_video
            }
        } else {
            if( this.cs.lastRecording !== null ) {
                this._log( `no-videos: clearing library` )
                this.ls.recordings    = []
                this.cs.lastRecording = null
            }
        }

        // IMAGE 
        // FUNCTIONS
        if (this.cs.state === 'off') {
            this.cs.details.stream = _tsi(this._i.image.feature_disabled, 'off', 'mdi:play')
        } else {
            this.cs.details.stream = _tsi(this._i.image.start_stream, 'on', 'mdi:play')
        }

        if ( this.cs.state === 'off' ) {
            this.cs.details.onoff = _tsi(this._i.image.turn_camera_on, 'state-on', 'mdi:camera')
        } else {
            this.cs.details.onoff = _tsi(this._i.image.turn_camera_off, '', 'mdi:camera-off')
        }

        if(this.cs.state !== 'off') {
            this.cs.details.snapshot = _tsi(this._i.image.take_a_snapshot, '', 'mdi:camera-enhance')
        } else {
            this.cs.details.snapshot = _tsi(this._i.image.feature_disabled, 'off', 'mdi:camera-off')
        }

        // SENSORS
        if ( camera.attributes.wired_only ) {
            this.cs.details.battery = _tsi( this._i.status.plugged_in, 'state-update', 'mdi:power-plug')
        } else {
            const battery = this._getState(this.cc.batteryId, 0);
            const prefix = camera.attributes.charging ? 'battery-charging' : 'battery';
            this.cs.details.battery = _tsi(
                `${this._i.status.battery_strength}: ${battery.state}%`,
                battery.state < 25 ? 'state-warn' : ( battery.state < 15 ? 'state-error' : 'state-update' ),
                `mdi:${prefix}` + (battery.state < 10 ? '-outline' :
                            (battery.state > 90 ? '' : '-' + Math.round(battery.state/10) + '0' ))
            )
        }

        const signal = this._getState(this.cc.signalId, 0);
        this.cs.details.signal = _tsi(
            `${this._i.status.signal_strength}: ${signal.state}`,
            '',
            signal.state === "0" ? 'mdi:wifi-outline' : `mdi:wifi-strength-${signal.state}`
        )

        if ( this.cs.state !== 'off' ) {
            const has_motion = this._getState(this.cc.motionId,'off').state === 'on'
            this.cs.details.motion = _tsi(
                `${this._i.status.motion}: ${has_motion ? this._i.status.detected : this._i.status.clear}`,
                has_motion ? 'on' : '',
                has_motion ? "mdi:run" : "mdi:walk",
            )
        } else {
            this.cs.details.motion = _tsi(this._i.image.feature_disabled, 'off', "mdi:walk")
        }

        if ( this.cs.state !== 'off' ) {
            const has_sound = this._getState(this.cc.soundId,'off').state === 'on'
            this.cs.details.sound = _tsi(
                `${this._i.status.sound}: ${has_sound ? this._i.status.detected : this._i.status.clear}`,
                has_sound ? 'state-on' : '',
                "mdi:ear-hearing"
            )
        } else {
            this.cs.details.sound = _tsi(this._i.image.feature_disabled, 'off', "mdi:ear-hearing-off")
        }

        // We always save this, used by library code to check for updates
        const captured = this._getState(this.cc.capturedTodayId, "0").state;
        const last = this._getState(this.cc.lastCaptureId, "0").state;
        if( this.ls.recordings && this.ls.recordings.length > 0 ) {
            this.cs.details.library = _tsi(
                `${this._i.status.library}: ` +
                        ( captured === "0" ? "" : `${captured} ${this._i.status.captured_something} ${last}, ` ) +
                        this._i.status.library_open,
                captured !== "0" ? 'on' : '',
                this.cc.numericView ? 'mdi:numeric-' + (captured > 9 ? "9-plus" : captured) + '-box' : 'mdi:file-video'
            )
        } else {
            this.cs.details.library = _tsi(
                `${this._i.status.library}: ${this._i.status.library_empty}`,
                'off',
                this.cc.numericView ? 'mdi:numeric-0-box' : 'mdi:file-video-outline'
            )
        }

        // OPTIONAL DOORS
        if(this.cc.doorId) {
            const doorState = this._getState(this.cc.doorId, 'off')
            const is_open   = doorState.state === 'on'
            this.cs.details.door = _tsi(
                `${doorState.attributes.friendly_name}: ${is_open ? this._i.status.door_open : this._i.status.door_closed}`,
                is_open ? 'on' : '',
                is_open ? 'mdi:door-open' : 'mdi:door',
            )
        }
        if(this.cc.door2Id) {
            const doorState = this._getState(this.cc.door2Id, 'off')
            const is_open   = doorState.state === 'on'
            this.cs.details.door2 = _tsi(
                `${doorState.attributes.friendly_name}: ${is_open ? this._i.status.door_open : this._i.status.door_closed}`,
                is_open ? 'on' : '',
                is_open ? 'mdi:door-open' : 'mdi:door',
            )
        }

        if(this.cc.doorLockId) {
            const doorLockState = this._getState(this.cc.doorLockId, 'locked');
            const is_locked     = doorLockState.state === 'locked'
            this.cs.details.lock = _tsi(
                `${doorLockState.attributes.friendly_name}: ${is_locked ? this._i.status.lock_locked : this._i.status.lock_unlocked}`,
                is_locked ? 'state-on' : 'state-warn',
                is_locked ? 'mdi:lock' : 'mdi:lock-open',
            )
        }
        if(this.cc.door2LockId) {
            const door2LockState = this._getState(this.cc.door2LockId, 'locked')
            const is_locked      = door2LockState.state === 'locked'
            this.cs.details.lock2 = _tsi(
                `${door2LockState.attributes.friendly_name}: ${is_locked ? this._i.status.lock_locked : this._i.status.lock_unlocked}`,
                is_locked ? 'state-on' : 'state-warn',
                is_locked ? 'mdi:lock' : 'mdi:lock-open',
            )
        }

        if(this.cc.doorBellId) {
            const bell = this._getState(this.cc.doorBellId, 'off');
            const name = bell.attributes.friendly_name
            const mute = bell.attributes.chimes_silenced || bell.attributes.calls_silenced
            const muteable = !!this.cc.doorBellMuteId
            if ( bell.state === 'on' ) {
                this.cs.details.bell = _tsi(`${name}: ${this._i.status.doorbell_pressed}`, 'on', 'mdi:bell-ring')
            } else if( muteable ) {
                if ( mute ) {
                    this.cs.details.bell = _tsi(`${name}: ${this._i.status.doorbell_muted}`, 'warn', 'mdi:bell-off')
                } else {
                    this.cs.details.bell = _tsi(`${name}: ${this._i.status.doorbell_mute}`, '', 'mdi:bell')
                }
            } else {
                this.cs.details.bell = _tsi(`${name}: ${this._i.status.doorbell_idle}`, '', 'mdi:bell')
            }
        }

        if(this.cc.door2BellId) {
            const bell = this._getState(this.cc.door2BellId, 'off');
            const name = bell.attributes.friendly_name
            const mute = bell.attributes.chimes_silenced || bell.attributes.calls_silenced
            const muteable = !!this.cc.door2BellMuteId
            if ( bell.state === 'on' ) {
                this.cs.details.bell2 = _tsi(`${name}: ${this._i.status.doorbell_pressed}`, 'on', 'mdi:bell-ring')
            } else if( muteable ) {
                if ( mute ) {
                    this.cs.details.bell2 = _tsi(`${name}: ${this._i.status.doorbell_muted}`, 'warn', 'mdi:bell-off')
                } else {
                    this.cs.details.bell2 = _tsi(`${name}: ${this._i.status.doorbell_mute}`, '', 'mdi:bell')
                }
            } else {
                this.cs.details.bell2 = _tsi(`${name}: ${this._i.status.doorbell_idle}`, '', 'mdi:bell')
            }
        }

        if(this.cc.lightId) {
            const lightState = this._getState(this.cc.lightId, 'off');
            const is_on = lightState.state === 'on'
            this.cs.details.light = _tsi(
                `${lightState.attributes.friendly_name}: ` + (is_on ?  this._i.status.light_on : this._i.status.light_off),
                is_on ? 'on' : '',
                'mdi:lightbulb'
            )
        }
        if(this.cc.light2Id) {
            const lightState = this._getState(this.cc.light2Id, 'off');
            const is_on = lightState.state === 'on'
            this.cs.details.light2 = _tsi(
                `${lightState.attributes.friendly_name}: ` + (is_on ?  this._i.status.light_on : this._i.status.light_off),
                is_on ? 'on' : '',
                'mdi:lightbulb'
            )
        }

        if(this.cc.sirenId) {
            const sirenState = this._getState(this.cc.sirenId, 'off');
            const is_on = sirenState.state === 'on';
            const name = sirenState.attributes && sirenState.attributes.friendly_name ? sirenState.attributes.friendly_name : 'Siren';
            this.cs.details.siren = _tsi(
                `${name}: ` + (is_on ? this._i.status.siren_on : this._i.status.siren_off),
                is_on ? 'warn' : '',
                'mdi:bullhorn'
            );
        }
    }

    updateStatuses() {

        this.gc.lastActive = -1
        const index = this._cameraIndex
        for( this._cameraIndex = 0; this._cameraIndex < this._cameraCount; this._cameraIndex++ ) {
            this._updateStatuses()
        }
        this._cameraIndex = index

        if( this.gc.activeView ) {
            if( this.gc.lastActive !== -1 && this.gc.lastActive !== index ) {
                this.setCameraImage( this.gc.lastActive )
            }
        }
    }

    checkConfig() {
        if ( this._hass === null ) {
            return;
        }

        if ( !(this.cc.id in this._hass.states) ) {
            this.throwError( 'unknown camera' );
        }
        if ( this.cc.doorId && !(this.cc.doorId in this._hass.states) ) {
            this.throwError( 'unknown door' )
        }
        if ( this.cc.doorBellId && !(this.cc.doorBellId in this._hass.states) ) {
            this.throwError( 'unknown door bell' )
        }
        if ( this.cc.doorLockId && !(this.cc.doorLockId in this._hass.states) ) {
            this.throwError( 'unknown door lock' )
        }
        if ( this.cc.door2Id && !(this.cc.door2Id in this._hass.states) ) {
            this.throwError( 'unknown door (#2)' )
        }
        if ( this.cc.door2BellId && !(this.cc.door2BellId in this._hass.states) ) {
            this.throwError( 'unknown door bell (#2)' )
        }
        if ( this.cc.door2LockId && !(this.cc.door2LockId in this._hass.states) ) {
            this.throwError( 'unknown door lock (#2)' )
        }
        if ( this.cc.lightId && !(this.cc.lightId in this._hass.states) ) {
            this.throwError( 'unknown light' )
        }
        if ( this.cc.light2Id && !(this.cc.light2Id in this._hass.states) ) {
            this.throwError( 'unknown light (#2)' )
        }
        if ( this.cc.sirenId && !(this.cc.sirenId in this._hass.states) ) {
            this.throwError( 'unknown siren' )
        }
    }

    getGlobalConfig( config ) {

        return {
            // GLOBAL config
            // Mobile? see here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
            isMobile: navigator.userAgent.includes("Mobi"),
            // HA App
            isHAApp: navigator.userAgent.includes("HomeAssistant"),
            // Is IOS
            isApple: navigator.userAgent.includes("iPhone") ||
                     navigator.userAgent.includes("iPad") ||
                     navigator.userAgent.includes("iPod") ||
                     (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1),
            // Is Android
            isAndroid: navigator.userAgent.includes("Android"),

            // Language override?
            lang: config.lang,

            // active camera mode
            activeView: (_includes( config.global, "active" ) ||
                        _includes( config.image_view, "active" )),

            // initial state is muted
            isMuted: _includes( config.global, "muted" ),

            // aspect ratio
            aspectRatio: (_includes(config.global, 'square') ||
                        _includes(config.image_view, 'square')) ? '1x1' : '16x9',
            aspectRatioMultiplier: (_includes(config.global, 'square') ||
                        _includes(config.image_view, 'square')) ? 1 : 0.5625,

            // size
            small: _includes(config.global,'small'),
            tiny: _includes(config.global,'tiny'),

            // blended library
            blendedMode: _includes(config.global, 'blended') ||
                        _includes( config.library_view, "blended" ),

            // modal window multiplier
            modalMultiplier: _value_float( config.modal_multiplier, 0.8 ),

            // lovelace card size
            cardSize: _value_int( config.card_size, 3 ),

            // swipe threshold
            swipeThreshold: _value_int( config.swipe_threshold, 150 ),

            // logging?
            log: _value( config.logging, false ),
        }
    }

    getGlobalState( _config ) {
        return {
            dash: null,
            hls: null,
            pc: null,
            webrtcUnsub: null,
            libraryCamera: -1,
            isMuted: this.gc.isMuted,
            poster: '',
            recording: null,
            stream: null,
            streamPaused: false,
        }
    }

    getCameraConfig( global, local ) {
        const config = _mergeArrays( global, local )

        // Find entity and determine camera name.
        const entity = config.entity
        if ( !entity || !entity.startsWith( 'camera.' ) ) {
            this.throwError( "config requires an aarlo camera entity (e.g. camera.aarlo_kitchen)" )
            return {}
        }
        const camera = entity.startsWith('camera.aarlo_') ? entity.replace( 'camera.aarlo_','' ) : entity.replace('camera.', '')

        let cc = {}

        // Grab name if there
        cc.name = _value( config.name, null )

        // Get the version out.
        if ("version" in config) {
            this.throwError(`version: ${this._version}`)
            return {}
        }

        // Save layout
        cc.image_top = config.image_top
        cc.image_bottom = config.image_bottom

        // How do we display recordings or stream?
        cc.arloPlay          = _includes(config.image_view, "arlo-stream")
        cc.haPlay            = _includes(config.image_view, "ha-stream")
        cc.webrtcPlay        = _includes(config.image_view, "webrtc") || _includes(config.image_view, "sip")
        cc.modalPlayer       = _includes(config.image_view, "modal")
        cc.smartPlayer       = _includes(config.image_view, "smart-modal")
        cc.numericView       = _includes(config.image_view, 'numeric')
        cc.autoPlay          = _includes(config.image_view, 'start-stream')
        cc.autoPlayRecording = _includes(config.image_view, 'start-recording')

        // Does clicking show the live stream or last recording?
        cc.playStream = _includes( config.image_click, "stream")

        // snapshot updates
        cc.snapshotTimeouts = _array( config.snapshot_retry, [ 2, 5 ] )

        cc.camera = camera
        cc.rawConfig = config

        // camera and sensors (auto-resolved dynamically against hass.states)
        cc.id              = _value(config.camera_id,  `camera.aarlo_${camera}`)
        cc.motionId        = _value(config.motion_id,  `binary_sensor.aarlo_${camera}_motion`)
        cc.soundId         = _value(config.sound_id,   `binary_sensor.aarlo_${camera}_sound`)
        cc.batteryId       = _value(config.battery_id, `sensor.aarlo_${camera}_battery_level`)
        cc.signalId        = _value(config.signal_id,  `sensor.aarlo_${camera}_signal_strength`)
        cc.capturedTodayId = _value(config.capture_id, `sensor.aarlo_${camera}_captured_today`)
        cc.lastCaptureId   = _value(config.last_id,    `sensor.aarlo_${camera}_last`)

        // door definition
        cc.doorId         = _value(config.door)
        cc.doorBellId     = _value(config.door_bell)
        cc.doorBellMuteId = _value(config.door_bell_mute)
        cc.doorLockId     = _value(config.door_lock)

        // door2 definition
        cc.door2Id         = _value(config.door2)
        cc.door2BellId     = _value(config.door2_bell)
        cc.door2BellMuteId = _value(config.door2_bell_mute)
        cc.door2LockId     = _value(config.door2_lock)

        // light definitions
        cc.lightId  = _value(config.light)
        cc.light2Id = _value(config.light2)

        // siren definition
        cc.sirenId  = _value(config.siren)

        return cc
    }

    _resolveEntityId(hass, explicitId, domain, camera, suffix) {
        if (explicitId) {
            if (!hass || !hass.states) return explicitId;
            if (explicitId in hass.states) return explicitId;
            // Check if swapped variant exists (legacy <-> modern)
            const modern = `${domain}.aarlo_${camera}_${suffix}`;
            const legacy = `${domain}.aarlo_${suffix}_${camera}`;
            if (explicitId === legacy && modern in hass.states) return modern;
            if (explicitId === modern && legacy in hass.states) return legacy;
            const modernNoPrefix = `${domain}.${camera}_${suffix}`;
            const legacyNoPrefix = `${domain}.${suffix}_${camera}`;
            if (explicitId === legacyNoPrefix && modernNoPrefix in hass.states) return modernNoPrefix;
            if (explicitId === modernNoPrefix && legacyNoPrefix in hass.states) return legacyNoPrefix;
            return explicitId;
        }

        const candidates = [
            `${domain}.aarlo_${camera}_${suffix}`,
            `${domain}.aarlo_${suffix}_${camera}`,
            `${domain}.${camera}_${suffix}`,
            `${domain}.${suffix}_${camera}`,
        ];

        if (hass && hass.states) {
            for (const id of candidates) {
                if (id in hass.states) {
                    return id;
                }
            }
        }
        return candidates[0];
    }

    _resolveCameraEntities(hass) {
        if (!hass || !hass.states || !this._cc) return;
        for (const ci in this._cc) {
            const cc = this._cc[ci];
            if (!cc || !cc.camera) continue;
            const config = cc.rawConfig || {};
            const camera = cc.camera;

            // Camera entity resolution
            if (!config.camera_id) {
                if (`camera.aarlo_${camera}` in hass.states) {
                    cc.id = `camera.aarlo_${camera}`;
                } else if (`camera.${camera}` in hass.states) {
                    cc.id = `camera.${camera}`;
                }
            }

            cc.motionId = this._resolveEntityId(hass, config.motion_id, 'binary_sensor', camera, 'motion');
            cc.soundId = this._resolveEntityId(hass, config.sound_id, 'binary_sensor', camera, 'sound');
            cc.batteryId = this._resolveEntityId(hass, config.battery_id, 'sensor', camera, 'battery_level');
            cc.signalId = this._resolveEntityId(hass, config.signal_id, 'sensor', camera, 'signal_strength');
            cc.capturedTodayId = this._resolveEntityId(hass, config.capture_id, 'sensor', camera, 'captured_today');
            cc.lastCaptureId = this._resolveEntityId(hass, config.last_id, 'sensor', camera, 'last');

            // Doorbell ding resolution
            if (config.door_bell) {
                cc.doorBellId = this._resolveEntityId(hass, config.door_bell, 'binary_sensor', camera, 'ding');
            } else if (!cc.doorBellId) {
                const dingCandidates = [
                    `binary_sensor.aarlo_${camera}_ding`,
                    `binary_sensor.aarlo_ding_${camera}`,
                    `binary_sensor.${camera}_ding`,
                    `binary_sensor.ding_${camera}`,
                ];
                for (const did of dingCandidates) {
                    if (did in hass.states) {
                        cc.doorBellId = did;
                        break;
                    }
                }
            }

            // Spotlight / light resolution
            if (!config.light && !cc.lightId) {
                const lightCandidates = [
                    `light.aarlo_${camera}_spotlight`,
                    `light.aarlo_spotlight_${camera}`,
                    `light.aarlo_${camera}`,
                    `light.${camera}_spotlight`,
                ];
                for (const lid of lightCandidates) {
                    if (lid in hass.states) {
                        cc.lightId = lid;
                        break;
                    }
                }
            }

            // Siren resolution
            if (!config.siren && !cc.sirenId) {
                const sirenCandidates = [
                    `siren.aarlo_${camera}_siren`,
                    `siren.aarlo_siren_${camera}`,
                    `siren.aarlo_${camera}`,
                    `siren.${camera}_siren`,
                    `siren.aarlo_all_sirens`,
                ];
                for (const sid of sirenCandidates) {
                    if (sid in hass.states) {
                        cc.sirenId = sid;
                        break;
                    }
                }
            }
        }
        if (this.gc && this.cc && this.cc.id) {
            this.gc.idSuffix = _replaceAll(this.cc.id, '.', '-');
            this.gc.idSuffix = _replaceAll(this.gc.idSuffix, '_', '-');
        }
    }

    getCameraState( config ) {
        return {
            autoPlay:      config.autoPlay,
            autoPlayTimer: null,
            details:       {},
            lastRecording: null,
            image:         null,
            imageBase:     null,
        }
    }

    getLibraryConfig( global, local ) {

        const config = _mergeArrays( global, local )
        const sizes = _array( config.library_sizes, [ 3 ] )

        return {
            // What to when video clicked
            download:          _includes(config.library_view, "download"),
            duration:          _includes(config.library_view, "duration"),
            modalPlayer:       _includes(config.library_view, "modal"),
            smartPlayer:       _includes(config.library_view, "smart-modal"),
            autoPlayRecording: _includes(config.library_view, 'start-recording'),

            // How many recordings to show
            sizes:      sizes,
            recordings: _value_int( config.max_recordings, 99 ),

            // Highlight motion triggers?
            regions: _array( config.library_regions, sizes ),
            colors:  {
                "Animal":  _value( config.library_animal, 'orangered' ),
                "Vehicle": _value( config.library_vehicle, 'yellow' ),
                "Person":  _value( config.library_person, 'lime' ),
                "Package":  _value( config.library_package, 'cyan' ),
            },
        }
    }

    getLibraryState( _config ) {
        return {
            gridCount:  -1,
            lastOffset: -1,
            offset:     0,
            recordings: null,
            size:       -1,
            sizeIndex:  0,

        }
    }

    setConfig(config) {

        // save then check new config
        // this._config = _mergeArrays(config, {})
        this._config = config

        this.gc = this.getGlobalConfig( config )
        this.gs = this.getGlobalState( config )

        if( "entities" in this._config ) {
            let ci = 0
            this._config.entities.forEach( (local_config) => {
                this._cc[ci] = this.getCameraConfig( config, local_config )
                this._cs[ci] = this.getCameraState( this._cc[ci] )
                this._lc[ci] = this.getLibraryConfig( config, local_config )
                this._ls[ci] = this.getLibraryState( this._lc[ci] )
                ci++
            })

            // For blended we fake a library at the end.
            if( this.gc.blendedMode ) {
                this._lc[ci] = this.getLibraryConfig( config, {} )
                this._ls[ci] = this.getLibraryState( this._lc[ci] )
            }

            // Use the first camera.
            this._cameraCount = ci
            this._cameraIndex = 0

        } else {
            // Single camera. Much simpler.
            this._cc[0] = this.getCameraConfig( config, {} )
            this._cs[0] = this.getCameraState( this._cc[0] )
            this._lc[0] = this.getLibraryConfig( config, {} )
            this._ls[0] = this.getLibraryState( this._lc[0] )

            // Use the first camera.
            this._cameraCount = 1
            this._cameraIndex = 0
        }
 
        if ( this._hass ) {
            this._resolveCameraEntities( this._hass )
        }

        this.checkConfig()

        // web item id suffix
        this.gc.idSuffix = _replaceAll( this.cc.id,'.','-' )
        this.gc.idSuffix = _replaceAll( this.gc.idSuffix,'_','-' )
    }

    getModalDimensions() {
        let width  = window.innerWidth * this.gc.modalMultiplier
        let height = window.innerHeight * this.gc.modalMultiplier
        const ratio = this.gc.aspectRatioMultiplier
        if( height / width > ratio ) {
            height = width * ratio
        } else if( height / width < ratio ) {
            width = height * (1/ratio)
        }
        this.cs.modalWidth = Math.round(width)
        this.cs.modalHeight = Math.round(height)

        let topOffset = window.scrollY
        if( topOffset !== 0 ) {
            this.cs.modalTop = Math.round( topOffset + ( (window.innerHeight - height) / 2 ) )
        } else {
            this.cs.modalTop = null
        }
    }

    setModalElementData() {
        this.getModalDimensions()
        this._paddingTop( "modal-viewer", this.cs.modalTop )
        this._widthHeight("modal-content", this.cs.modalWidth - 16, null, "important")
        this._widthHeight("modal-video-wrapper", this.cs.modalWidth, this.cs.modalHeight - 16)
        this._widthHeight("modal-video-background", this.cs.modalWidth, this.cs.modalHeight)
        this._widthHeight("modal-video-player", this.cs.modalWidth, this.cs.modalHeight)
    }

    showModal( show = true ) {
        if( this.gs.viewer === "modal" ) {
            this.setModalElementData()
            this._element('modal-viewer').style.display =  show ? 'block' : 'none'
        }
    }

    hideModal() {
        this._element('modal-viewer').style.display = 'none'
    }

    buildIcon(item, prefix, listener) {
        let elem = document.createElement("ha-icon")
        elem.classList.add(`aarlo-icon-${this._sizeSuffix()}`)
        elem.addEventListener('click', listener);
        elem.id = this._id(`${prefix}${item}`)
        return elem
    }

    buildText(item, prefix) {
        let elem = document.createElement("span")
        elem.classList.add(`${prefix}-${item}`)
        elem.classList.add(`aarlo-text-${this._sizeSuffix()}`)
        elem.id = this._id(`${prefix}${item}`)
        return elem
    }

    buildGap() {
        let elem = document.createElement("span")
        elem.innerHTML = "&nbsp"
        return elem
    }

    /**
     * Generate a new image URL.
     *
     * This is done when Arlo changes the image or Home Assistance changes
     * the authentication token. We always add the current time to the end to
     * force the browser to reload.
     *
     * It makes no attempt to reload the image.
     */

    // RECORDING VIEW

    /**
     * Setup the callbacks on recording/stream view
     */

 

    updateView() {
        this.updateStatuses()
        this.updateImageView()
        this.updateLibraryView()
        this.updateRecordingView()
        this.updateStreamView()
    }

    /**
     * Get every ready.
     *
     * Run when render() is called. The function will keep calling
     * itself until initialization is complete. What is does:
     *  - load the card's language pack
     *  - load the camera libraries
     *  - wait for the render to be added to the DOM
     *  - set up static view configuration
     *  - open initial view
     *
     * @param lang_loaded true if language is loaded
     * @param lib_loaded true if libraries are loaded
     */
    initialSetup( lang_loaded = false, lib_loaded = false ) {

        // Load language pack
        if( !lang_loaded ) {
            this.asyncLoadLanguage().finally( () => {
                this.initialSetup( true, false )
            })
            return
        }

        // Now load the libraries.
        if( !lib_loaded ) {
            this.asyncLoadLibraries().then( () => {
                this.initialSetup( true, true )
            })
            return
        }

        // Now wait for the elements to be added to the shadow DOM.
        if( this._element("camera-viewer") === null ) {
            this._log( 'waiting for an element ' )
            setTimeout( () => {
                this.initialSetup( true, true )
            }, 100);
            return
        }

        // If we are here:
        //  - language packs are in
        //  - library are loaded
        //  - DOM is ready
        this._ready = "ready"

        // Set initial state
        this.updateStatuses()

        // Install the static stuff.
        this.setupImageView()
        this.setupLibraryView()
        this.setupVideoView()
        this.setupImageHandlers()
        this.setupLibraryHandlers()
        this.setupVideoHandlers()

        // And go...
        this.updateImageView()
        this.updateLibraryView()
        this.showImageView()
    }

    resetView() {
        if ( this.ls.showing ) {
            this.showLibraryView()
        } else {
            this.showImageView()
        }
    }

    async wsLoadLibrary( index ) {
        try {
            const library = await this._hass.callWS({
                type: "aarlo_library",
                entity_id: this._cc[index].id,
                at_most: this._lc[index].recordings,
            });
            return ( library.videos.length > 0 ) ? library.videos : [];
        } catch (err) {
            throw new Error(`wsLoadLibrary failed: ${err}`)
        }
    }

    async wsStartStream() {
        try {
            /**
             * Direct Arlo Cloud Playback
             * Only when explicitly requested via `arlo-stream` in image_view.
             */
            if (this.cc.arloPlay) {
                let ua = this.gc.isAndroid ? "linux" : navigator.userAgent;
                return await this._hass.callWS({
                    type: "aarlo_stream_url",
                    entity_id: this.cc.id,
                    user_agent: ua,
                });
            }

            /**
             * Home Assistant Playback (Default)
             * Standard HLS stream proxied through Home Assistant.
             */
            return await this._hass.callWS({
                type: "camera/stream",
                entity_id: this.cc.id,
            });
        } catch (err) {
            throw new Error(`wsStartStream failed: ${err}`);
        }
    }

    async wsStopStream() {
        try {
            return await this._hass.callWS({
                type: "aarlo_stop_activity",
                entity_id: this.cc.id,
            })
        } catch (err) {
            throw new Error(`wsStopStream failed: ${err}`)
        }
        
    }

    async wsUpdateSnapshot() {
        try {
            return await this._hass.callWS({
                type: "aarlo_request_snapshot",
                entity_id: this.cc.id
            })
        } catch (err) {
            throw new Error(`wsUpdateSnapshot failed: ${err}`)
        }
    }

    updateSnapshot() {
        this.wsUpdateSnapshot()
            .then()
            .catch( (e) => {
                this._log( e )
            })
    }

                                

    async asyncLoadLanguage() {
        this._i = DEFAULT_MESSAGES;
        let lang = this.gc.lang ? this.gc.lang : (this._hass && this._hass.language ? this._hass.language : "en");

        if (lang.toLowerCase().startsWith("en")) {
            return;
        }

        // Try language, then language prefix (e.g. pt-BR -> pt)
        const candidates = [lang.toLowerCase()];
        if (lang.includes("-")) {
            candidates.push(lang.split("-")[0].toLowerCase());
        }

        for (const candidate of candidates) {
            try {
                this._log(`importing ${candidate} language`);
                const module = await import(`https://cdn.jsdelivr.net/gh/twrecked/lovelace-hass-aarlo@master/lang/${candidate}.js`);
                if (module && module.messages) {
                    this._i = {
                        ...DEFAULT_MESSAGES,
                        ...module.messages,
                        image: { ...DEFAULT_MESSAGES.image, ...(module.messages.image || {}) },
                        library: { ...DEFAULT_MESSAGES.library, ...(module.messages.library || {}) },
                        video: { ...DEFAULT_MESSAGES.video, ...(module.messages.video || {}) },
                        status: { ...DEFAULT_MESSAGES.status, ...(module.messages.status || {}) },
                        trigger: { ...DEFAULT_MESSAGES.trigger, ...(module.messages.trigger || {}) },
                        state: { ...DEFAULT_MESSAGES.state, ...(module.messages.state || {}) },
                    };
                    return;
                }
            } catch (err) {
                this._log(`failed to load language pack: ${candidate}`);
            }
        }
    }

    /**
     * Asynchronously load a camera's library.
     *
     * Because this operates in the background we save the camera index
     * and operate on the library state (_ls) directly.
     *
     * @param index camera to index to use
     * @returns {Promise<void>}
     */
    async asyncLoadLibrary( index ) {
        try {
            this._ls[index].recordings = await this.wsLoadLibrary( index )
        } catch(err) {
            this._log(err)
            this._ls[index].recordings = []
        }
    }

    async asyncLoadLibraries( ) {
        for( let i = 0; i < this._cameraCount; i++ ) {
            await this.asyncLoadLibrary(i)
        }
        this.mergeLibraries()
    }

  

}

Object.assign(
    AarloGlance.prototype,
    ImageViewMixin,
    LibraryViewMixin,
    StreamViewMixin
);
