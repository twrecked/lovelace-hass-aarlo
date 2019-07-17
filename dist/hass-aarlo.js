
const LitElement = Object.getPrototypeOf(
        customElements.get("ha-panel-lovelace")
    );
const html = LitElement.prototype.html;

class AarloGlance extends LitElement {

	static get properties() {
		return {

			// State changes.
			_hass: Object,

			// Source that can change
			_image: String,
			_stream: String,
			_video: String,
			_library: String,
			_library_base: Number,

			// What are we currently doing?
			_streamHidden: String,
			_videoHidden: String,
			_libraryHidden: String,
			_libraryPrevHidden: String,
			_libraryNextHidden: String,
			_imageHidden: String,
			_topHidden: String,
			_bottomHidden: String,
			_doorStatusHidden: String,
			_brokeHidden: String,
			_signalHidden: String,
		}
	}

	constructor() {
		super();
		this._hass = null;
		this._config = null;
		this._image = null;
		this._stream = null;
		this._video = null;
		this._library = null;
		this._library_base = null;

		this._streamHidden      = 'hidden';
		this._videoHidden       = 'hidden';
		this._libraryHidden     = 'hidden';
		this._libraryPrevHidden = 'hidden';
		this._libraryNextHidden = 'hidden';
		this._imageHidden       = 'hidden';
		this._topHidden         = 'hidden';
		this._bottomHidden      = 'hidden';
		this._doorStatusHidden  = 'hidden';
		this._brokeHidden       = 'hidden';

		this._batteryHidden  = 'hidden';
		this._signalHidden   = 'hidden';
		this._motionHidden   = 'hidden';
		this._soundHidden    = 'hidden';
		this._capturedHidden = 'hidden';
		this._playHidden     = 'hidden';
		this._snapshotHidden = 'hidden';
		this._dateHidden     = 'hidden';

		this._doorHidden      = 'hidden';
		this._doorLockHidden  = 'hidden';
		this._doorBellHidden  = 'hidden';
		this._door2Hidden     = 'hidden';
		this._door2LockHidden = 'hidden';
		this._door2BellHidden = 'hidden';

		this._cameraName = 'unknown';
		this._cameraState = 'unknown';

		// blank library
		this.emptyLibrary();
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

		//type="application/x-mpegURL"
		//type="video/mp4"
		var img = html`
		    ${AarloGlance.innerStyleTemplate}
			<div id="aarlo-wrapper" class="base-16x9">
			    <video class="${this._streamHidden} video-16x9"
                    id="stream-${this._cameraId}"
                    poster="${this._stream_poster}"
                    autoplay playsinline controls
                    onended="${(e) => { this.stopStream(this._cameraId); }}"
                    on-tap="${(e) => { this.stopStream(this._cameraId); }}"
                    @click="${(e) => { this.stopStream(this._cameraId); }}">
                        Your browser does not support the video tag.
				</video>
                <video class="${this._videoHidden} video-16x9"
                    src="${this._video}" type="${this._video_type}"
                    poster="${this._video_poster}"
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
				<div class="box-status ${this._topDate?'':'hidden'} ${this._dateHidden}" title="${this._imageFullDate}">
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
					<ha-icon @click="${(e) => { this.moreInfo(this._motionId); }}" class="${this._motionOn} ${this._motionHidden}" icon="mdi:run-fast" title="${this._motionText}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._soundId); }}" class="${this._soundOn} ${this._soundHidden}" icon="mdi:ear-hearing" title="${this._soundText}"></ha-icon>
					<ha-icon @click="${(e) => { this.showLibrary(this._cameraId,0); }}" class="${this._capturedOn} ${this._capturedHidden}" icon="${this._capturedIcon}" title="${this._capturedText}"></ha-icon>
					<ha-icon @click="${(e) => { this.showOrStopStream(this._cameraId); }}" class="${this._playOn} ${this._playHidden}" icon="${this._playIcon}" title="${this._playText}"></ha-icon>
					<ha-icon @click="${(e) => { this.updateSnapshot(this._cameraId); }}" class="${this._snapshotOn} ${this._snapshotHidden}" icon="${this._snapshotIcon}" title="${this._snapshotText}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._batteryId); }}" class="${this._batteryState} ${this._batteryHidden}" icon="mdi:${this._batteryIcon}" title="${this._batteryText}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._signalId); }}" class="state-update ${this._signalHidden}" icon="${this._signalIcon}" title="${this._signal_text}"></ha-icon>
				</div>
				<div class="box-title ${this._topDate?'hidden':''} ${this._dateHidden}" title="${this._imageFullDate}">
					${this._imageDate}
				</div>
				<div class="box-status ${this._doorStatusHidden}">
					<ha-icon @click="${(e) => { this.moreInfo(this._doorId); }}" class="${this._doorOn} ${this._doorHidden}" icon="${this._doorIcon}" title="${this._doorText}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._doorBellId); }}" class="${this._doorBellOn} ${this._doorBellHidden}" icon="${this._doorBellIcon}" title="${this._doorBellText}"></ha-icon>
					<ha-icon @click="${(e) => { this.toggleLock(this._doorLockId); }}" class="${this._doorLockOn} ${this._doorLockHidden}" icon="${this._doorLockIcon}" title="${this._doorLockText}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._door2Id); }}" class="${this._door2On} ${this._door2Hidden}" icon="${this._door2Icon}" title="${this._door2Text}"></ha-icon>
					<ha-icon @click="${(e) => { this.moreInfo(this._door2BellId); }}" class="${this._door2BellOn} ${this._door2BellHidden}" icon="${this._door2BellIcon}" title="${this._door2BellText}"></ha-icon>
					<ha-icon @click="${(e) => { this.toggleLock(this._door2LockId); }}" class="${this._door2LockOn} ${this._door2LockHidden}" icon="${this._door2LockIcon}" title="${this._door2LockText}"></ha-icon>
				</div>
				<div class="box-status ${this._topStatus?'hidden':''}">
					${this._cameraState}
				</div>
			</div>
			<div class="box box-bottom-small ${this._libraryHidden}">
				<div >
					<ha-icon @click="${(e) => { this.setLibraryBase(this._library_base - 9); }}" class="${this._libraryPrevHidden} state-on" icon="mdi:chevron-left" title="previous"></ha-icon>
				</div>
				<div >
					<ha-icon @click="${(e) => { this.stopLibrary(); }}" class="state-on" icon="mdi:close" title="close library"></ha-icon>
				</div>
				<div >
					<ha-icon @click="${(e) => { this.setLibraryBase(this._library_base + 9); }}" class="${this._libraryNextHidden} state-on" icon="mdi:chevron-right" title="next"></ha-icon>
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

	is_good( obj ) {
		return obj == null || obj === undefined ? false : true;
	}

    safe_state( _hass,_id,def='' ) {
        return _id in _hass.states ? _hass.states[_id] : { 'state':def,'attributes':{ 'friendly_name':'unknown' } };
    }

	emptyLibrary() {
		// empty the current library
		this._libraryItem = [ ]
		while( this._libraryItem.length < 9 ) {
			this._libraryItem.push( { 'hidden':'hidden','thumbnail':'/static/images/image-broken.svg','captured_at':'' } )
		}
	}

	updateFromConfig() {

        // what are we showing?
        var show = this._config.show || [];

        this._playHidden     = show.includes('play') ? '' : 'hidden';
        this._snapshotHidden = show.includes('snapshot') ? '' : 'hidden';
        this._batteryHidden  = show.includes('battery') || show.includes('battery_level') ? '' : 'hidden';
        this._signalHidden   = show.includes('signal_strength') ? '' : 'hidden';
        this._motionHidden   = show.includes('motion') ? '' : 'hidden';
        this._soundHidden    = show.includes('sound') ? '' : 'hidden';
        this._capturedHidden = show.includes('captured') || show.includes('captured_today') ? '' : 'hidden';
        this._dateHidden     = show.includes('image_date') ? '' : 'hidden';

        this._doorHidden      = this._doorId === undefined ? 'hidden':''
        this._doorLockHidden  = this._doorLockId === undefined ? 'hidden':''
        this._doorBellHidden  = this._doorBellId === undefined ? 'hidden':''
        this._door2Hidden     = this._door2Id === undefined ? 'hidden':''
        this._door2LockHidden = this._door2LockId === undefined ? 'hidden':''
        this._door2BellHidden = this._door2BellId === undefined ? 'hidden':''

		this._playOn   = 'not-used'
		this._playText = 'not-used'
		this._playIcon = 'mdi:camera'

		this._snapshotOn   = 'not-used'
		this._snapshotText = 'not-used'
		this._snapshotIcon = 'mdi:camera'

		// Set the hidden values.
		this._batteryText  = 'not-used';
		this._batteryIcon  = 'not-used';
		this._batteryState = 'state-update';

		this._signal_text = 'not-used';
		this._signalIcon  = 'mdi:wifi-strength-4';

		this._motionOn   = 'not-used';
		this._motionText = 'not-used';

		this._soundOn    = 'not-used'
		this._soundText  = 'not-used'

		this._capturedText = 'not-used';
		this._capturedOn   = ''
		this._capturedIcon = 'mdi:file-video'

		this._doorOn    = 'not-used'
		this._doorText  = 'not-used'
		this._doorIcon  = 'not-used'
		this._door2On   = 'not-used'
		this._door2Text = 'not-used'
		this._door2Icon = 'not-used'

		this._doorLockOn    = 'not-used'
		this._doorLockText  = 'not-used'
		this._doorLockIcon  = 'not-used'
		this._door2LockOn    = 'not-used'
		this._door2LockText  = 'not-used'
		this._door2LockIcon  = 'not-used'

		this._doorBellOn    = 'not-used'
		this._doorBellText  = 'not-used'
		this._doorBellIcon  = 'not-used'
		this._door2BellOn    = 'not-used'
		this._door2BellText  = 'not-used'
		this._door2BellIcon  = 'not-used'
	}

	updateFromHass( oldValue ) {

		// nothing?
		if ( !this.is_good( this._hass ) ) {
			return;
		}

		// CAMERA
		const camera = this.safe_state(this._hass,this._cameraId,'unknown')

		// Initial setting? Just get an image.
		if ( !this.is_good( oldValue ) ) {
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
        if( this._playHidden == '' ) {
            this._playOn = 'state-on';
            if ( camera.state != 'streaming' ) {
				this._playText = 'click to live-stream'
				this._playIcon = 'mdi:play'
			} else {
                this._playText = 'click to stop stream'
                this._playIcon = 'mdi:stop'
            }
        }

        if( this._snapshotHidden == '' ) {
            this._snapshotOn    = '';
            this._snapshotText  = 'click to update image'
            this._snapshotIcon  = 'mdi:camera'
        }

		// SENSORS
        if( this._batteryHidden == '' ) {
            if ( camera.attributes.wired ) {
                this._batteryText  = 'Plugged In';
                this._batteryIcon  = 'power-plug';
                this._batteryState = 'state-update';
            } else {
                var battery         = this.safe_state(this._hass,this._batteryId,0);
                var batteryPrefix   = camera.attributes.charging ? 'battery-charging' : 'battery'
                this._batteryText   = 'Battery Strength: ' + battery.state +'%';
                this._batteryIcon   = batteryPrefix + ( battery.state < 10 ? '-outline' :
													( battery.state > 90 ? '' : '-' + Math.round(battery.state/10) + '0' ) );
                this._batteryState  = battery.state < 25 ? 'state-warn' : ( battery.state < 15 ? 'state-error' : 'state-update' );
            }
        }

        if( this._signalHidden == '' ) {
            var signal        = this.safe_state(this._hass,this._signalId,0);
            this._signal_text = 'Signal Strength: ' + signal.state;
            this._signalIcon  = signal.state == 0 ? 'mdi:wifi-outline' : 'mdi:wifi-strength-' + signal.state;
        }

        if( this._motionHidden == '' ) {
            this._motionOn   = this.safe_state(this._hass,this._motionId,'off').state == 'on' ? 'state-on' : '';
            this._motionText = 'Motion: ' + (this._motionOn != '' ? 'detected' : 'clear');
        }

        if( this._soundHidden == '' ) {
            this._soundOn    = this.safe_state(this._hass,this._soundId,'off').state == 'on' ? 'state-on' : '';
            this._soundText  = 'Sound: ' + (this._soundOn != '' ? 'detected' : 'clear');
        }

        if( this._capturedHidden == '' ) {
            var captured       = this.safe_state(this._hass,this._captureId,0).state;
            var last           = this.safe_state(this._hass,this._lastId,0).state;
            this._capturedText = 'Captured: ' + ( captured == 0 ? 'nothing today' : captured + ' clips today, last at ' + last )
            this._capturedIcon = this._video ? 'mdi:stop' : 'mdi:file-video'
            this._capturedOn   = captured != 0 ? 'state-update' : ''
        }

        if( this._doorHidden == '' ) {
            var doorState          = this.safe_state(this._hass,this._doorId,'off');
            this._doorOn           = doorState.state == 'on' ? 'state-on' : '';
            this._doorText         = doorState.attributes.friendly_name + ': ' + (this._doorOn == '' ? 'closed' : 'open');
            this._doorIcon         = this._doorOn == '' ? 'mdi:door' : 'mdi:door-open';
            this._doorStatusHidden = '';
        }
        if( this._door2Hidden == '' ) {
            var door2State         = this.safe_state(this._hass,this._door2Id,'off');
            this._door2On          = door2State.state == 'on' ? 'state-on' : '';
            this._door2Text        = door2State.attributes.friendly_name + ': ' + (this._door2On == '' ? 'closed' : 'open');
            this._door2Icon        = this._door2On == '' ? 'mdi:door' : 'mdi:door-open';
            this._doorStatusHidden = '';
        }

        if( this._doorLockHidden == '' ) {
            var doorLockState      = this.safe_state(this._hass,this._doorLockId,'locked');
            this._doorLockOn       = doorLockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._doorLockText     = doorLockState.attributes.friendly_name + ': ' + (this._doorLockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._doorLockIcon     = this._doorLockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
            this._doorStatusHidden = '';
        }
        if( this._door2LockHidden == '' ) {
            var door2LockState     = this.safe_state(this._hass,this._door2LockId,'locked');
            this._door2LockOn      = door2LockState.state == 'locked' ? 'state-on' : 'state-warn';
            this._door2LockText    = door2LockState.attributes.friendly_name + ': ' + (this._door2LockOn == 'state-on' ? 'locked (click to unlock)' : 'unlocked (click to lock)');
            this._door2LockIcon    = this._door2LockOn == 'state-on' ? 'mdi:lock' : 'mdi:lock-open';
            this._doorStatusHidden = '';
        }

        if( this._doorBellHidden == '' ) {
            var doorBellState    = this.safe_state(this._hass,this._doorBellId,'off');
            this._doorBellOn       = doorBellState.state == 'on' ? 'state-on' : '';
            this._doorBellText     = doorBellState.attributes.friendly_name + ': ' + (this._doorBellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._doorBellIcon     = 'mdi:doorbell-video';
            this._doorStatusHidden = '';
        }
        if( this._door2BellHidden == '' ) {
            var door2BellState    = this.safe_state(this._hass,this._door2BellId,'off');
            this._door2BellOn       = door2BellState.state == 'on' ? 'state-on' : '';
            this._door2BellText     = door2BellState.attributes.friendly_name + ': ' + (this._door2BellOn == 'state-on' ? 'ding ding!' : 'idle');
            this._door2BellIcon     = 'mdi:doorbell-video';
            this._doorStatusHidden = '';
        }
	}

	updateFromSource() {

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
            this._libraryPrevHidden = this._library_base > 0 ? '' : 'hidden';
            this._libraryNextHidden = this._library_base + 9 < this._library.length ? '' : 'hidden';
            var i;
            var j;
			var total = Math.min(9,this._library.length - this._library_base)
            for( i = 0, j = this._library_base; j < this._library.length; i++,j++ ) {
                var captured_text = this._library[j].created_at_pretty
                if ( this._library[j].object && this._library[j].object != '' ) {
                    captured_text += ' (' + this._library[j].object.toLowerCase() + ')'
                }
                this._libraryItem[i] = ( { 'hidden':'',
									'thumbnail':this._library[j].thumbnail,
									'captured_at':'captured: ' + captured_text } );
            }
			j = j + 1;

        } else if ( this._image ) {
			const camera = this.safe_state(this._hass,this._cameraId,'unknown')

            this._imageHidden   = '';
            this._brokeHidden   = 'hidden';
            this._topHidden     = this._topTitle || this._topStatus ? '':'hidden';
            this._bottomHidden  = '';

            // image title
            this._imageFullDate = camera.attributes.image_source ? camera.attributes.image_source : '';
            this._imageDate = ''
            if( this._imageFullDate.startsWith('capture/') ) { 
                this._imageDate = this.safe_state(this._hass,this._lastId,0).state;
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
					this.updateFromHass( oldValue );
					break;

				case '_image':
				case '_video':
				case '_stream':
				case '_library':
				case '_library_base':
					this.updateFromSource();
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
        this._hass = hass
    }

	checkConfig() {

		if ( !this.is_good(this._hass) ) {
			return;
		}

		if ( this._hass.states[this._cameraId] == undefined ) {
			throw new Error( 'unknown camera' );
		}
		if ( this._door && this._hass.states[this._door] == undefined ) {
			throw new Error( 'unknown door' )
		}
		if ( this._doorBellId && this._hass.states[this._doorBellId] == undefined ) {
			throw new Error( 'unknown door bell' )
		}
		if ( this._doorLockId && this._hass.states[this._doorLockId] == undefined ) {
			throw new Error( 'unknown door lock' )
		}
		if ( this._door2 && this._hass.states[this._door2] == undefined ) {
			throw new Error( 'unknown door (#2)' )
		}
		if ( this._door2BellId && this._hass.states[this._door2BellId] == undefined ) {
			throw new Error( 'unknown door bell (#2)' )
		}
		if ( this._door2LockId && this._hass.states[this._door2LockId] == undefined ) {
			throw new Error( 'unknown door lock (#2)' )
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
        if ( camera === undefined ) {
            throw new Error( 'missing a camera definition' );
        }
        if( !config.show ) {
            throw new Error( 'missing show components' );
        }

		// camera definition
        this._config = config;
		this._cameraId  = 'camera.aarlo_' + camera;
		this._motionId  = 'binary_sensor.aarlo_motion_' + camera;
		this._soundId   = 'binary_sensor.aarlo_sound_' + camera;
		this._batteryId = 'sensor.aarlo_battery_level_' + camera;
		this._signalId  = 'sensor.aarlo_signal_strength_' + camera;
		this._captureId = 'sensor.aarlo_captured_today_' + camera;
		this._lastId    = 'sensor.aarlo_last_' + camera;

        // on click
        this._imageClick = config.image_click ? config.image_click : undefined

		// door definition
		this._doorId     = config.door ? config.door: undefined
		this._doorBellId = config.door_bell ? config.door_bell : undefined
		this._doorLockId = config.door_lock ? config.door_lock : undefined

		// door2 definition
		this._door2Id     = config.door2 ? config.door2: undefined
		this._door2BellId = config.door2_bell ? config.door2_bell : undefined
		this._door2LockId = config.door2_lock ? config.door2_lock : undefined

		// ui configuration
		this._topTitle  = config.top_title ? config.top_title : false
		this._topDate   = config.top_date ? config.top_date : false
		this._topStatus = config.top_status ? config.top_status : false

		this.checkConfig()
		this.updateFromConfig()
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
            this._video = video[0].url;
            this._video_poster = video[0].thumbnail;
            this._video_type   = "video/mp4"
        } else {
            this._video        = null
            this._video_poster = null
            this._video_type   = null
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
            this._stream = stream.url;
            this._stream_poster = this._image
            this._stream_type   = 'application/x-mpegURL'
        } else {
            this._stream = null
            this._stream_poster = null
            this._stream_type   = null
        }
    }

    async showOrStopStream( id ) {
        const camera = this.safe_state(this._hass,this._cameraId,'unknown')
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
        this._library_base = base
    }

    async showLibraryVideo( id,index ) {
        index += this._library_base
        if ( this._library && index < this._library.length ) {
            this._video = this._library[index].url;
            this._video_poster = this._library[index].thumbnail;
        } else {
            this._video = null
            this._video_poster = null
        }
    }

    setLibraryBase( base ) {
        this._library_base = base
    }

    stopLibrary( ) {
        this._video = null
        this._library = null
    }

    async updateSnapshot( id ) {
        //this._hass.callService( 'camera','aarlo_request_snapshot', { entity_id:id } )
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
        if ( this.safe_state(this._hass,id,'locked').state == 'locked' ) {
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

