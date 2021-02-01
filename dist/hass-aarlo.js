/**
 * @fileoverview Lovelace class for accessing Arlo camera through the AArlo
 * module.
 *
 * Startup Notes:
 * - hass(); called at startup; set initial internal status and then updates
 *   image element data
 * - setConfig(); called at startup; we read out config data and store inside
 *   `_c` variable.
 * - render(); called at startup; we start initialView() and return the
 *   skeleton HTML for the card.
 * - initialView(); loops until HTML is in place then set up which individual
 *   elements are present (eg, motion sensor if asked for) and then displays
 *   the image card.
 *
 * Running Notes:
 * - hass(); called when state changes; update internal status and then updates
 *   image element data
 *
 * Controlling what's on screen:
 * - setup(Image|library|Video|Stream)View; one off, set visibility that doesn't
 *   change
 * - update(Image|Video|Stream)View; set up text, alt, state and visibility that
 *   do change
 * - show(Image|Video|Stream)View; show layers for this card
 * - hide(Image|Video|Stream)View; don't show layers for this card
 */

const LitElement = Object.getPrototypeOf(
        customElements.get("ha-panel-lovelace")
    );
const html = LitElement.prototype.html;

// noinspection JSUnresolvedVariable,CssUnknownTarget,CssUnresolvedCustomProperty,HtmlRequiredAltAttribute,RequiredAttributes
class AarloGlance extends LitElement {

    constructor() {
        super();

        this._hass = null;
        this._config = null;
        this._change = 0;
        this._image = ''
        this._hls = null;
        this._dash = null;
        this._video = null
        this._videoState = ''
        this._stream = null
        this._modalViewer = false

        this._top = 0
        this._left = 0
        this._height = 0
        this._width = 0

        this.resetConfig()
        this.resetStatuses()
        this._v = {}
    }

    static get styleTemplate() {
        return html`
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
            <style>
                ha-card {
                    position: relative;
                    min-height: 48px;
                    overflow: hidden;
                }
                .box {
                    white-space: var(--paper-font-common-nowrap_-_white-space); overflow: var(--paper-font-common-nowrap_-_overflow); text-overflow: var(--paper-font-common-nowrap_-_text-overflow);
                    position: absolute;
                    left: 0;
                    right: 0;
                    background-color: rgba(0, 0, 0, 0.4);
                    padding: 4px 8px;
                    font-size: 16px;
                    line-height: 36px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                }
                .box-top {
                    top: 0;
                }
                .box-bottom {
                    bottom: 0;
                }
                .box-bottom-small {
                    bottom: 0;
                    line-height: 30px;
                }
                .box-title {
                    font-weight: 500;
                    margin-left: 4px;
                }
                .box-status {
                    font-weight: 500;
                    margin-right: 4px;
                    text-transform: capitalize;
                }
                ha-icon {
                    cursor: pointer;
                    padding: 2px;
                    color: #a9a9a9;
                }
                div.aarlo-aspect-16x9 {
                    padding-top: 55%;
                }
                div.aarlo-aspect-1x1 {
                    padding-top: 100%;
                }
                div.aarlo-base {
                    margin: 0;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                }
                div.aarlo-modal-base {
                    margin: 0 auto;
                    position: relative;
                }
                .aarlo-image {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                }
                .aarlo-video {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    height: auto;
                    transform: translate(-50%, -50%);
                }
                .aarlo-library {
                    width: 100%;
                    cursor: pointer;
                }
                .aarlo-modal-video-wrapper {
                    overflow: hidden;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .aarlo-modal-video {
                    position: absolute;
                    top: -2px;
                    left: 0;
                }
                .aarlo-modal-video-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    background-color: darkgrey;
                }
                .lrow {
                    display: flex;
                    margin: 6px 2px 6px 2px;
                }
                .lcolumn {
                    flex: 32%;
                    padding: 2px;
                }
                .hidden {
                    display: none;
                }
                .aarlo-broken-image {
                    background: grey url("/static/images/image-broken.svg") center/36px
                    no-repeat;
                }
                .slidecontainer {
                    text-align: center;
                    width: 70%;
                }
                .slider {
                    -webkit-appearance: none;
                    background: #d3d3d3;
                    outline: none;
                    opacity: 0.7;
                    width: 100%;
                    height: 10px;
                    -webkit-transition: .2s;
                    transition: opacity .2s;
                }
                .slider:hover {
                    opacity: 1;
                }
                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    background: #4CAF50;
                    width: 10px;
                    height: 10px;
                    cursor: pointer;
                }
                .slider::-moz-range-thumb {
                    background: #4CAF50;
                    width: 10px;
                    height: 10px;
                    cursor: pointer;
                }
            </style>
        `;
    }

    render() {
        this.initialView()
        return html`
            ${AarloGlance.styleTemplate}
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
                               id="${this._id('modal-stream-player')}"
                               @ended="${() => { this.stopStream() }}"
                               @mouseover="${() => { this.mouseOverVideo(); }}"
                               @click="${() => { this.clickVideo(); }}">
                            Your browser does not support the video tag.
                        </video>
                        <video class="aarlo-modal-video"
                               id="${this._id('modal-video-player')}"
                               autoplay playsinline
                               @ended="${() => { this.stopVideo(); }}"
                               @mouseover="${() => { this.mouseOverVideo(); }}"
                               @click="${() => { this.clickVideo(); }}">
                            Your browser does not support the video tag.
                        </video>
                        <div class="box box-bottom"
                               id="${this._id('modal-video-controls')}">
                            <div>
                                <ha-icon id="${this._id('modal-video-door-lock')}"
                                         @click="${() => { this.toggleLock(this._s.doorLockId); }}">
                                </ha-icon>
                                <ha-icon id="${this._id('modal-video-light-on')}"
                                         @click="${() => { this.toggleLight(this._s.lightId); }}">
                                </ha-icon>
                                <ha-icon id="${this._id('modal-video-stop')}"
                                         icon="mdi:stop" title="Click to stop"
                                         @click="${() => { this.controlStopVideoOrStream(); }}">
                                </ha-icon>
                                <ha-icon id="${this._id('modal-video-play')}"
                                         icon="mdi:play" title="Click to play"
                                         @click="${() => { this.controlPlayVideo(); }}">
                                </ha-icon>
                                <ha-icon id="${this._id('modal-video-pause')}"
                                         icon="mdi:pause" title="Click to pause"
                                         @click="${() => { this.controlPauseVideo(); }}">
                                </ha-icon>
                            </div>
                            <div class='slidecontainer'>
                                <input class="slider"
                                       id="${this._id('modal-video-seek')}"
                                       type="range" value="0" min="1" max="100">
                            </div>
                            <div>
                                <ha-icon class="${this._v.videoFull}"
                                         id="${this._id('modal-video-full-screen')}"
                                         icon="mdi:fullscreen" title="Click to go full screen"
                                         @click="${() => { this.controlFullScreen(); }}">
                                </ha-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ha-card>
                <div class="aarlo-base aarlo-aspect-${this._c.aspectRatio}"
                     id="${this._id('aarlo-wrapper')}">
                    <video class="aarlo-video"
                           id="${this._id('stream-player')}"
                           style="display:none"
                           poster="${this._streamPoster}"
                           @ended="${() => { this.stopStream() }}"
                           @mouseover="${() => { this.mouseOverVideo(); }}"
                           @click="${() => { this.clickVideo(); }}">
                        Your browser does not support the video tag.
                    </video>
                    <video class="aarlo-video"
                           id="${this._id('video-player')}"
                           style="display:none"
                           autoplay playsinline
                           @ended="${() => { this.stopVideo(); }}"
                           @mouseover="${() => { this.mouseOverVideo(); }}"
                           @click="${() => { this.clickVideo(); }}">
                        Your browser does not support the video tag.
                    </video>
                    <img class="aarlo-image"
                         id="${this._id('image-viewer')}"
                         style="display:none"
                         @click="${() => { this.clickImage(); }}">
                    <div class="aarlo-image"
                         id="${this._id('library-viewer')}"
                         style="display:none">
                        <div class="lrow">
                            <div class="lcolumn">
                                <img class="aarlo-library"
                                     id="${this._id('library-0')}"
                                     @click="${() => { this.playLibraryVideo(0); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-3')}"
                                     @click="${() => { this.playLibraryVideo(3); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-6')}"
                                     @click="${() => { this.playLibraryVideo(6); }}">
                            </div>
                            <div class="lcolumn">
                                <img class="aarlo-library"
                                     id="${this._id('library-1')}"
                                     @click="${() => { this.playLibraryVideo(1); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-4')}"
                                     @click="${() => { this.playLibraryVideo(4); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-7')}"
                                     @click="${() => { this.playLibraryVideo(7); }}">
                            </div>
                            <div class="lcolumn">
                                <img class="aarlo-library"
                                     id="${this._id('library-2')}"
                                     @click="${() => { this.playLibraryVideo(2); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-5')}"
                                     @click="${() => { this.playLibraryVideo(5); }}">
                                <img class="aarlo-library"
                                     id="${this._id('library-8')}"
                                     @click="${() => { this.playLibraryVideo(8); }}">
                            </div>
                        </div>
                    </div>
                    <div class="aarlo-image aarlo-broken-image" 
                         id="${this._id('broken-image')}"
                         style="height: 100px">
                    </div>
                </div>
                <div class="box box-top"
                     id="${this._id('top-bar')}"
                     style="display:none">
                    <div class="box-title"
                         id="${this._id('top-bar-title')}">
                    </div>
                    <div class="box-status"
                         id="${this._id('top-bar-date')}">
                    </div>
                    <div class="box-status"
                         id="${this._id('top-bar-status')}">
                    </div>
                </div>
                <div class="box box-bottom"
                     id="${this._id('bottom-bar')}"
                     style="display:none">
                    <div class="box-title"
                         id="${this._id('bottom-bar-title')}">
                    </div>
                    <div class=""
                         id="${this._id('bottom-bar-camera')}">
                        <ha-icon id="${this._id('camera-on-off')}"
                                 @click="${() => { this.toggleCamera() }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-motion')}"
                                 @click="${() => { this.moreInfo(this._s.motionId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-sound')}"
                                 @click="${() => { this.moreInfo(this._s.soundId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-captured')}"
                                 @click="${() => { this.openLibrary(0) }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-play')}"
                                 @click="${() => { this.showOrStopStream() }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-snapshot')}"
                                 @click="${() => { this.wsUpdateSnapshot() }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-battery')}"
                                 @click="${() => { this.moreInfo(this._s.batteryId) }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-wifi-signal')}"
                                 @click="${() => { this.moreInfo(this._s.signalId) }}">
                        </ha-icon>
                        <ha-icon id="${this._id('camera-light-left')}"
                                 @click="${() => { this.toggleLight(this._s.lightId) }}">
                        </ha-icon>
                    </div>
                    <div class="box-title"
                         id="${this._id('bottom-bar-date')}">
                    </div>
                    <div class="box-status"
                         id="${this._id('bottom-bar-externals')}">
                        <ha-icon id="${this._id('externals-door')}"
                                 @click="${() => { this.moreInfo(this._s.doorId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-door-bell')}"
                                 @click="${() => { this.moreInfo(this._s.doorBellId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-door-lock')}"
                                 @click="${() => { this.toggleLock(this._s.doorLockId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-door-2')}"
                                 @click="${() => { this.moreInfo(this._s.door2Id); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-door-bell-2')}"
                                 @click="${() => { this.moreInfo(this._s.door2BellId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-door-lock-2')}"
                                 @click="${() => { this.toggleLock(this._s.door2LockId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('externals-light')}"
                                 @click="${() => { this.toggleLight(this._s.lightId); }}">
                         </ha-icon>
                    </div>
                    <div class="box-status"
                         id="${this._id('bottom-bar-status')}">
                    </div>
                </div>
                <div class="box box-bottom-small"
                     id="${this._id('library-controls')}"
                     style="display:none">
                    <div>
                        <ha-icon class="state-on" 
                                 id="${this._id('library-control-previous')}"
                                 icon="mdi:chevron-left" title="previous"
                                 @click="${() => { this.setLibraryBase(this._libraryOffset - 9); }}">
                        </ha-icon>
                    </div>
                    <div>
                        <ha-icon class="state-on" 
                                 icon="mdi:close" title="close library"
                                 @click="${() => { this.closeLibrary(); }}">
                        </ha-icon>
                    </div>
                    <div>
                        <ha-icon class="state-on"
                                 id="${this._id('library-control-next')}"
                                 icon="mdi:chevron-right" title="next"
                                 @click="${() => { this.setLibraryBase(this._libraryOffset + 9); }}">
                        </ha-icon>
                    </div>
                </div>
                <div class="box box-bottom"
                     id="${this._id('video-controls')}"
                     style="display:none">
                    <div>
                        <ha-icon id="${this._id('video-door-lock')}"
                                 @click="${() => { this.toggleLock(this._s.doorLockId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('video-light-on')}"
                                 @click="${() => { this.toggleLight(this._s.lightId); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('video-stop')}"
                                 icon="mdi:stop" title="Click to stop"
                                 @click="${() => { this.controlStopVideoOrStream(); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('video-play')}"
                                 icon="mdi:play" title="Click to play"
                                 @click="${() => { this.controlPlayVideo(); }}">
                        </ha-icon>
                        <ha-icon id="${this._id('video-pause')}"
                                 icon="mdi:pause" title="Click to pause"
                                 @click="${() => { this.controlPauseVideo(); }}">
                        </ha-icon>
                    </div>
                    <div class='slidecontainer'>
                        <input class="slider"
                               id="${this._id('video-seek')}"
                               type="range" value="0" min="1" max="100">
                    </div>
                    <div>
                        <ha-icon class="${this._v.videoFull}"
                                 id="${this._id('video-full-screen')}"
                                 icon="mdi:fullscreen" title="Click to go full screen"
                                 @click="${() => { this.controlFullScreen(); }}">
                        </ha-icon>
                    </div>
                </div>
            </ha-card>`
    }

    static get properties() {
        return {
            // Any time a render is needed we bump this number.
            _change: Number,
        }
    }

    updated(_changedProperties) {
        this.updateImageView();
        if ( this._stream === null ) {
            if( this._c.autoPlay ) {
                setTimeout(() => {
                    this.playStream(false)
                }, 5 * 1000);
            }
        }
    }

    set hass( hass ) {
        const old = this._hass;
        this._hass = hass;
        this.updateStatuses( old )
        this.updateImageView()
        this.updateLibraryView()
        this.updateVideoView()
        this.updateStreamView()
    }

    getCardSize() {
        return 3;
    }

    moreInfo( id ) {
        const event = new Event('hass-more-info', {
            bubbles: true,
            cancelable: false,
            composed: true,
        });
        event.detail = { entityId: id };
        this.shadowRoot.dispatchEvent(event);
        return event;
    }

    throwError( error ) {
        console.error( error );
        throw new Error( error )
    }

    _id( id ) {
        return `${id}-${this._s.idSuffix}`
    }

    _mid( id ) {
        return (this._modalViewer ? "modal-" : "") + this._id(id)
    }

    /**
     * @brief Look for card element in shadown domain.
     *
     * @param id The element or `null`
    */
    _element( id ) {
        return this.shadowRoot.getElementById( this._id(id) )
    }

    /**
     * @brief Look for modal card element in shadown domain.
     *
     * Automatically chooses modal name if modal window open.
     *
     * @param id The element or `null`
    */
    _melement( id ) {
        return this.shadowRoot.getElementById( this._mid(id) )
    }

    __show( element, show ) {
        if ( element ) { element.style.display = show ? '' : 'none' }
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
    _title( id, title ) {
        this.__title( this._element(id), title )
    }
    _mtitle( id, title ) {
        this.__title( this._melement(id), title )
    }

    __text( element, text ) {
        if ( element ) { element.innerText = text }
    }
    _text( id, text ) {
        this.__text( this._element(id), text )
    }
    _mtext( id, text ) {
        this.__text( this._melement(id), text )
    }

    __alt( element, alt ) {
        if ( element ) { element.alt = alt }
    }
    _alt( id, alt ) {
        this.__alt( this._element(id), alt )
    }
    _malt( id, alt ) {
        this.__alt( this._melement(id), alt )
    }

    __src( element, src ) {
        if ( element ) { element.src = src }
    }
    _src( id, src ) {
        this.__src( this._element(id), src )
    }
    _msrc( id, src ) {
        this.__src( this._melement(id), src )
    }

    __poster( element, poster ) {
        if ( element ) { element.poster = poster }
    }
    _poster( id, poster ) {
        this.__poster( this._element(id), poster )
    }
    _mposter( id, poster ) {
        this.__poster( this._melement(id), poster )
    }

    __icon( element, icon ) {
        if ( element ) { element.icon = icon }
    }
    _icon( id, icon ) {
        this.__icon( this._element(id), icon )
    }
    _micon( id, icon ) {
        this.__icon( this._melement(id), icon )
    }

    __state( element, state ) {
        let color = ""
        switch( state ) {
            case "state-on":
                color = "white"
                break
            case "state-warn":
                color = "orange"
                break
            case "state-error":
                color = "red"
                break
            case "state-update":
                color = "#cccccc"
                break
        }
        if ( element ) {
            element.style.color = color
        }
    }
    _state( id, state ) {
        this.__state( this._element(id), state )
    }
    _mstate( id, state ) {
        this.__state( this._melement(id), state )
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

    _paddingTop( id, top ) {
        let element = this._element(id)
        if ( element ) {
            if ( top !== null ) {
                element.style.paddingTop=`${top}px`
            }
        }
    }

    parseURL(url) {
        let parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;
        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    }

    changed() {
        this._change = new Date().getTime();
        return this._change;
    }

    getState(_id, default_value = '') {
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

    resetStatuses() {
        this._s = {

            cameraName: 'unknown',
            cameraState: 'unknown',

            imageSource: 'unknown',

            playOn: 'not-used',
            playText: 'not-used',
            playIcon: 'mdi:camera',

            onOffOn: 'not-used',
            onOffText: 'not-used',
            onOffIcon: 'mdi:camera-off',

            snapshotOn: 'not-used',
            snapshotText: 'not-used',
            snapshotIcon: 'mdi:camera',

            batteryIcon:  'not-used',
            batteryState: 'state-update',
            batteryText:  'not-used',

            signalText: 'not-used',
            signalIcon: 'mdi:wifi-strength-4',

            motionOn: 'not-used',
            motionText: 'not-used',

            soundOn: 'not-used',
            soundText: 'not-used',

            capturedText: 'not-used',
            capturedOn: '',
            capturedIcon: 'mdi:file-video',

            doorOn: 'not-used',
            doorText: 'not-used',
            doorIcon: 'not-used',
            door2On: 'not-used',
            door2Text: 'not-used',
            door2Icon: 'not-used',

            doorLockOn: 'not-used',
            doorLockText: 'not-used',
            doorLockIcon: 'not-used',
            door2LockOn: 'not-used',
            door2LockText: 'not-used',
            door2LockIcon: 'not-used',

            doorBellOn: 'not-used',
            doorBellText: 'not-used',
            doorBellIcon: 'not-used',
            door2BellOn: 'not-used',
            door2BellText: 'not-used',
            door2BellIcon: 'not-used',

            lightOn: 'not-used',
            lightText: 'not-used',
            lightIcon: 'not-used',
        };
    }

    updateStatuses( oldValue ) {

        // nothing?
        if ( this._hass === null ) {
            return;
        }

        // CAMERA
        const camera = this.getState(this._s.cameraId,'unknown');

        // Initial setting? Get camera name.
        if ( oldValue === null ) {
            this._s.cameraName = this._config.name ? this._config.name : camera.attributes.friendly_name;
        }

        // See if camera has changed. Update on the off chance something useful
        // has happened.
        if ( camera.state !== this._s.cameraState ) {
            if ( this._s.cameraState === 'taking snapshot' ) {
                // console.log( 'snapshot ' + this._s.cameraName + ':' + this._s.cameraState + '-->' + camera.state );
                this.updateCameraImageSrc()
                this.updateCameraImageSourceLater(5)
                this.updateCameraImageSourceLater(10)
            } else {
                // console.log( 'updating2 ' + this._s.cameraName + ':' + this._s.cameraState + '-->' + camera.state );
                this.updateCameraImageSrc()
            }
        }

        // Save out current state for later.
        this._s.cameraState = camera.state;

        if ( this._s.imageSource !== camera.attributes.image_source ) {
            // console.log( 'updating3 ' + this._s.cameraName + ':' + this._s.imageSource + '-->' + camera.attributes.image_source );
            this._s.imageSource = camera.attributes.image_source
            this.updateCameraImageSrc()
        }

        // FUNCTIONS
        if( this._v.play === '' ) {
            this._s.playOn = 'state-on';
            if ( camera.state !== 'streaming' ) {
                this._s.playText = 'click to live-stream';
                this._s.playIcon = 'mdi:play'
            } else {
                this._s.playText = 'click to stop stream';
                this._s.playIcon = 'mdi:stop'
            }
        }

        if( this._v.onOff === '' ) {
            if ( this._s.cameraState === 'off' ) {
                this._s.onOffOn   = 'state-on';
                this._s.onOffText = 'click to turn camera on';
                this._s.onOffIcon = 'mdi:camera'
                this._v.cameraOff = ''
                this._v.cameraOn  = 'hidden'
            } else {
                this._s.onOffOn   = '';
                this._s.onOffText = 'click to turn camera off';
                this._s.onOffIcon = 'mdi:camera-off'
                this._v.cameraOff = 'hidden'
                this._v.cameraOn  = ''
            }
        } else {
            this._v.cameraOn  = ''
            this._v.cameraOff = 'hidden'
        }

        if( this._v.snapshot === '' ) {
            this._s.snapshotOn   = '';
            this._s.snapshotText = 'click to update image';
            this._s.snapshotIcon = 'mdi:camera'
        }

        // SENSORS
        if( this._v.battery === '' ) {
            if ( camera.attributes.wired_only ) {
                this._s.batteryText  = 'Plugged In';
                this._s.batteryIcon  = 'power-plug';
                this._s.batteryState = 'state-update';
            } else {
                const battery = this.getState(this._s.batteryId, 0);
                const batteryPrefix = camera.attributes.charging ? 'battery-charging' : 'battery';
                this._s.batteryText  = 'Battery Strength: ' + battery.state +'%';
                this._s.batteryIcon  = batteryPrefix + ( battery.state < 10 ? '-outline' :
                                                    ( battery.state > 90 ? '' : '-' + Math.round(battery.state/10) + '0' ) );
                this._s.batteryState = battery.state < 25 ? 'state-warn' : ( battery.state < 15 ? 'state-error' : 'state-update' );
            }
        }

        if( this._v.signal === '' ) {
            const signal = this.getState(this._s.signalId, 0);
            this._s.signalText = 'Signal Strength: ' + signal.state;
            this._s.signalIcon = signal.state === "0" ? 'mdi:wifi-outline' : 'mdi:wifi-strength-' + signal.state;
        }

        if( this._v.motion === '' ) {
            this._s.motionOn   = this.getState(this._s.motionId,'off').state === 'on' ? 'state-on' : '';
            this._s.motionText = 'Motion: ' + (this._s.motionOn !== '' ? 'detected' : 'clear');
        }

        if( this._v.sound === '' ) {
            this._s.soundOn   = this.getState(this._s.soundId,'off').state === 'on' ? 'state-on' : '';
            this._s.soundText = 'Sound: ' + (this._s.soundOn !== '' ? 'detected' : 'clear');
        }

        // We always save this, used by library code to check for updates
        const captured = this.getState(this._s.captureId, 0).state;
        const last = this.getState(this._s.lastId, 0).state;
        this._s.capturedText = 'Captured: ' + ( captured === "0" ? 'nothing today' : captured + ' clips today, last at ' + last );
        this._s.capturedIcon = this._video ? 'mdi:stop' : 'mdi:file-video';
        this._s.capturedOn   = captured !== "0" ? 'state-update' : ''

        // OPTIONAL DOORS
        if( this._v.door === '' ) {
            const doorState = this.getState(this._s.doorId, 'off');
            this._s.doorOn   = doorState.state === 'on' ? 'state-on' : '';
            this._s.doorText = doorState.attributes.friendly_name + ': ' + (this._s.doorOn === '' ? 'closed' : 'open');
            this._s.doorIcon = this._s.doorOn === '' ? 'mdi:door' : 'mdi:door-open';
        }
        if( this._v.door2 === '' ) {
            const door2State = this.getState(this._s.door2Id, 'off');
            this._s.door2On   = door2State.state === 'on' ? 'state-on' : '';
            this._s.door2Text = door2State.attributes.friendly_name + ': ' + (this._s.door2On === '' ? 'closed' : 'open');
            this._s.door2Icon = this._s.door2On === '' ? 'mdi:door' : 'mdi:door-open';
        }

        if( this._v.doorLock === '' ) {
            const doorLockState = this.getState(this._s.doorLockId, 'locked');
            this._s.doorLockOn   = doorLockState.state === 'locked' ? 'state-on' : 'state-warn';
            this._s.doorLockText = doorLockState.attributes.friendly_name + ': ' + (this._s.doorLockOn === 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._s.doorLockIcon = this._s.doorLockOn === 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
        }
        if( this._v.door2Lock === '' ) {
            const door2LockState = this.getState(this._s.door2LockId, 'locked');
            this._s.door2LockOn   = door2LockState.state === 'locked' ? 'state-on' : 'state-warn';
            this._s.door2LockText = door2LockState.attributes.friendly_name + ': ' + (this._s.door2LockOn === 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._s.door2LockIcon = this._s.door2LockOn === 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
        }

        if( this._v.doorBell === '' ) {
            const doorBellState = this.getState(this._s.doorBellId, 'off');
            this._s.doorBellOn   = doorBellState.state === 'on' ? 'state-on' : '';
            this._s.doorBellText = doorBellState.attributes.friendly_name + ': ' + (this._s.doorBellOn === 'state-on' ? 'ding ding!' : 'idle');
            this._s.doorBellIcon = 'mdi:doorbell-video';
        }
        if( this._v.door2Bell === '' ) {
            const door2BellState = this.getState(this._s.door2BellId, 'off');
            this._s.door2BellOn   = door2BellState.state === 'on' ? 'state-on' : '';
            this._s.door2BellText = door2BellState.attributes.friendly_name + ': ' + (this._s.door2BellOn === 'state-on' ? 'ding ding!' : 'idle');
            this._s.door2BellIcon = 'mdi:doorbell-video';
        }

        if( this._v.light === '' ) {
            const lightState = this.getState(this._s.lightId, 'off');
            this._s.lightOn   = lightState.state === 'on' ? 'state-on' : '';
            this._s.lightText = lightState.attributes.friendly_name + ': ' + (this._s.lightOn === 'state-on' ? 'on!' : 'off');
            this._s.lightIcon = 'mdi:lightbulb';
            this._v.lightLeft = this._s.lightLeft ? '' : 'hidden';
            this._v.lightRight = this._s.lightLeft ? 'hidden' : '';
        }
    }

    resetConfig() {
        this._c = {
            aspectRatio: '16x9',

            imageClick: '',
            libraryClick: '',
            
            modalMultiplier: 0.8,
            
            playDirect: false,
            
            autoPlayMaster: false,
            autoPlay: false
        }
    }
    
    checkConfig() {

        if ( this._hass === null ) {
            return;
        }

        if ( !(this._s.cameraId in this._hass.states) ) {
            this.throwError( 'unknown camera' );
        }
        if ( this._s.doorId && !(this._s.doorId in this._hass.states) ) {
            this.throwError( 'unknown door' )
        }
        if ( this._s.doorBellId && !(this._s.doorBellId in this._hass.states) ) {
            this.throwError( 'unknown door bell' )
        }
        if ( this._s.doorLockId && !(this._s.doorLockId in this._hass.states) ) {
            this.throwError( 'unknown door lock' )
        }
        if ( this._s.door2Id && !(this._s.door2Id in this._hass.states) ) {
            this.throwError( 'unknown door (#2)' )
        }
        if ( this._s.door2BellId && !(this._s.door2BellId in this._hass.states) ) {
            this.throwError( 'unknown door bell (#2)' )
        }
        if ( this._s.door2LockId && !(this._s.door2LockId in this._hass.states) ) {
            this.throwError( 'unknown door lock (#2)' )
        }
    }

    setConfig(config) {

        // find camera
        let camera = ""
        if( config.entity ) {
            camera = config.entity.replace( 'camera.','' );
        }
        if( config.camera ) {
            camera = config.camera
        }
        if( camera === "" ) {
            this.throwError( 'missing a camera definition' )
            return
        }
        if( !config.show ) {
            this.throwError( 'missing show components' );
            return
        }

        // see if aarlo prefix, remove from custom names if not present
        let prefix = "";
        if ( camera.startsWith( 'aarlo_' ) ) {
            camera = camera.replace( 'aarlo_','' )
            prefix = "aarlo_"
        }
        if( config.prefix ) {
            prefix = config.prefix;
        }

        // save new config and reset decoration properties
        this._config = config
        this.checkConfig()
        this.resetConfig()
        this.resetStatuses()

        // config
        // aspect ratio
        this._c.aspectRatio = config.aspect_ratio === 'square' ? '1x1' : '16x9';
 
        // on click
        this._c.imageClick = config.image_click ? config.image_click : '';
        this._c.libraryClick = config.library_click ? config.library_click : '';

        // modal window multiplier
        this._c.modalMultiplier = config.modal_multiplier ? parseFloat(config.modal_multiplier) : 0.8;

        // stream directly from Arlo
        this._c.playDirect = config.play_direct ? config.play_direct : false;

        // auto play
        this._c.autoPlayMaster = config.auto_play ? config.auto_play : false
        this._c.autoPlay = this._c.autoPlayMaster
        
        // camera and sensors
        this._s.cameraId  = config.camera_id ? config.camera_id : 'camera.' + prefix + camera;
        this._s.motionId  = config.motion_id ? config.motion_id : 'binary_sensor.' + prefix + 'motion_' + camera;
        this._s.soundId   = config.sound_id ? config.sound_id : 'binary_sensor.' + prefix + 'sound_' + camera;
        this._s.batteryId = config.battery_id ? config.battery_id : 'sensor.' + prefix + 'battery_level_' + camera;
        this._s.signalId  = config.signal_id ? config.signal_id : 'sensor.' + prefix + 'signal_strength_' + camera;
        this._s.captureId = config.capture_id ? config.capture_id : 'sensor.' + prefix + 'captured_today_' + camera;
        this._s.lastId    = config.last_id ? config.last_id : 'sensor.' + prefix + 'last_' + camera;

        // door definition
        this._s.doorId     = config.door ? config.door: null;
        this._s.doorBellId = config.door_bell ? config.door_bell : null;
        this._s.doorLockId = config.door_lock ? config.door_lock : null;

        // door2 definition
        this._s.door2Id     = config.door2 ? config.door2: null;
        this._s.door2BellId = config.door2_bell ? config.door2_bell : null;
        this._s.door2LockId = config.door2_lock ? config.door2_lock : null;

        // light definition
        this._s.lightId     = config.light ? config.light: null;
        this._s.lightLeft     = config.light_left ? config.light_left : false;

        // what are we hiding?
        const hide = this._config.hide || [];
        const hide_title  = hide.includes('title') ? 'hidden':'';
        const hide_date   = hide.includes('date') ? 'hidden':'';
        const hide_status = hide.includes('status') ? 'hidden':'';

        // ui configuration
        this._v.topTitle     = config.top_title ? hide_title : 'hidden';
        this._v.topDate      = config.top_date ? hide_date : 'hidden';
        this._v.topStatus    = config.top_status ? hide_status : 'hidden';
        this._v.bottomTitle  = config.top_title ? 'hidden' : hide_title;
        this._v.bottomDate   = config.top_date ? 'hidden' : hide_date;
        this._v.bottomStatus = config.top_status ? 'hidden' : hide_status;

        // what are we showing?
        const show = this._config.show || [];
        
        this._v.play      = show.includes('play') ? '':'hidden';
        this._v.snapshot  = show.includes('snapshot') ? '':'hidden';
        this._v.onOff     = show.includes('on_off') ? '':'hidden';

        this._v.battery    = show.includes('battery') || show.includes('battery_level') ? '':'hidden';
        this._v.signal     = show.includes('signal_strength') ? '':'hidden';
        this._v.motion     = show.includes('motion') ? '':'hidden';
        this._v.sound      = show.includes('sound') ? '':'hidden';
        this._v.captured   = show.includes('captured') || show.includes('captured_today') ? '':'hidden';
        this._v.imageDate  = show.includes('image_date') ? '':'hidden';

        this._v.door      = this._s.doorId ? '':'hidden';
        this._v.doorLock  = this._s.doorLockId ? '':'hidden';
        this._v.doorBell  = this._s.doorBellId ? '':'hidden';
        this._v.door2     = this._s.door2Id ? '':'hidden';
        this._v.door2Lock = this._s.door2LockId ? '':'hidden';
        this._v.door2Bell = this._s.door2BellId ? '':'hidden';

        this._v.light = this._s.lightId ? '':'hidden';

        this._v.externalsStatus = ( this._v.door === '' || this._v.doorLock === '' ||
                                    this._v.doorBell === '' || this._v.door2 === '' ||
                                    this._v.door2Lock === '' || this._v.door2Bell === '' ||
                                    this._v.light === '') ? '':'hidden';

        // web item id suffix
        this._s.idSuffix = this._s.cameraId.replaceAll('.','-').replaceAll('_','-')
    }

    getModalDimensions() {
        // calculate dimensions?
        let width  = window.innerWidth * this._c.modalMultiplier
        let height = window.innerHeight * this._c.modalMultiplier
        if ( this._c.aspectRatio === '1x1' ) {
            height = Math.min(width,height)
            // noinspection JSSuspiciousNameCombination
            width  = height
        } else {
            let width_height = (width / 16) * 9; // height that will fit in width
            let height_width = (height / 9) * 16; // width that will fit in height
            if ( width_height < height ) {
                height = width_height;
                width = (height / 9) * 16;
            } else {
                width = height_width;
                height = (width / 16) * 9;
            }
        }
        this._width = Math.round(width)
        this._height = Math.round(height)
        let topOffset = window.pageYOffset
        if( topOffset !== 0 ) {
            this._top = Math.round( topOffset + ( (window.innerHeight - height) / 2 ) )
        } else {
            this._top = null
        }
    }

    repositionModal() {
        this.getModalDimensions()
        this._paddingTop( "modal-viewer", this._top )
    }

    setModalElementData() {
        this.getModalDimensions()
        this._paddingTop( "modal-viewer", this._top )
        this._widthHeight("modal-content", this._width - 4, null, "important")
        this._widthHeight("modal-video-wrapper", this._width - 4, this._height - 4)
        this._widthHeight("modal-video-background", this._width, this._height)
        this._widthHeight("modal-video-player", this._width, this._height)
        this._widthHeight("modal-stream-player", this._width, this._height)
 
        // window.onscroll = () => {
            // this.positionModal()
        // }
        // window.ontouchend = () => {
            // this.showVideoControls(2)
        // }
    }

    showModal( show = true ) {
        const modal = this.shadowRoot.getElementById( this._id('modal-viewer') )
        modal.style.display =  show ? 'block' : 'none'
    }

    hideModal() {
        const modal = this.shadowRoot.getElementById( this._id('modal-viewer') )
        modal.style.display = 'none'
    }


    setupImageView() {
        this._show('top-bar-title', this._v.topTitle === '' )
        this._show('top-bar-date', this._v.topDate === '' && this._v.imageDate === '')
        this._show('top-bar-status', this._v.topStatus === '' )
        this._show('bottom-bar-title', this._v.bottomTitle === '' )
        this._show('bottom-bar-camera', this._v.cameraOn === '' || this._v.cameraOff === '' )
        this._show('bottom-bar-date', this._v.bottomDate === '' && this._v.imageDate === '')
        this._show('bottom-bar-externals', this._v.externalsStatus === '' )
        this._show('bottom-bar-status', this._v.bottomStatus === '' )

        this._show('camera-on-off', this._v.onOff === '' )
        this._show('camera-captured', this._v.captured === '' )

        this._show("externals-door", this._v.door === '' )
        this._show("externals-door-bell", this._v.doorLock === '' )
        this._show("externals-door-lock", this._v.doorBell === '' )
        this._show("externals-door-2", this._v.door2 === '' )
        this._show("externals-door-bell-2", this._v.door2Lock === '' )
        this._show("externals-door-lock-2", this._v.door2Bell === '' )
        this._show("externals-light", this._v.light === '' )
    }

    updateImageView() {

        if( this._image !== '' ) {
            const camera = this.getState(this._s.cameraId,'unknown');
            this._s.imageFullDate = camera.attributes.image_source ? camera.attributes.image_source : '';
            this._s.imageDate = '';
            if( this._s.imageFullDate.startsWith('capture/') ) { 
                this._s.imageDate = this._s.imageFullDate.substr(8);
                this._s.imageFullDate = 'automatically captured at ' + this._s.imageDate;
            } else if( this._s.imageFullDate.startsWith('snapshot/') ) { 
                this._s.imageDate = this._s.imageFullDate.substr(9);
                this._s.imageFullDate = 'snapshot captured at ' + this._s.imageDate;
            }
        } else {
            this._s.imageFullDate = ''
            this._s.imageDate = ''
        }

        this._title("image-viewer",this._s.imageFullDate)
        this._alt  ("image-viewer",this._s.imageFullDate)
        this._src  ("image-viewer",this._image)

        this._text ("top-bar-title",this._s.cameraName)
        this._title("top-bar-date",this._s.imageFullDate)
        this._text ("top-bar-date",this._s.imageDate)
        this._text ("top-bar-status",this._s.cameraState)
        this._text ("bottom-bar-title",this._s.cameraName)
        this._title("bottom-bar-date",this._s.imageFullDate)
        this._text ("bottom-bar-date",this._s.imageDate)
        this._text ("bottom-bar-status",this._s.cameraState)

        this._title("camera-on-off", this._s.onOffText)
        this._icon ("camera-on-off", this._s.onOffIcon)
        this._state("camera-on-off", this._s.onOffOn)
        this._title("camera-motion", this._s.motionText)
        this._icon ("camera-motion", "mdi:run-fast")
        this._state("camera-motion", this._s.motionOn)
        this._show ('camera-motion', this._v.motion === '' && this._v.cameraOn === '')
        this._title("camera-sound", this._s.soundText)
        this._icon ("camera-sound", "mdi:ear-hearing")
        this._state("camera-sound", this._s.soundOn)
        this._show ('camera-sound', this._v.sound === '' && this._v.cameraOn === '')
        this._title("camera-captured", this._s.capturedText)
        this._icon ("camera-captured", this._s.capturedIcon)
        this._state("camera-captured", this._s.capturedOn)
        this._title("camera-play", this._s.playText)
        this._icon ("camera-play", this._s.playIcon)
        this._state("camera-play", this._s.playOn)
        this._show ('camera-play', this._v.play === '' && this._v.cameraOn === '')
        this._title("camera-snapshot", this._s.snapshotText)
        this._icon ("camera-snapshot", this._s.snapshotIcon)
        this._state("camera-snapshot", this._s.snapshotOn)
        this._show ('camera-snapshot', this._v.snapshot === '' && this._v.cameraOn === '')
        this._title("camera-battery", this._s.batteryText)
        this._icon ("camera-battery", `mdi:${this._s.batteryIcon}`)
        this._state("camera-battery", this._s.batteryOn)
        this._show ('camera-battery', this._v.battery === '' && this._v.cameraOn === '')
        this._title("camera-wifi-signal", this._s.signalText)
        this._icon ("camera-wifi-signal", this._s.signalIcon)
        this._state("camera-wifi-signal", 'state-update')
        this._show ('camera-wifi-signal', this._v.signal === '' && this._v.cameraOn === '')
        this._title("camera-light-left", this._s.lightText)
        this._icon ("camera-light-left", this._s.lightIcon)
        this._state("camera-light-left", this._s.lightOn)

        this._title("externals-door", this._s.doorText)
        this._state("externals-door", this._s.doorOn)
        this._icon ("externals-door", this._s.doorIcon)
        this._title("externals-door-bell", this._s.doorBellText)
        this._state("externals-door-bell", this._s.doorBellOn)
        this._icon ("externals-door-bell", this._s.doorBellIcon)
        this._title("externals-door-lock", this._s.doorLockText)
        this._state("externals-door-lock", this._s.doorLockOn)
        this._icon ("externals-door-lock", this._s.doorLockIcon)
        this._title("externals-door-2", this._s.door2Text)
        this._state("externals-door-2", this._s.door2On)
        this._icon ("externals-door-2", this._s.door2Icon)
        this._title("externals-door-bell-2", this._s.door2BellText)
        this._state("externals-door-bell-2", this._s.door2BellOn)
        this._icon ("externals-door-bell-2", this._s.door2BellIcon)
        this._title("externals-door-lock-2", this._s.door2LockText)
        this._state("externals-door-lock-2", this._s.door2LockOn)
        this._icon ("externals-door-lock-2", this._s.door2LockIcon)
        this._title("externals-light", this._s.lightText)
        this._state("externals-light", this._s.lightOn)
        this._icon ("externals-light", this._s.lightIcon)
    }

    showImageView() {
        if( this._image !== '' ) {
            this._show("image-viewer")
            this._hide("broken-image")
        } else {
            this._show("broken-image")
            this._hide("image-viewer")
        }
        this._show('top-bar', this._v.topTitle === '' || this._v.topDate === '' || this._v.topStatus === '')
        this._show('bottom-bar')
        this._hide("stream-player")
        this._hide("video-player")
        this._hide("video-controls")
        this._hide("modal-video-controls")
        this._hide("library-viewer")
        this._hide("library-controls")
        this.hideModal()
    }

    hideImageView() {
        this._hide("image-viewer")
        this._hide("broken-image")
        this._hide('top-bar')
        this._hide('bottom-bar')
    }

    setupLibraryView() {
    }

    _updateLibraryView() {
        let i = 0;
        let j= this._libraryOffset;
        const last = Math.min(j + 9, this._library.length)
        for( ; j < last; i++, j++ ) {
            let id = `library-${i}`
            let captured_text = 'captured: ' + this._library[j].created_at_pretty;
            if ( this._library[j].trigger && this._library[j].trigger !== '' ) {
                captured_text += ' (' + this._library[j].trigger.toLowerCase() + ')'
            }
            this._title(id, captured_text)
            this._alt  (id, captured_text)
            this._src  (id, this._library[j].thumbnail)
            this._show (id)
        }
        for( ; i < 9; i++ ) {
            this._hide(`library-${i}`)
        }

        this._libraryLastOffset = this._libraryOffset
        this._libraryLastCapture = this._s.capturedText

        this._show("library-control-previous", this._libraryOffset !== 0)
        this._show("library-control-next", this._libraryOffset + 9 < this._library.length )
    }

    updateLibraryView() {

        // No library, do nothing
        if ( !this._library ) {
            return
        }

        // If capture changed reload library
        if ( this._libraryLastCapture !== this._s.capturedText ) {
            this.asyncLoadLibrary().then( () => {
                this._updateLibraryView()
            })

        // If offset has changed then reload images
        } else if ( this._libraryLastOffset !== this._libraryOffset ) {
            this._updateLibraryView()
        }
    }

    showLibraryView() {
        this._show("library-viewer")
        this._show("library-controls")
        this._hide('top-bar')
        this._hide('bottom-bar')
        this._hide("image-viewer")
        this._hide("stream-player")
        this._hide("video-player")
        this._hide("video-controls")
        this._hide("modal-video-controls")
        this._hide("broken-image")
        this.hideModal()
    }

    hideLibraryView() {
        this._hide("library-viewer")
        this._hide("library-controls")
    }

    setupVideoView() {
        this._show("video-stop")
        this._show("video-full-screen")
        this._show("modal-video-stop")
        this._show("modal-video-full-screen")

        this._show("video-door-lock", this._v.doorLock === '')
        this._show("video-door-lock", this._v.light === '')
        this._show("modal-video-door-lock", this._v.doorLock === '')
        this._show("modal-video-door-lock", this._v.light === '')
    }

    updateVideoView( state = '' ) {
        if( state === 'starting' ) {
            this._msrc   ('video-player', this._video )
            this._mposter('video-player', this._videoPoster )
            this._videoState = 'playing'
            this._mshow("video-seek")
            this.setUpSeekBar();
            this.showVideoControls(4);
        } else if( state !== '' ) {
            this._videoState = state
        }

        this._mstate ("video-door-lock", this._s.doorLockOn)
        this._mtext  ("video-door-lock", this._s.doorLockText)
        this._micon  ("video-door-lock", this._s.doorLockIcon)
        this._mtitle ("video-door-light", this._s.lightText)
        this._mstate ("video-door-light", this._s.lightOn)
        this._micon  ("video-door-light", this._s.lightIcon)

        this._mshow("video-play", this._videoState === 'paused')
        this._mshow("video-pause", this._videoState === 'playing')
    }

    showVideoView() {
        this._mshow("video-player")
        this._mshow("video-controls")
        if( this._modalViewer ) {
            this.setModalElementData()
            this.showModal()
        }
        this._hide('top-bar')
        this._hide('bottom-bar')
        this._hide("image-viewer")
        this._hide("stream-player")
        this._hide("modal-video-controls")
        this._hide("library-viewer")
        this._hide("library-controls")
        this._hide("broken-image")
    }

    hideVideoView() {
        this._mhide("video-player")
        this._mhide("video-controls")
        if( this._modalViewer ) {
            this.hideModal()
        }
    }

    showVideo() {
        this.updateVideoView('starting')
        this.showVideoView()
    }
 
    setMPEGStreamElementData() {
        const video = this.shadowRoot.getElementById( this._mid('stream-player') )
        const parser = this.parseURL(this._stream);
        const et = parser.searchObject["egressToken"];

        this._dash = dashjs.MediaPlayer().create();
        this._dash.extend("RequestModifier", function () {
            return {
                modifyRequestHeader: function (xhr) {
                    xhr.setRequestHeader('Egress-Token',et);
                    return xhr;
                }
            };
        }, true);
        this._dash.initialize(video, this._stream, true);
        // this._dash.updateSettings({
            // 'debug': {
                // 'logLevel': dashjs.Debug.LOG_LEVEL_DEBUG
            // }
        // });
    }

    setHLSStreamElementData() {
        const video = this.shadowRoot.getElementById( this._mid('stream-player') )
        if (Hls.isSupported()) {
            this._hls = new Hls();
            this._hls.attachMedia(video);
            this._hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                this._hls.loadSource(this._stream);
                this._hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play();
                });
            })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = this._stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }
    }

    // Mostly handled in setupVideoView
    setupStreamView() {
    }

    updateStreamView( state = '' ) {
        if ( state === 'starting' ) {
            if ( this._c.playDirect ) {
                this.setMPEGStreamElementData()
            } else {
                this.setHLSStreamElementData()
            }
            this._mhide("video-play")
            this._mhide("video-pause")
            this._mhide("video-seek")
            this.showVideoControls(4);
        }
    }

    showStreamView() {
        this._mshow("stream-player")
        this._mshow("video-controls")
        if( this._modalViewer ) {
            this.setModalElementData()
            this.showModal()
        }
        this._hide("video-player")
        this._hide('top-bar')
        this._hide('bottom-bar')
        this._hide("image-viewer")
        this._hide("library-viewer")
        this._hide("library-controls")
        this._hide("broken-image")
    }

    hideStreamView() {
        this._mhide("stream-player")
        this._mhide("video-controls")
        if( this._modalViewer ) {
            this.hideModal()
        }
    }

    showStream() {
        this.updateStreamView('starting')
        this.showStreamView()
    }

    initialView() {

        // Keep trying until it appears
        if( !this.shadowRoot.getElementById( this._id('image-viewer') ) ) {
            setTimeout( () => {
                this.initialView()
            }, 100);
            return
        }

        this.setupImageView()
        this.setupLibraryView()
        this.setupVideoView()
        this.setupStreamView()

        this.updateImageView()
        this.showImageView()
    }

    resetView() {
        if ( this._library ) {
            this.showLibraryView()
        } else {
            this.showImageView()
        }
    }

    async wsLoadLibrary(at_most ) {
        try {
            const library = await this._hass.callWS({
                type: "aarlo_library",
                entity_id: this._s.cameraId,
                at_most: at_most,
            });
            return ( library.videos.length > 0 ) ? library.videos : null;
        } catch (err) {
            return null
        }
    }

    async wsStartStream() {
        try {
            return await this._hass.callWS({
                type: this._c.playDirect ? "aarlo_stream_url" : "camera/stream",
                entity_id: this._s.cameraId,
            })
        } catch (err) {
            return null
        }
    }

    async wsStopStream() {
        try {
            return await this._hass.callWS({
                type: "aarlo_stop_activity",
                entity_id: this._s.cameraId,
            })
        } catch (err) {
            return null
        }
    }

    async asyncWSUpdateSnapshot() {
        try {
            return await this._hass.callWS({
                type: "aarlo_request_snapshot",
                entity_id: this._s.cameraId
            })
        } catch (err) {
            return null
        }
    }

    wsUpdateSnapshot() {
        this.asyncWSUpdateSnapshot().then()
    }

    updateCameraImageSrc() {
        const camera = this.getState(this._s.cameraId,'unknown');
        if ( camera.state !== 'unknown' ) {
            // this._image = camera.attributes.entity_picture + "&t=" + new Date().getTime()
            this._image = camera.attributes.last_thumbnail+ "&t=" + new Date().getTime()
        } else {
            this._image = '';
        }
        this.updateImageView()
    }

    async asyncLoadLatestVideo(modal) {
        const video = await this.wsLoadLibrary(1);
        if ( video ) {
            this._modalViewer = modal
            this._video       = video[0].url;
            this._videoPoster = video[0].thumbnail;
        } else {
            this._modalViewer = false;
            this._video       = null;
            this._videoPoster = null;
        }
    }

    playLatestVideo(modal) {
        const camera = this.getState(this._s.cameraId,'unknown');
        this._modalViewer = modal
        this._video       = camera.attributes.last_video
        this._videoPoster = camera.attributes.last_thumbnail
        this.showVideo()
        // if ( this._video === null ) {
            // this.asyncLoadLatestVideo(modal).then( () => {
                // this.showVideo()
            // })
        // }
    }

    stopVideo() {
        if ( this._video ) {
            const video = this.shadowRoot.getElementById( this._mid('video-player' ) )
            video.pause()
            this.hideModal()
            this.resetView()
            this._video = null
            this._videoState = ''
        }
    }

    async asyncPlayStream( modal ) {
        const stream = await this.wsStartStream();
        if (stream) {
            this._modalViewer  = modal;
            this._stream       = stream.url;
            this._streamPoster = this._image;
        } else {
            this._modalViewer  = false;
            this._stream       = null;
            this._streamPoster = null;
        }
    }

    playStream( modal ) {
        if ( this._stream === null ) {
            if( this._c.autoPlayMaster ) {
                this._c.autoPlay = this._c.autoPlayMaster
            }
            this.asyncPlayStream(modal).then( () => {
                this.showStream()
            })
        }
    }

    async asyncStopStream() {
        if( this._stream ) {
            const stream = this.shadowRoot.getElementById( this._mid('stream-player' ) )
            stream.pause();
            await this.wsStopStream();
        }
    }

    stopStream() {
        this.resetView()

        this.asyncStopStream().then( () => {
            this._c.autoPlay = false
            this._stream = null;
            if(this._hls) {
                this._hls.stopLoad();
                this._hls.destroy();
                this._hls = null
            }
            if(this._dash) {
                this._dash.reset();
                this._dash = null;
            }
        })
    }

    showOrStopStream() {
        const camera = this.getState(this._s.cameraId,'unknown');
        if ( camera.state === 'streaming' ) {
            this.stopStream()
        } else {
            this.playStream()
        }
    }

    async asyncLoadLibrary() {
        this._video = null;
        this._library = await this.wsLoadLibrary(99);
        this._libraryLastCapture = this._s.capturedText
    }

    openLibrary(base) {
        this.asyncLoadLibrary().then( () => {
            this._libraryOffset = base
            this.updateLibraryView()
            this.showLibraryView()
        })
    }

    playLibraryVideo(index) {
        index += this._libraryOffset;
        if (this._library && index < this._library.length) {
            this._modalViewer = this._c.libraryClick === 'modal'
            this._video       = this._library[index].url;
            this._videoPoster = this._library[index].thumbnail;
            this.showVideo()
        } 
    }

    setLibraryBase(base) {
        this._libraryOffset = base
        this.updateLibraryView()
    }

    closeLibrary() {
        this.stopVideo()
        this._library = null
        this.showImageView()
    }

    clickImage() {
        if ( this._c.imageClick === 'modal-play' ) {
            this.playStream(true)
        } else if ( this._c.imageClick === 'play' ) {
            this.playStream(false)
        } else if ( this._c.imageClick === 'modal-last' ) {
            this.playLatestVideo(true)
        } else {
            this.playLatestVideo(false)
        }
    }

    clickVideo() {
        if ( this._misHidden("video-controls") ) {
            this.showVideoControls(2)
        } else {
            this.hideVideoControls();
        }
    }

    mouseOverVideo() {
        this.showVideoControls(2)
    }

    controlStopVideoOrStream() {
        this.stopVideo()
        this.stopStream()
    }

    controlPauseVideo(  ) {
        const video = this.shadowRoot.getElementById( this._mid( 'video-player' ) )
        video.pause();
        this.updateVideoView('paused')
    }

    controlPlayVideo( ) {
        this.updateVideoView('playing')
        const video = this.shadowRoot.getElementById( this._mid( 'video-player' ) )
        video.play();
    }

    controlFullScreen() {
        const prefix = this._stream ? 'stream-player' : 'video-player';
        let video = this.shadowRoot.getElementById( this._mid( prefix ) )
        if (video.requestFullscreen) {
            video.requestFullscreen().then()
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen(); // Firefox
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen(); // Chrome and Safari
        }
    }

    toggleCamera( ) {
        if ( this._s.cameraState === 'off' ) {
            this._hass.callService( 'camera','turn_on', { entity_id: this._s.cameraId } )
        } else {
            this._hass.callService( 'camera','turn_off', { entity_id: this._s.cameraId } )
        }
    }

    toggleLock( id ) {
        if ( this.getState(id,'locked').state === 'locked' ) {
            this._hass.callService( 'lock','unlock', { entity_id:id } )
        } else {
            this._hass.callService( 'lock','lock', { entity_id:id } )
        }
    }

    toggleLight( id ) {
        if ( this.getState(id,'on').state === 'on' ) {
            this._hass.callService( 'light','turn_off', { entity_id:id } )
        } else {
            this._hass.callService( 'light','turn_on', { entity_id:id } )
        }
    }

    setUpSeekBar() {

        let video = this.shadowRoot.getElementById( this._mid('video-player') )
        let seekBar = this.shadowRoot.getElementById( this._mid('video-seek') )

        seekBar.value = 1
        video.addEventListener("timeupdate", function() {
            seekBar.value = (100 / video.duration) * video.currentTime;
        });

        seekBar.addEventListener("change", function() {
            video.currentTime = video.duration * (seekBar.value / 100);
        });
        seekBar.addEventListener("mousedown", () => {
            this.showVideoControls(0);
            video.pause();
        });
        seekBar.addEventListener("mouseup", () => {
            video.play();
            this.hideVideoControlsLater()
        });
    }
  
    showVideoControls(seconds = 0) {
        this._mshow("video-controls")
        this.hideVideoControlsCancel();
        if (seconds !== 0) {
            this.hideVideoControlsLater(seconds);
        }
    }

    hideVideoControls() {
        this.hideVideoControlsCancel();
        this._mhide("video-controls")
    }

    hideVideoControlsLater(seconds = 2) {
        this.hideVideoControlsCancel();
        this._s.controlTimeout = setTimeout(() => {
            this._s.controlTimeout = null;
            this.hideVideoControls()
        }, seconds * 1000);
    }

    hideVideoControlsCancel() {
        if ( this._s.controlTimeout !== null ) {
            clearTimeout( this._s.controlTimeout );
            this._s.controlTimeout = null
        }
    }

    updateCameraImageSourceLater(seconds = 2) {
        setTimeout(() => {
            this.updateCameraImageSrc()
        }, seconds * 1000);
    }

}


const s = document.createElement("script")
s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
s.onload = function() {
    const s2 = document.createElement("script")
    s2.src = 'https://cdn.dashjs.org/v3.1.1/dash.all.min.js'
    s2.onload = function() {
        customElements.define('aarlo-glance', AarloGlance)
    }
    document.head.appendChild(s2)
}
document.head.appendChild(s)

// vim: set expandtab:ts=4:sw=4
