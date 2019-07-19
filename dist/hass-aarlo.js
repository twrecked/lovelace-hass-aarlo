
const LitElement = Object.getPrototypeOf(
        customElements.get("ha-panel-lovelace")
    );
const html = LitElement.prototype.html;

class AarloGlance extends LitElement {

    static get properties() {
        return {

            // Source that can change
            _image: String,
            _stream: String,
            _streamPoster: String,
            _video: String,
            _videoPoster: String,
            _library: String,
            _libraryBase: Number,

            // What are we currently showing?
            _streamHidden: String,
            _videoHidden: String,
            _libraryHidden: String,
            _libraryPrevHidden: String,
            _libraryNextHidden: String,
            _imageHidden: String,
            _topHidden: String,
            _bottomHidden: String,
            _brokeHidden: String,
            _signalHidden: String,

            // Properties of decorations
            _decorations: String,
        }
    }

    constructor() {
        super();

        this._hass = null;

        this._cameraName = 'unknown';
        this._cameraState = 'unknown';

        this._config = null;
        this._image = null;
        this._stream = null;
        this._video = null;
        this._library = null;
        this._libraryBase = null;
        this.emptyLibrary();

        this._streamHidden      = 'hidden';
        this._videoHidden       = 'hidden';
        this._libraryHidden     = 'hidden';
        this._libraryPrevHidden = 'hidden';
        this._libraryNextHidden = 'hidden';
        this._imageHidden       = 'hidden';
        this._topHidden         = 'hidden';
        this._bottomHidden      = 'hidden';
        this._brokeHidden       = 'hidden';

        this._decorations = '';
        this.resetDecorations()
    }

    static get outerStyleTemplate() {
        return html`
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
            ha-icon.state-update {
                color: #cccccc;
            }
            ha-icon.state-on {
                color: white;
            }
            ha-icon.state-warn {
                color: orange;
            }
            ha-icon.state-error {
                color: red;
            }
        </style>
        `;
    }

    static get innerStyleTemplate() {
        return html`
            <style>
                div.base-16x9 {
                    width: 100%;
                    overflow: hidden;
                    margin: 0;
                    padding-top: 55%;
                    position: relative;
                }
                .img-16x9 {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                }
                .video-16x9 {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    height: auto;
                    transform: translate(-50%, -50%);
                }
                .library-16x9 {
                    cursor: pointer;
                    width: 100%;
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
                #brokenImage {
                    background: grey url("/static/images/image-broken.svg") center/36px
                    no-repeat;
                }
            </style>
        `;
    }

    render() {

        var img = html`
            ${AarloGlance.innerStyleTemplate}
            <div id="aarlo-wrapper" class="base-16x9">
                <video class="${this._streamHidden} video-16x9"
                    id="stream-${this._cameraId}"
                    poster="${this._streamPoster}"
                    autoplay playsinline controls
                    onended="${(e) => { this.stopStream(this._cameraId); }}"
                    on-tap="${(e) => { this.stopStream(this._cameraId); }}"
                    @click="${(e) => { this.stopStream(this._cameraId); }}">
                        Your browser does not support the video tag.
                </video>
                <video class="${this._videoHidden} video-16x9"
                    src="${this._video}" type="${this._videoType}"
                    poster="${this._videoPoster}"
                    autoplay playsinline controls
                    onended="${(e) => { this.stopVideo(this._cameraId); }}"
                    on-tap="${(e) => { this.stopVideo(this._cameraId); }}"
                    @click="${(e) => { this.stopVideo(this._cameraId); }}">
                        Your browser does not support the video tag.
                </video>
                <img class="${this._imageHidden} img-16x9" id="aarlo-image" @click="${e => { this.showVideoOrStream(this._cameraId); }}" src="${this._image}" title="${this._imageFullDate}"></img>
                <div class="${this._libraryHidden} img-16x9" >
                    <div class="lrow">
                        <div class="lcolumn">
                            <img class="${this._libraryItem[0].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,0); }}" src="${this._libraryItem[0].thumbnail}" title="${this._libraryItem[0].captured_at}"/>
                            <img class="${this._libraryItem[3].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,3); }}" src="${this._libraryItem[3].thumbnail}" title="${this._libraryItem[3].captured_at}"/>
                            <img class="${this._libraryItem[6].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,6); }}" src="${this._libraryItem[6].thumbnail}" title="${this._libraryItem[6].captured_at}"/>
                        </div>
                        <div class="lcolumn">
                            <img class="${this._libraryItem[1].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,1); }}" src="${this._libraryItem[1].thumbnail}" title="${this._libraryItem[1].captured_at}"/>
                            <img class="${this._libraryItem[4].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,4); }}" src="${this._libraryItem[4].thumbnail}" title="${this._libraryItem[4].captured_at}"/>
                            <img class="${this._libraryItem[7].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,7); }}" src="${this._libraryItem[7].thumbnail}" title="${this._libraryItem[7].captured_at}"/>
                        </div>
                        <div class="lcolumn">
                            <img class="${this._libraryItem[2].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,2); }}" src="${this._libraryItem[2].thumbnail}" title="${this._libraryItem[2].captured_at}"/>
                            <img class="${this._libraryItem[5].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,5); }}" src="${this._libraryItem[5].thumbnail}" title="${this._libraryItem[5].captured_at}"/>
                            <img class="${this._libraryItem[8].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._cameraId,8); }}" src="${this._libraryItem[8].thumbnail}" title="${this._libraryItem[8].captured_at}"/>
                        </div>
                    </div>
                </div>
                <div class="${this._brokeHidden} img-16x9" style="height: 100px" id="brokenImage"></div>
            </div>
        `;

        var state = html`
            <div class="box box-top ${this._topHidden}">
                <div class="box-title ${this._topTitle?'':'hidden'}">
                    ${this._cameraName} 
                </div>
                <div class="box-status ${this._topDate?'':'hidden'} ${this._d.dateHidden}" title="${this._imageFullDate}">
                    ${this._imageDate}
                </div>
                <div class="box-status ${this._topStatus?'':'hidden'}">
                    ${this._cameraState}
                </div>
            </div>
            <div class="box box-bottom ${this._bottomHidden}">
                <div class="box-title ${this._topTitle?'hidden':''}">
                    ${this._cameraName} 
                </div>
                <div>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.motionId); }}" class="${this._d.motionOn} ${this._d.motionHidden}" icon="mdi:run-fast" title="${this._d.motionText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.soundId); }}" class="${this._d.soundOn} ${this._d.soundHidden}" icon="mdi:ear-hearing" title="${this._d.soundText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.showLibrary(this._cameraId,0); }}" class="${this._d.capturedOn} ${this._d.capturedHidden}" icon="${this._d.capturedIcon}" title="${this._d.capturedText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.showOrStopStream(this._cameraId); }}" class="${this._d.playOn} ${this._d.playHidden}" icon="${this._d.playIcon}" title="${this._d.playText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.updateSnapshot(this._cameraId); }}" class="${this._d.snapshotOn} ${this._d.snapshotHidden}" icon="${this._d.snapshotIcon}" title="${this._d.snapshotText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.batteryId); }}" class="${this._d.batteryState} ${this._d.batteryHidden}" icon="mdi:${this._d.batteryIcon}" title="${this._d.batteryText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.signalId); }}" class="state-update ${this._d.signalHidden}" icon="${this._d.signalIcon}" title="${this._d.signalText}"></ha-icon>
                </div>
                <div class="box-title ${this._topDate?'hidden':''} ${this._d.dateHidden}" title="${this._imageFullDate}">
                    ${this._imageDate}
                </div>
                <div class="box-status ${this._d.doorStatusHidden}">
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.doorId); }}" class="${this._d.doorOn} ${this._d.doorHidden}" icon="${this._d.doorIcon}" title="${this._d.doorText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.doorBellId); }}" class="${this._d.doorBellOn} ${this._d.doorBellHidden}" icon="${this._d.doorBellIcon}" title="${this._d.doorBellText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.toggleLock(this._d.doorLockId); }}" class="${this._d.doorLockOn} ${this._d.doorLockHidden}" icon="${this._d.doorLockIcon}" title="${this._d.doorLockText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.door2Id); }}" class="${this._d.door2On} ${this._d.door2Hidden}" icon="${this._d.door2Icon}" title="${this._d.door2Text}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._d.door2BellId); }}" class="${this._d.door2BellOn} ${this._d.door2BellHidden}" icon="${this._d.door2BellIcon}" title="${this._d.door2BellText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.toggleLock(this._d.door2LockId); }}" class="${this._d.door2LockOn} ${this._d.door2LockHidden}" icon="${this._d.door2LockIcon}" title="${this._d.door2LockText}"></ha-icon>
                </div>
                <div class="box-status ${this._topStatus?'hidden':''}">
                    ${this._cameraState}
                </div>
            </div>
            <div class="box box-bottom-small ${this._libraryHidden}">
                <div >
                    <ha-icon @click="${(e) => { this.setLibraryBase(this._libraryBase - 9); }}" class="${this._libraryPrevHidden} state-on" icon="mdi:chevron-left" title="previous"></ha-icon>
                </div>
                <div >
                    <ha-icon @click="${(e) => { this.stopLibrary(); }}" class="state-on" icon="mdi:close" title="close library"></ha-icon>
                </div>
                <div >
                    <ha-icon @click="${(e) => { this.setLibraryBase(this._libraryBase + 9); }}" class="${this._libraryNextHidden} state-on" icon="mdi:chevron-right" title="next"></ha-icon>
                </div>
            </div>
        `;

        return html`
            ${AarloGlance.outerStyleTemplate}
            <ha-card>
            ${img}
            ${state}
            </ha-card>
        `;
    }

    throwError( err ) {
        console.error( err )
        throw new Error( err )
    }

    isGood( obj ) {
        return obj == null || obj === undefined ? false : true;
    }

    getState( _id,def='' ) {
        return this.isGood( this._hass ) &&
                    _id in this._hass.states ? this._hass.states[_id] : { 'state':def,'attributes':{ 'friendly_name':'unknown' } };
    }

    emptyLibrary() {
        this._libraryItem = [ ]
        while( this._libraryItem.length < 9 ) {
            this._libraryItem.push( { 'hidden':'hidden','thumbnail':'/static/images/image-broken.svg','captured_at':'' } )
        }
    }

    resetDecorations() {
        this._d = {

            dateHidden: 'hidden',

            playHidden: 'hidden',
            playOn: 'not-used',
            playText: 'not-used',
            playIcon: 'mdi:camera',

            snapshotHidden: 'hidden',
            snapshotOn: 'not-used',
            snapshotText: 'not-used',
            snapshotIcon: 'mdi:camera',

            batteryHidden: 'hidden',
            batteryIcon:  'not-used',
            batteryState: 'state-update',
            batteryText:  'not-used',

            signalHidden: 'hidden',
            signalText: 'not-used',
            signalIcon: 'mdi:wifi-strength-4',

            motionHidden: 'hidden',
            motionOn: 'not-used',
            motionText: 'not-used',

            soundHidden: 'hidden',
            soundOn: 'not-used',
            soundText: 'not-used',

            capturedHidden: 'hidden',
            capturedText: 'not-used',
            capturedOn: '',
            capturedIcon: 'mdi:file-video',

            doorHidden: 'hidden',
            doorOn: 'not-used',
            doorText: 'not-used',
            doorIcon: 'not-used',
            door2Hidden: 'hidden',
            door2On: 'not-used',
            door2Text: 'not-used',
            door2Icon: 'not-used',

            doorLockHidden: 'hidden',
            doorLockOn: 'not-used',
            doorLockText: 'not-used',
            doorLockIcon: 'not-used',
            door2LockHidden: 'hidden',
            door2LockOn: 'not-used',
            door2LockText: 'not-used',
            door2LockIcon: 'not-used',

            doorBellHidden: 'hidden',
            doorBellOn: 'not-used',
            doorBellText: 'not-used',
            doorBellIcon: 'not-used',
            door2BellHidden: 'hidden',
            door2BellOn: 'not-used',
            door2BellText: 'not-used',
            door2BellIcon: 'not-used',

            doorStatusHidden: 'hidden',
        }
    }

    updateConfig() {

        // what are we showing?
        var show = this._config.show || [];

        this._d.playHidden     = show.includes('play') ? '':'hidden';
        this._d.snapshotHidden = show.includes('snapshot') ? '':'hidden';
        this._d.batteryHidden  = show.includes('battery') || show.includes('battery_level') ? '':'hidden';
        this._d.signalHidden   = show.includes('signal_strength') ? '':'hidden';
        this._d.motionHidden   = show.includes('motion') ? '':'hidden';
        this._d.soundHidden    = show.includes('sound') ? '':'hidden';
        this._d.capturedHidden = show.includes('captured') || show.includes('captured_today') ? '':'hidden';
        this._d.dateHidden     = show.includes('image_date') ? '':'hidden';

        this._d.doorHidden      = this._d.doorId ? '':'hidden'
        this._d.doorLockHidden  = this._d.doorLockId ? '':'hidden'
        this._d.doorBellHidden  = this._d.doorBellId ? '':'hidden'
        this._d.door2Hidden     = this._d.door2Id ? '':'hidden'
        this._d.door2LockHidden = this._d.door2LockId ? '':'hidden'
        this._d.door2BellHidden = this._d.door2BellId ? '':'hidden'

        this._decorations = JSON.stringify( this._d )
    }

    updateState( oldValue ) {

        // nothing?
        if ( !this.isGood( this._hass ) ) {
            return;
        }

        // CAMERA
        const camera = this.getState(this._cameraId,'unknown')

        // Initial setting? Just get an image.
        if ( !this.isGood( oldValue ) ) {
            this._cameraName = this._config.name ? this._config.name : camera.attributes.friendly_name;
            this._cameraState = camera.state
            this.updateCameraImageSrc()
        }

        // See if camera has stopped doing something useful. Get new image
        // if that's the case.
        if ( camera.state == 'idle' ) {
            if ( this._cameraState == 'taking snapshot' ) {
                this.updateCameraImageSrc()
                setTimeout( this.updateCameraImageSrc,5000 )
                setTimeout( this.updateCameraImageSrc,10000 )
                setTimeout( this.updateCameraImageSrc,15000 )
            } else if ( this._cameraState != 'idle' ) {
                this.updateCameraImageSrc()
            }
        }

        // Save out current state for later.
        this._cameraState = camera.state

        // FUNCTIONS
        if( this._d.playHidden == '' ) {
            this._d.playOn = 'state-on';
            if ( camera.state != 'streaming' ) {
                this._d.playText = 'click to live-stream'
                this._d.playIcon = 'mdi:play'
            } else {
                this._d.playText = 'click to stop stream'
                this._d.playIcon = 'mdi:stop'
            }
        }

        if( this._d.snapshotHidden == '' ) {
            this._d.snapshotOn   = '';
            this._d.snapshotText = 'click to update image'
            this._d.snapshotIcon = 'mdi:camera'
        }

        // SENSORS
        if( this._d.batteryHidden == '' ) {
            if ( camera.attributes.wired ) {
                this._d.batteryText  = 'Plugged In';
                this._d.batteryIcon  = 'power-plug';
                this._d.batteryState = 'state-update';
            } else {
                var battery        = this.getState(this._d.batteryId,0);
                var batteryPrefix  = camera.attributes.charging ? 'battery-charging' : 'battery'
                this._d.batteryText  = 'Battery Strength: ' + battery.state +'%';
                this._d.batteryIcon  = batteryPrefix + ( battery.state < 10 ? '-outline' :
                                                    ( battery.state > 90 ? '' : '-' + Math.round(battery.state/10) + '0' ) );
                this._d.batteryState = battery.state < 25 ? 'state-warn' : ( battery.state < 15 ? 'state-error' : 'state-update' );
            }
        }

        if( this._d.signalHidden == '' ) {
            var signal       = this.getState(this._d.signalId,0);
            this._d.signalText = 'Signal Strength: ' + signal.state;
            this._d.signalIcon = signal.state == 0 ? 'mdi:wifi-outline' : 'mdi:wifi-strength-' + signal.state;
        }

        if( this._d.motionHidden == '' ) {
            this._d.motionOn   = this.getState(this._d.motionId,'off').state == 'on' ? 'state-on' : '';
            this._d.motionText = 'Motion: ' + (this._d.motionOn != '' ? 'detected' : 'clear');
        }

        if( this._d.soundHidden == '' ) {
            this._d.soundOn    = this.getState(this._d.soundId,'off').state == 'on' ? 'state-on' : '';
            this._d.soundText  = 'Sound: ' + (this._d.soundOn != '' ? 'detected' : 'clear');
        }

        if( this._d.capturedHidden == '' ) {
            var captured       = this.getState(this._d.captureId,0).state;
            var last           = this.getState(this._d.lastId,0).state;
            this._d.capturedText = 'Captured: ' + ( captured == 0 ? 'nothing today' : captured + ' clips today, last at ' + last )
            this._d.capturedIcon = this._video ? 'mdi:stop' : 'mdi:file-video'
            this._d.capturedOn   = captured != 0 ? 'state-update' : ''
        }

        // OPTIONAL DOORS
        if( this._d.doorHidden == '' ) {
            var doorState          = this.getState(this._d.doorId,'off');
            this._d.doorOn           = doorState.state == 'on' ? 'state-on' : '';
            this._d.doorText         = doorState.attributes.friendly_name + ': ' + (this._d.doorOn == '' ? 'closed' : 'open');
            this._d.doorIcon         = this._d.doorOn == '' ? 'mdi:door' : 'mdi:door-open';
            this._d.doorStatusHidden = '';
        }
        if( this._d.door2Hidden == '' ) {
            var door2State         = this.getState(this._d.door2Id,'off');
            this._d.door2On          = door2State.state == 'on' ? 'state-on' : '';
            this._d.door2Text        = door2State.attributes.friendly_name + ': ' + (this._d.door2On == '' ? 'closed' : 'open');
            this._d.door2Icon        = this._d.door2On == '' ? 'mdi:door' : 'mdi:door-open';
            this._d.doorStatusHidden = '';
        }

        if( this._d.doorLockHidden == '' ) {
            var doorLockState      = this.getState(this._d.doorLockId,'locked');
            this._d.doorLockOn       = doorLockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._d.doorLockText     = doorLockState.attributes.friendly_name + ': ' + (this._d.doorLockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._d.doorLockIcon     = this._d.doorLockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
            this._d.doorStatusHidden = '';
        }
        if( this._d.door2LockHidden == '' ) {
            var door2LockState     = this.getState(this._d.door2LockId,'locked');
            this._d.door2LockOn      = door2LockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._d.door2LockText    = door2LockState.attributes.friendly_name + ': ' + (this._d.door2LockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._d.door2LockIcon    = this._d.door2LockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
            this._d.doorStatusHidden = '';
        }

        if( this._d.doorBellHidden == '' ) {
            var doorBellState    = this.getState(this._d.doorBellId,'off');
            this._d.doorBellOn       = doorBellState.state == 'on' ? 'state-on' : '';
            this._d.doorBellText     = doorBellState.attributes.friendly_name + ': ' + (this._d.doorBellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._d.doorBellIcon     = 'mdi:doorbell-video';
            this._d.doorStatusHidden = '';
        }
        if( this._d.door2BellHidden == '' ) {
            var door2BellState    = this.getState(this._d.door2BellId,'off');
            this._d.door2BellOn       = door2BellState.state == 'on' ? 'state-on' : '';
            this._d.door2BellText     = door2BellState.attributes.friendly_name + ': ' + (this._d.door2BellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._d.door2BellIcon     = 'mdi:doorbell-video';
            this._d.doorStatusHidden = '';
        }

        this._decorations = JSON.stringify( this._d )
    }

    updateSource() {

        // reset everything...
        this._streamHidden      = 'hidden';
        this._videoHidden       = 'hidden';
        this._libraryHidden     = 'hidden';
        this._libraryPrevHidden = 'hidden';
        this._libraryNextHidden = 'hidden';
        this._imageHidden       = 'hidden';
        this._topHidden         = 'hidden';
        this._bottomHidden      = 'hidden';
        this._brokeHidden       = 'hidden';

        if( this._stream ) {
            this._streamHidden = '';

        } else if( this._video ) {
            this._videoHidden = '';

        } else if ( this._library ) {

            this.emptyLibrary();
            this._libraryHidden     = '';
            this._libraryPrevHidden = this._libraryBase > 0 ? '' : 'hidden';
            this._libraryNextHidden = this._libraryBase + 9 < this._library.length ? '' : 'hidden';
            var i;
            var j;
            var last = Math.min( this._libraryBase + 9,this._library.length )
            for( i = 0, j = this._libraryBase; j < last; i++,j++ ) {
                var captured_text = this._library[j].created_at_pretty
                if ( this._library[j].object && this._library[j].object != '' ) {
                    captured_text += ' (' + this._library[j].object.toLowerCase() + ')'
                }
                this._libraryItem[i] = ( { 'hidden':'',
                                    'thumbnail':this._library[j].thumbnail,
                                    'captured_at':'captured: ' + captured_text } );
            }

        } else if ( this._image ) {
            const camera = this.getState(this._cameraId,'unknown')

            this._imageHidden   = '';
            this._brokeHidden   = 'hidden';
            this._topHidden     = this._topTitle || this._topStatus ? '':'hidden';
            this._bottomHidden  = '';

            // image title
            this._imageFullDate = camera.attributes.image_source ? camera.attributes.image_source : '';
            this._imageDate = ''
            if( this._imageFullDate.startsWith('capture/') ) { 
                this._imageDate = this.getState(this._d.lastId,0).state;
                this._imageFullDate = 'automatically captured at ' + this._imageDate;
            } else if( this._imageFullDate.startsWith('snapshot/') ) { 
                this._imageDate = this._imageFullDate.substr(9);
                this._imageFullDate = 'snapshot captured at ' + this._imageDate;
            }


            // for later use!
            this._clientWidth  = this.clientWidth
            this._clientHeight = this.clientHeight

        } else {
            this._brokeHidden   = ''
            this._topHidden     = this._topTitle || this._topStatus ? '':'hidden';
            this._bottomHidden  = '';
        }
    }

    updated(changedProperties) {
        changedProperties.forEach( (oldValue, propName) => {

            switch( propName ) {

                case '_hass':
                    this.updateState( oldValue );
                    break;

                case '_image':
                case '_video':
                case '_stream':
                case '_library':
                case '_libraryBase':
                    this.updateSource();
                    break;

                case '_p':
                    console.log('anything')
                    break;
            }

            // Start video if streaming is turning on.
            if ( propName == '_stream' && oldValue == null ) {
                if ( this._stream ) {
                    var video = this.shadowRoot.getElementById( 'stream-' + this._cameraId )
                    if ( Hls.isSupported() ) {
                        this._hls = new Hls();
                        this._hls.loadSource( this._stream )
                        this._hls.attachMedia(video);
                        this._hls.on(Hls.Events.MANIFEST_PARSED,function() {
                            video.play();
                        });
                    }
                    else if ( video.canPlayType('application/vnd.apple.mpegurl') ) {
                        video.src = this._stream
                        video.addEventListener('loadedmetadata',function() {
                            video.play();
                        });
                    }
                }
            }
        });
    }

    set hass( hass ) {
        var old = this._hass
        this._hass = hass
        this.updateState( old )
    }

    checkConfig() {

        if ( !this.isGood(this._hass) ) {
            return;
        }

        if ( !(this._cameraId in this._hass.states) ) {
            this.throwError( 'unknown camera' );
        }
        if ( this._d.doorId && !(this._d.doorId in this._hass.states) ) {
            this.throwError( 'unknown door' )
        }
        if ( this._d.doorBellId && !(this._d.doorBellId in this._hass.states) ) {
            this.throwError( 'unknown door bell' )
        }
        if ( this._d.doorLockId && !(this._d.doorLockId in this._hass.states) ) {
            this.throwError( 'unknown door lock' )
        }
        if ( this._d.door2Id && !(this._d.door2Id in this._hass.states) ) {
            this.throwError( 'unknown door (#2)' )
        }
        if ( this._d.door2BellId && !(this._d.door2BellId in this._hass.states) ) {
            this.throwError( 'unknown door bell (#2)' )
        }
        if ( this._d.door2LockId && !(this._d.door2LockId in this._hass.states) ) {
            this.throwError( 'unknown door lock (#2)' )
        }
    }

    setConfig(config) {

        var camera = undefined;
        if( config.entity ) {
            camera = config.entity.replace( 'camera.aarlo_','' );
        }
        if( config.camera ) {
            camera = config.camera;
        }
        if( !this.isGood(camera) ) {
            this.throwError( 'missing a camera definition' );
        }
        if( !config.show ) {
            this.throwError( 'missing show components' );
        }

        // save new config and reset decoration properties
        this._config = config;
        this.resetDecorations()

        // camera and sensors
        this._cameraId  = 'camera.aarlo_' + camera;
        this._d.motionId  = 'binary_sensor.aarlo_motion_' + camera;
        this._d.soundId   = 'binary_sensor.aarlo_sound_' + camera;
        this._d.batteryId = 'sensor.aarlo_battery_level_' + camera;
        this._d.signalId  = 'sensor.aarlo_signal_strength_' + camera;
        this._d.captureId = 'sensor.aarlo_captured_today_' + camera;
        this._d.lastId    = 'sensor.aarlo_last_' + camera;

        // on click
        this._imageClick = config.image_click ? config.image_click : false

        // door definition
        this._d.doorId     = config.door ? config.door: null
        this._d.doorBellId = config.door_bell ? config.door_bell : null
        this._d.doorLockId = config.door_lock ? config.door_lock : null

        // door2 definition
        this._d.door2Id     = config.door2 ? config.door2: null
        this._d.door2BellId = config.door2_bell ? config.door2_bell : null
        this._d.door2LockId = config.door2_lock ? config.door2_lock : null

        // ui configuration
        this._topTitle  = config.top_title ? config.top_title : false
        this._topDate   = config.top_date ? config.top_date : false
        this._topStatus = config.top_status ? config.top_status : false

        // run some final checks`
        this.checkConfig()
        this.updateConfig()
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

    async readLibrary( id,at_most ) {
        try {
            const library = await this._hass.callWS({
                type: "aarlo_library",
                entity_id: this._cameraId,
                at_most: at_most,
            });
            return ( library.videos.length > 0 ) ? library.videos : null;
        } catch (err) {
            return null
        }
    }

    stopVideo( id ) {
        this._video = null
    }

    async showVideo( id ) {
        var video = await this.readLibrary( id,1 );
        if ( video ) {
            this._video       = video[0].url;
            this._videoPoster = video[0].thumbnail;
            this._videoType   = "video/mp4"
        } else {
            this._video       = null
            this._videoPoster = null
            this._videoType   = null
        }
    }

    async readStream( id,at_most ) {
        try {
            const stream = await this._hass.callWS({
                type: "camera/stream",
                entity_id: this._cameraId,
            });
            return stream
        } catch (err) {
            return null
        }
    }

    async stopStream( id ) {
        try {
            const stopped = await this._hass.callWS({
                type: "aarlo_stop_activity",
                entity_id: this._cameraId,
            });
        } catch (err) { }

        this._stream = null
        if ( this._hls ) {
            this._hls.stopLoad()
            this._hls.destroy()
            this._hls = null
        }
    }

    async showStream( id ) {
        var stream = await this.readStream( id,1 );
        if ( stream ) {
            this._stream       = stream.url;
            this._streamPoster = this._image
            this._streamType   = 'application/x-mpegURL'
        } else {
            this._stream       = null
            this._streamPoster = null
            this._streamType   = null
        }
    }

    async showOrStopStream( id ) {
        const camera = this.getState(this._cameraId,'unknown')
        if ( camera.state == 'streaming' ) {
            this.stopStream( id )
        } else {
            this.showStream( id )
        }
    }

    async showVideoOrStream( id ) {
        // on click
        if ( this._imageClick && this._imageClick == 'play' ) {
            this.showStream(id)
        } else {
            this.showVideo(id)
        }
    }

    async showLibrary( id,base ) {
        this._video = null
        this._library = await this.readLibrary( id,99 )
        this._libraryBase = base
    }

    async showLibraryVideo( id,index ) {
        index += this._libraryBase
        if ( this._library && index < this._library.length ) {
            this._video = this._library[index].url;
            this._videoPoster = this._library[index].thumbnail;
        } else {
            this._video = null
            this._videoPoster = null
        }
    }

    setLibraryBase( base ) {
        this._libraryBase = base
    }

    stopLibrary( ) {
        this._video = null
        this._library = null
    }

    async updateSnapshot( id ) {
        try {
            const { content_type: contentType, content } = await this._hass.callWS({
                type: "aarlo_snapshot_image",
                entity_id: this._cameraId,
            });
            this._image = `data:${contentType};base64, ${content}`;
        } catch (err) {
            this._image = null
        }
    }

    async updateCameraImageSrc() {
        try {
            const { content_type: contentType, content } = await this._hass.callWS({
                type: "camera_thumbnail",
                entity_id: this._cameraId,
            });
            this._image = `data:${contentType};base64, ${content}`;
        } catch (err) {
            this._image = null
        }
    }

    toggleLock( id ) {
        if ( this.getState(id,'locked').state == 'locked' ) {
            this._hass.callService( 'lock','unlock', { entity_id:id } )
        } else {
            this._hass.callService( 'lock','lock', { entity_id:id } )
        }
    }

    getCardSize() {
        return 3;
    }
}

var s = document.createElement("script");
s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
s.onload = function(e) {
    customElements.define('aarlo-glance', AarloGlance);
};
document.head.appendChild(s);

