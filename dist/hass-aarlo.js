
const LitElement = Object.getPrototypeOf(
        customElements.get("ha-panel-lovelace")
    );
const html = LitElement.prototype.html;

class AarloGlance extends LitElement {

    static get properties() {
        return {

			// XXX I wanted these in a Object types but litElement doesn't seem
			// to catch property changes in an object...

			// What media are showing.
			// These are changed by user input on the GUI
			_image: String,
			_video: String,
			_stream: String,
			_library: String,
			_libraryOffset: String,

            // Sensor/variable statuses
			// Any information that appears on screen either directly or in hover-overs
			// These are changed by hass state changes.
            _statuses: String,

			// What things are showing?
			// Set 'hidden' on items we don't want to see.
			// These are changed by card configruation or media changes.
			_visibility: String,
        }
    }

    constructor() {
        super();

        this._hass = null;
        this._config = null;

        this.resetStatuses()
        this._statuses = JSON.stringify( this._s )

		this.resetVisiblity();
        this._visibility = JSON.stringify( this._v )
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
                <video class="${this._v.stream} video-16x9"
                    id="stream-${this._s.cameraId}"
                    poster="${this._streamPoster}"
                    autoplay playsinline controls
                    onended="${(e) => { this.stopStream(this._s.cameraId); }}"
                    on-tap="${(e) => { this.stopStream(this._s.cameraId); }}"
                    @click="${(e) => { this.stopStream(this._s.cameraId); }}">
                        Your browser does not support the video tag.
                </video>
                <video class="${this._v.video} video-16x9"
                    src="${this._video}" type="${this._videoType}"
                    poster="${this._videoPoster}"
                    autoplay playsinline controls
                    onended="${(e) => { this.stopVideo(this._s.cameraId); }}"
                    on-tap="${(e) => { this.stopVideo(this._s.cameraId); }}"
                    @click="${(e) => { this.stopVideo(this._s.cameraId); }}">
                        Your browser does not support the video tag.
                </video>
                <img class="${this._v.image} img-16x9" id="aarlo-image" @click="${e => { this.showVideoOrStream(this._s.cameraId); }}" src="${this._image}" title="${this._s.imageFullDate}"></img>
                <div class="${this._v.library} img-16x9" >
                    <div class="lrow">
                        <div class="lcolumn">
                            <img class="${this._s.libraryItem[0].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,0); }}" src="${this._s.libraryItem[0].thumbnail}" title="${this._s.libraryItem[0].captured_at}"/>
                            <img class="${this._s.libraryItem[3].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,3); }}" src="${this._s.libraryItem[3].thumbnail}" title="${this._s.libraryItem[3].captured_at}"/>
                            <img class="${this._s.libraryItem[6].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,6); }}" src="${this._s.libraryItem[6].thumbnail}" title="${this._s.libraryItem[6].captured_at}"/>
                        </div>
                        <div class="lcolumn">
                            <img class="${this._s.libraryItem[1].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,1); }}" src="${this._s.libraryItem[1].thumbnail}" title="${this._s.libraryItem[1].captured_at}"/>
                            <img class="${this._s.libraryItem[4].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,4); }}" src="${this._s.libraryItem[4].thumbnail}" title="${this._s.libraryItem[4].captured_at}"/>
                            <img class="${this._s.libraryItem[7].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,7); }}" src="${this._s.libraryItem[7].thumbnail}" title="${this._s.libraryItem[7].captured_at}"/>
                        </div>
                        <div class="lcolumn">
                            <img class="${this._s.libraryItem[2].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,2); }}" src="${this._s.libraryItem[2].thumbnail}" title="${this._s.libraryItem[2].captured_at}"/>
                            <img class="${this._s.libraryItem[5].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,5); }}" src="${this._s.libraryItem[5].thumbnail}" title="${this._s.libraryItem[5].captured_at}"/>
                            <img class="${this._s.libraryItem[8].hidden} library-16x9" @click="${(e) => { this.showLibraryVideo(this._s.cameraId,8); }}" src="${this._s.libraryItem[8].thumbnail}" title="${this._s.libraryItem[8].captured_at}"/>
                        </div>
                    </div>
                </div>
                <div class="${this._v.brokeStatus} img-16x9" style="height: 100px" id="brokenImage"></div>
            </div>
        `;

        var state = html`
            <div class="box box-top ${this._v.topBar}">
                <div class="box-title ${this._v.topTitle?'':'hidden'}">
                    ${this._s.cameraName} 
                </div>
                <div class="box-status ${this._v.topDate?'':'hidden'} ${this._v.image_date}" title="${this._s.imageFullDate}">
                    ${this._s.imageDate}
                </div>
                <div class="box-status ${this._v.topStatus?'':'hidden'}">
                    ${this._s.cameraState}
                </div>
            </div>
            <div class="box box-bottom ${this._v.bottomBar}">
                <div class="box-title ${this._v.topTitle?'hidden':''}">
                    ${this._s.cameraName} 
                </div>
                <div>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.motionId); }}" class="${this._s.motionOn} ${this._v.motion}" icon="mdi:run-fast" title="${this._s.motionText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.soundId); }}" class="${this._s.soundOn} ${this._v.sound}" icon="mdi:ear-hearing" title="${this._s.soundText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.showLibrary(this._s.cameraId,0); }}" class="${this._s.capturedOn} ${this._v.captured}" icon="${this._s.capturedIcon}" title="${this._s.capturedText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.showOrStopStream(this._s.cameraId); }}" class="${this._s.playOn} ${this._v.play}" icon="${this._s.playIcon}" title="${this._s.playText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.updateSnapshot(this._s.cameraId); }}" class="${this._s.snapshotOn} ${this._v.snapshot}" icon="${this._s.snapshotIcon}" title="${this._s.snapshotText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.batteryId); }}" class="${this._s.batteryState} ${this._v.battery}" icon="mdi:${this._s.batteryIcon}" title="${this._s.batteryText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.signalId); }}" class="state-update ${this._v.signal}" icon="${this._s.signalIcon}" title="${this._s.signalText}"></ha-icon>
                </div>
                <div class="box-title ${this._v.topDate?'hidden':''} ${this._v.image_date}" title="${this._s.imageFullDate}">
                    ${this._s.imageDate}
                </div>
                <div class="box-status ${this._v.doorStatus}">
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.doorId); }}" class="${this._s.doorOn} ${this._v.door}" icon="${this._s.doorIcon}" title="${this._s.doorText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.doorBellId); }}" class="${this._s.doorBellOn} ${this._v.doorBell}" icon="${this._s.doorBellIcon}" title="${this._s.doorBellText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.toggleLock(this._s.doorLockId); }}" class="${this._s.doorLockOn} ${this._v.doorLock}" icon="${this._s.doorLockIcon}" title="${this._s.doorLockText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.door2Id); }}" class="${this._s.door2On} ${this._v.door2}" icon="${this._s.door2Icon}" title="${this._s.door2Text}"></ha-icon>
                    <ha-icon @click="${(e) => { this.moreInfo(this._s.door2BellId); }}" class="${this._s.door2BellOn} ${this._v.door2Bell}" icon="${this._s.door2BellIcon}" title="${this._s.door2BellText}"></ha-icon>
                    <ha-icon @click="${(e) => { this.toggleLock(this._s.door2LockId); }}" class="${this._s.door2LockOn} ${this._v.door2Lock}" icon="${this._s.door2LockIcon}" title="${this._s.door2LockText}"></ha-icon>
                </div>
                <div class="box-status ${this._v.topStatus?'hidden':''}">
                    ${this._s.cameraState}
                </div>
            </div>
            <div class="box box-bottom-small ${this._v.library}">
                <div >
                    <ha-icon @click="${(e) => { this.setLibraryBase(this._libraryOffset - 9); }}" class="${this._v.libraryPrev} state-on" icon="mdi:chevron-left" title="previous"></ha-icon>
                </div>
                <div >
                    <ha-icon @click="${(e) => { this.stopLibrary(); }}" class="state-on" icon="mdi:close" title="close library"></ha-icon>
                </div>
                <div >
                    <ha-icon @click="${(e) => { this.setLibraryBase(this._libraryOffset + 9); }}" class="${this._v.libraryNext} state-on" icon="mdi:chevron-right" title="next"></ha-icon>
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
        this._s.libraryItem = [ ]
        while( this._s.libraryItem.length < 9 ) {
            this._s.libraryItem.push( { 'hidden':'hidden','thumbnail':'/static/images/image-broken.svg','captured_at':'' } )
        }
    }

	resetVisiblity() {
		this._v = {

			// media
            image: 'hidden',
            stream: 'hidden',
            video: 'hidden',
            library: 'hidden',
            broke: 'hidden',

			// decorations
            play: 'hidden',
            snapshot: 'hidden',
            libraryPrev: 'hidden',
            libraryNext: 'hidden',
            topBar: 'hidden',
            bottomBar: 'hidden',
            doorStatus: 'hidden',

			// sensors
            date: 'hidden',
            battery: 'hidden',
            signal: 'hidden',
            motion: 'hidden',
            sound: 'hidden',
            captured: 'hidden',
            door: 'hidden',
            door2: 'hidden',
            doorLock: 'hidden',
            door2Lock: 'hidden',
            doorBell: 'hidden',
            door2Bell: 'hidden',
		}
	}

    resetStatuses() {
        this._s = {

			cameraName: 'unknown',
			cameraState: 'unknown',

            playOn: 'not-used',
            playText: 'not-used',
            playIcon: 'mdi:camera',

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
        }

		this.emptyLibrary();
    }

    updateStatuses( oldValue ) {

        // nothing?
        if ( !this.isGood( this._hass ) ) {
            return;
        }

        // CAMERA
        const camera = this.getState(this._s.cameraId,'unknown')

        // Initial setting? Just get an image.
        if ( !this.isGood( oldValue ) ) {
            this._s.cameraName = this._config.name ? this._config.name : camera.attributes.friendly_name;
            this._s.cameraState = camera.state
            this.updateCameraImageSrc()
        }

        // See if camera has stopped doing something useful. Get new image
        // if that's the case.
        if ( camera.state == 'idle' ) {
            if ( this._s.cameraState == 'taking snapshot' ) {
                this.updateCameraImageSrc()
                setTimeout( this.updateCameraImageSrc,5000 )
                setTimeout( this.updateCameraImageSrc,10000 )
                setTimeout( this.updateCameraImageSrc,15000 )
            } else if ( this._s.cameraState != 'idle' ) {
                this.updateCameraImageSrc()
            }
        }

        // Save out current state for later.
        this._s.cameraState = camera.state

        // FUNCTIONS
        if( this._v.play == '' ) {
            this._s.playOn = 'state-on';
            if ( camera.state != 'streaming' ) {
                this._s.playText = 'click to live-stream'
                this._s.playIcon = 'mdi:play'
            } else {
                this._s.playText = 'click to stop stream'
                this._s.playIcon = 'mdi:stop'
            }
        }

        if( this._v.snapshot == '' ) {
            this._s.snapshotOn   = '';
            this._s.snapshotText = 'click to update image'
            this._s.snapshotIcon = 'mdi:camera'
        }

        // SENSORS
        if( this._v.battery == '' ) {
            if ( camera.attributes.wired ) {
                this._s.batteryText  = 'Plugged In';
                this._s.batteryIcon  = 'power-plug';
                this._s.batteryState = 'state-update';
            } else {
                var battery          = this.getState(this._s.batteryId,0);
                var batteryPrefix    = camera.attributes.charging ? 'battery-charging' : 'battery'
                this._s.batteryText  = 'Battery Strength: ' + battery.state +'%';
                this._s.batteryIcon  = batteryPrefix + ( battery.state < 10 ? '-outline' :
                                                    ( battery.state > 90 ? '' : '-' + Math.round(battery.state/10) + '0' ) );
                this._s.batteryState = battery.state < 25 ? 'state-warn' : ( battery.state < 15 ? 'state-error' : 'state-update' );
            }
        }

        if( this._v.signal == '' ) {
            var signal         = this.getState(this._s.signalId,0);
            this._s.signalText = 'Signal Strength: ' + signal.state;
            this._s.signalIcon = signal.state == 0 ? 'mdi:wifi-outline' : 'mdi:wifi-strength-' + signal.state;
        }

        if( this._v.motion == '' ) {
            this._s.motionOn   = this.getState(this._s.motionId,'off').state == 'on' ? 'state-on' : '';
            this._s.motionText = 'Motion: ' + (this._s.motionOn != '' ? 'detected' : 'clear');
        }

        if( this._v.sound == '' ) {
            this._s.soundOn   = this.getState(this._s.soundId,'off').state == 'on' ? 'state-on' : '';
            this._s.soundText = 'Sound: ' + (this._s.soundOn != '' ? 'detected' : 'clear');
        }

        if( this._v.captured == '' ) {
            var captured         = this.getState(this._s.captureId,0).state;
            var last             = this.getState(this._s.lastId,0).state;
            this._s.capturedText = 'Captured: ' + ( captured == 0 ? 'nothing today' : captured + ' clips today, last at ' + last )
            this._s.capturedIcon = this._video ? 'mdi:stop' : 'mdi:file-video'
            this._s.capturedOn   = captured != 0 ? 'state-update' : ''
        }

        // OPTIONAL DOORS
        if( this._v.door == '' ) {
            var doorState    = this.getState(this._s.doorId,'off');
            this._s.doorOn   = doorState.state == 'on' ? 'state-on' : '';
            this._s.doorText = doorState.attributes.friendly_name + ': ' + (this._s.doorOn == '' ? 'closed' : 'open');
            this._s.doorIcon = this._s.doorOn == '' ? 'mdi:door' : 'mdi:door-open';
        }
        if( this._v.door2 == '' ) {
            var door2State    = this.getState(this._s.door2Id,'off');
            this._s.door2On   = door2State.state == 'on' ? 'state-on' : '';
            this._s.door2Text = door2State.attributes.friendly_name + ': ' + (this._s.door2On == '' ? 'closed' : 'open');
            this._s.door2Icon = this._s.door2On == '' ? 'mdi:door' : 'mdi:door-open';
        }

        if( this._v.doorLock == '' ) {
            var doorLockState    = this.getState(this._s.doorLockId,'locked');
            this._s.doorLockOn   = doorLockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._s.doorLockText = doorLockState.attributes.friendly_name + ': ' + (this._s.doorLockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._s.doorLockIcon = this._s.doorLockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
        }
        if( this._v.door2Lock == '' ) {
            var door2LockState    = this.getState(this._s.door2LockId,'locked');
            this._s.door2LockOn   = door2LockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._s.door2LockText = door2LockState.attributes.friendly_name + ': ' + (this._s.door2LockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._s.door2LockIcon = this._s.door2LockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
        }

        if( this._v.doorBell == '' ) {
            var doorBellState    = this.getState(this._s.doorBellId,'off');
            this._s.doorBellOn   = doorBellState.state == 'on' ? 'state-on' : '';
            this._s.doorBellText = doorBellState.attributes.friendly_name + ': ' + (this._s.doorBellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._s.doorBellIcon = 'mdi:doorbell-video';
        }
        if( this._v.door2Bell == '' ) {
            var door2BellState    = this.getState(this._s.door2BellId,'off');
            this._s.door2BellOn   = door2BellState.state == 'on' ? 'state-on' : '';
            this._s.door2BellText = door2BellState.attributes.friendly_name + ': ' + (this._s.door2BellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._s.door2BellIcon = 'mdi:doorbell-video';
        }

		this._statuses = JSON.stringify( this._s )
		this._visibility = JSON.stringify( this._v )
    }

    updateMedia() {

        // reset everything...
        this._v.stream      = 'hidden';
        this._v.video       = 'hidden';
        this._v.library     = 'hidden';
        this._v.libraryPrev = 'hidden';
        this._v.libraryNext = 'hidden';
        this._v.image       = 'hidden';
        this._v.topBar      = 'hidden';
        this._v.bottomBar   = 'hidden';
        this._v.brokeStatus = 'hidden';

        if( this._stream ) {
            this._v.stream = '';
			// Test for HLS and start video???

        } else if( this._video ) {
            this._v.video = '';

        } else if ( this._library ) {

            this.emptyLibrary();
            this._v.library     = '';
            this._v.libraryPrev = this._libraryOffset > 0 ? '' : 'hidden';
            this._v.libraryNext = this._libraryOffset + 9 < this._library.length ? '' : 'hidden';
            var i;
            var j;
            var last = Math.min( this._libraryOffset + 9,this._library.length )
            for( i = 0, j = this._libraryOffset; j < last; i++,j++ ) {
                var captured_text = this._library[j].created_at_pretty
                if ( this._library[j].object && this._library[j].object != '' ) {
                    captured_text += ' (' + this._library[j].object.toLowerCase() + ')'
                }
                this._s.libraryItem[i] = ( { 'hidden':'',
                                    'thumbnail':this._library[j].thumbnail,
                                    'captured_at':'captured: ' + captured_text } );
            }

        } else if ( this._image ) {
            const camera = this.getState(this._s.cameraId,'unknown')

            this._v.image       = '';
            this._v.brokeStatus = 'hidden';
            this._v.topBar      = this._v.topTitle || this._v.topStatus ? '':'hidden';
            this._v.bottomBar   = '';

            // image title
            this._s.imageFullDate = camera.attributes.image_source ? camera.attributes.image_source : '';
            this._s.imageDate = ''
            if( this._s.imageFullDate.startsWith('capture/') ) { 
                this._s.imageDate = this.getState(this._s.lastId,0).state;
                this._s.imageFullDate = 'automatically captured at ' + this._s.imageDate;
            } else if( this._s.imageFullDate.startsWith('snapshot/') ) { 
                this._s.imageDate = this._s.imageFullDate.substr(9);
                this._s.imageFullDate = 'snapshot captured at ' + this._s.imageDate;
            }


        } else {
            this._v.brokeStatus = ''
            this._v.topBar      = this._v.topTitle || this._v.topStatus ? '':'hidden';
            this._v.bottomBar   = '';
        }

		this._statuses = JSON.stringify( this._s )
		this._visibility = JSON.stringify( this._v )
    }

    updated(changedProperties) {
        changedProperties.forEach( (oldValue, propName) => {

            switch( propName ) {

				case '_image':
				case '_video':
				case '_stream':
				case '_library':
				case '_libraryOffset':
                    this.updateMedia();
                    break;
            }

            // Start video if streaming is turning on.
			// TODO - Fix this!!!
            if ( propName == '_stream' && oldValue == null ) {
                if ( this._stream ) {
                    var video = this.shadowRoot.getElementById( 'stream-' + this._s.cameraId )
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
        this.updateStatuses( old )
    }

    checkConfig() {

        if ( !this.isGood(this._hass) ) {
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
        this.checkConfig()
        this.resetStatuses()

        // camera and sensors
        this._s.cameraId  = 'camera.aarlo_' + camera;
        this._s.motionId  = 'binary_sensor.aarlo_motion_' + camera;
        this._s.soundId   = 'binary_sensor.aarlo_sound_' + camera;
        this._s.batteryId = 'sensor.aarlo_battery_level_' + camera;
        this._s.signalId  = 'sensor.aarlo_signal_strength_' + camera;
        this._s.captureId = 'sensor.aarlo_captured_today_' + camera;
        this._s.lastId    = 'sensor.aarlo_last_' + camera;

        // door definition
        this._s.doorId     = config.door ? config.door: null
        this._s.doorBellId = config.door_bell ? config.door_bell : null
        this._s.doorLockId = config.door_lock ? config.door_lock : null

        // door2 definition
        this._s.door2Id     = config.door2 ? config.door2: null
        this._s.door2BellId = config.door2_bell ? config.door2_bell : null
        this._s.door2LockId = config.door2_lock ? config.door2_lock : null

        // what are we showing?
        var show = this._config.show || [];

        // on click
        this._v.imageClick = config.image_click ? config.image_click : false

        // ui configuration
        this._v.topTitle  = config.top_title ? config.top_title : false
        this._v.topDate   = config.top_date ? config.top_date : false
        this._v.topStatus = config.top_status ? config.top_status : false

        this._v.play       = show.includes('play') ? '':'hidden';
        this._v.snapshot   = show.includes('snapshot') ? '':'hidden';

        this._v.battery    = show.includes('battery') || show.includes('battery_level') ? '':'hidden';
        this._v.signal     = show.includes('signal_strength') ? '':'hidden';
        this._v.motion     = show.includes('motion') ? '':'hidden';
        this._v.sound      = show.includes('sound') ? '':'hidden';
        this._v.captured   = show.includes('captured') || show.includes('captured_today') ? '':'hidden';
        this._v.image_date = show.includes('image_date') ? '':'hidden';

        this._v.door      = this._s.doorId ? '':'hidden'
        this._v.doorLock  = this._s.doorLockId ? '':'hidden'
        this._v.doorBell  = this._s.doorBellId ? '':'hidden'
        this._v.door2     = this._s.door2Id ? '':'hidden'
        this._v.door2Lock = this._s.door2LockId ? '':'hidden'
        this._v.door2Bell = this._s.door2BellId ? '':'hidden'
        this._v.doorStatus = ( this._v.door == '' || this._v.doorLock == '' ||
								this._v.doorBell == '' || this._v.door2 == '' ||
								this._v.door2Lock == '' || this._v.door2Bell == '' ) ? '':'hidden';

		// render changes
        this._statuses = JSON.stringify( this._s )
        this._visibility = JSON.stringify( this._v )
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
                entity_id: this._s.cameraId,
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
                entity_id: this._s.cameraId,
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
                entity_id: this._s.cameraId,
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
        const camera = this.getState(this._s.cameraId,'unknown')
        if ( camera.state == 'streaming' ) {
            this.stopStream( id )
        } else {
            this.showStream( id )
        }
    }

    async showVideoOrStream( id ) {
        // on click
        if ( this._v.imageClick && this._v.imageClick == 'play' ) {
            this.showStream(id)
        } else {
            this.showVideo(id)
        }
    }

    async showLibrary( id,base ) {
        this._video = null
        this._library = await this.readLibrary( id,99 )
        this._libraryOffset = base
    }

    async showLibraryVideo( id,index ) {
        index += this._libraryOffset
        if ( this._library && index < this._library.length ) {
            this._video = this._library[index].url;
            this._videoPoster = this._library[index].thumbnail;
        } else {
            this._video = null
            this._videoPoster = null
        }
    }

    setLibraryBase( base ) {
        this._libraryOffset = base
    }

    stopLibrary( ) {
        this._video = null
        this._library = null
    }

    async updateSnapshot( id ) {
        try {
            const { content_type: contentType, content } = await this._hass.callWS({
                type: "aarlo_snapshot_image",
                entity_id: this._s.cameraId,
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
                entity_id: this._s.cameraId,
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

