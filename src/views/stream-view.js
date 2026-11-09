import { _array, _includes, _real, _value, _tsi } from "../helpers.js";

export const StreamViewMixin = {
    buildVideoIconDiv(items, prefix) {
        let div = document.createElement("div");
        items.forEach((item) => {
            div.appendChild(this.buildIcon(item, prefix, (evt) => {
                this.videoIconClicked(evt)
            }));
        });
        return div;
    },

    buildVideoSeekDiv(prefix) {
        let slider = document.createElement('input');
        slider.type = 'range';
        slider.min = "1";
        slider.max = "100";
        slider.value = "0";
        slider.classList.add('slider')
        slider.id = this._id(`${prefix}video-seek`);
    
        let div = document.createElement("div")
        div.appendChild(slider)
        return div
    },

    buildVideoControl(element, prefix) {
        element.innerHTML = ''
        element.appendChild(this.buildVideoIconDiv(["video-door-lock", "video-door2-lock",
                        "video-light-on", "video-light2-on", "video-toggle-sound", "video-play-pause", "video-stop"],
                        prefix));
        element.appendChild(this.buildVideoSeekDiv(prefix));
        element.appendChild(this.buildVideoIconDiv(["video-full-screen"], prefix));
    },

    videoIconClicked(evt) {
        const id = evt.target.id;
    
        if (id.includes("video-play-pause")) {
            this.controlPlayPause();
        } else if (id.includes("video-toggle-sound")) {
            this.controlToggleSound();
        } else if (id.includes("video-stop")) {
            this.controlStop();
        } else if (id.includes("video-door-lock")) {
            this.toggleLock(this.cc.doorLockId);
        } else if (id.includes("video-door2-lock")) {
            this.toggleLock(this.cc.door2LockId);
        } else if (id.includes("video-light-on")) {
            this.toggleLight(this.cc.lightId);
        } else if (id.includes("video-light2-on")) {
            this.toggleLight(this.cc.light2Id);
        } else if (id.includes("video-full-screen")) {
            this.controlFullScreen();
        }
    },

    setupVideoView() {
        // this.buildVideoControls()
        this.buildVideoControl(this._element('video-controls'), "")
        this.buildVideoControl(this._element('modal-video-controls'), "modal-")
    },

    setupVideoHandlers() {
        [this._element( "video-player" ), this._element( "modal-video-player" )]
            .forEach((player) => {
                player.addEventListener( 'ended', (_evt) => {
                    this.videoEnded()
                });
                player.addEventListener( 'click', (_evt) => {
                    this.videoClicked()
                });
                player.addEventListener( 'mouseover', (_evt) => {
                    this.videoMouseEvent()
                });
                player.addEventListener( 'mousemove', (_evt) => {
                    this.videoMouseEvent()
                });
                player.addEventListener( 'loadedmetadata', (evt) => {
                    this.setUpSeekBar();
                    this.startVideo( evt.target )
                    this.showVideoControls(4);
                });
            });
    },

    setupRecordingPlayer() {
        this._mset( 'video-player',{src: this.gs.recording, poster: this.gs.poster} )
        this._mshow("video-seek")
        this._mshow("video-play-pause")
        this._mhide("video-door-lock")
        this._mhide("video-door2-lock")
        this._mhide("video-light-on")
        this._mhide("video-light2-on")
    },

    updateRecordingView() {
        this._mset("video-stop",{title: this._i.video.stop, icon: "mdi:stop"});
        this._mset("video-full-screen",{title: this._i.video.fullscreen, icon: "mdi:fullscreen"});
    
        let video = this._melement( 'video-player' )
        if( video.paused ) {
            this._mset("video-play-pause", {title: this._i.video.play, icon:"mdi:play"})
        } else {
            this._mset("video-play-pause", {title: this._i.video.pause, icon:"mdi:pause"})
        }
        if( video.muted ) {
            this._mset("video-toggle-sound", {icon:"mdi:volume-off"})
        } else {
            this._mset("video-toggle-sound", {icon:"mdi:volume-high"})
        }
    },

    showRecordingView() {
        this.hideStreamView()
        this._mshow("video-player")
        this._mshow("video-controls")
        this.showModal()
        this.hideLibraryView()
        this.hideImageView()
    },

    hideRecordingView() {
        this._mhide("video-player")
        this._mhide("video-controls")
        this.hideModal()
    },

    showRecording() {
        this.setupRecordingPlayer()
        this.updateRecordingView()
        this.showRecordingView()
    },

    setMPEGStreamElementData() {
        const video = this._melement('video-player')
        const et = this._findEgressToken( this.gs.stream );
    
        this.gs.dash = dashjs.MediaPlayer().create();
        this.gs.dash.extend("RequestModifier", () => {
            return {
                modifyRequestHeader: function (xhr) {
                    xhr.setRequestHeader('Egress-Token',et);
                    return xhr;
                }
            };
        }, true);
        this.gs.dash.initialize( video, this.gs.stream, true )
    },

    destroyMPEGStream() {
        if(this.gs.hls) {
            this.gs.hls.stopLoad();
            this.gs.hls.destroy();
            this.gs.hls = null
        }
    },

    setHLSStreamElementData() {
        const video = this._melement('video-player')
        if (!video) return;
    
        if (window.Hls && Hls.isSupported()) {
            this.gs.hls = new Hls();
            this.gs.hls.attachMedia(video);
            this.gs.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                this.gs.hls.loadSource(this.gs.stream);
                this.gs.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.startVideo(video);
                });
            })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = this.gs.stream;
            video.addEventListener('loadedmetadata', () => {
                this.startVideo(video);
            }, { once: true });
        }
    },

    destroyHLSStream() {
        if(this.gs.dash) {
            this.gs.dash.reset();
            this.gs.dash = null;
        }
    },

    setupStreamPlayer() {
        if ( this.gs.stream.includes('egressToken') ) {
            this.setMPEGStreamElementData()
        } else {
            this.setHLSStreamElementData()
        }
    
        this._mhide("video-play-pause")
        this._mhide("video-seek")
        this._mshow("video-door-lock", this.cc.doorLockId !== null);
        this._mshow("video-door2-lock", this.cc.door2LockId !== null);
        this._mshow("video-light-on", this.cc.lightId !== null);
        this._mshow("video-light2-on", this.cc.light2Id !== null);
        this.showVideoControls(4);
    
        this._mset('video-player', {poster: this.gs.poster})
    },

    updateStreamView() {
        this._mset("video-stop",{title: this._i.video.stop, icon: "mdi:stop"});
        this._mset("video-full-screen",{title: this._i.video.fullscreen, icon: "mdi:fullscreen"});
    
        // Autostart?
        if ( this.gs.stream === null ) {
            if( this.cs.autoPlay && this.cs.autoPlayTimer === null ) {
                this.cs.autoPlayTimer = setTimeout( () => {
                    this.playStream()
                },5 * 1000 )
            }
            return
        }
    
        this._mset("video-door-lock", this.cs.details.lock);
        this._mset("video-door2-lock", this.cs.details.lock2);
        this._mset("video-light-on", this.cs.details.light);
        this._mset("video-light2-on", this.cs.details.light2);
    
        if( this._melement( 'video-player' ).muted ) {
            this._mset("video-toggle-sound", {icon:"mdi:volume-off"})
        } else {
            this._mset("video-toggle-sound", {icon:"mdi:volume-high"})
        }
    },

    showStreamView() {
        this.hideRecordingView()
        this._mshow("video-player")
        this._mshow("video-controls")
        this.showModal()
        this.hideLibraryView()
        this.hideImageView()
    },

    hideStreamView() {
        this._mhide("video-player")
        this._mhide("video-controls")
        this.hideModal()
    },

    showStream() {
        this.setupStreamPlayer()
        this.updateStreamView()
        this.showStreamView()
    },

    updateVideoOrStreamView() {
        if( this.gs.stream !== null ) {
            this.updateStreamView()
        } else if( this.gs.recording !== null ) {
            this.updateRecordingView()
        }
    },

    pauseVideo( video ) {
        video.pause()
        this.updateVideoOrStreamView()
    },

    startVideo( video ) {
        let promise = video.play()
        if( promise !== undefined ) {
            promise.then( () => {
                this.updateVideoOrStreamView()
            }).catch( () => {
                this.updateVideoOrStreamView()
            })
        } else {
            this.updateVideoOrStreamView()
        }
    },

    getViewType( c ) {
        if( c.smartPlayer ) {
            return this.gc.isMobile ? "" : "modal"
        } else if( c.modalPlayer ) {
            return "modal"
        } 
        return ""
    },

    playStream( ) {
        this.cs.autoPlayTimer = null
        if ( this.gs.stream === null ) {
            if( this.cc.autoPlay ) {
                this.cs.autoPlay = this.cc.autoPlay
            }
            this._melement('video-player').muted = this.gs.isMuted
            this.wsStartStream()
                .then( (stream) => {
                    this.gs.viewer = this.getViewType( this.cc )
                    this.gs.stream = stream.url;
                    this.gs.poster = this.cs.image;
                    this.showStream()
                })
                .catch( (e) => {
                    this._log( e )
                })
        } else {
            this.showStream()
        }
    },

    stopStream() {
        this.resetView()
        this._melement('video-player' ).pause()
        this.cs.autoPlay = false
        this.gs.stream = null;
        this.destroyMPEGStream()
        this.destroyHLSStream()
        this.wsStopStream()
            .then()
            .catch( (e) => {
                this._log( e )
            })
    },

    showOrStopStream() {
        if (this.gs.stream !== null) {
            this.stopStream()
        } else {
            this.gs.viewer = this.getViewType( this.cc )
            this.playStream()
        }
    },

    playRecording(index) {
        if ( this.gs.recording === null ) {
            index += this.ls.offset;
            if (this.ls.recordings && index < this.ls.recordings.length) {
                this._melement( 'video-player' ).muted = this.gs.isMuted
                this.gs.viewer    = this.getViewType( this.lc )
                this.gs.recording = this.ls.recordings[index].url;
                this.gs.poster    = this.ls.recordings[index].thumbnail;
                this.showRecording()
            } 
        }
    },

    playLatestRecording() {
        this._melement( 'video-player' ).muted = this.gs.isMuted
        this.gs.viewer    = this.getViewType( this.cc )
        this.gs.recording = this.cs.lastRecording
        this.gs.poster    = this.cs.image
        this.showRecording()
    },

    stopRecording() {
        if ( this.gs.recording ) {
            this.pauseVideo(this._melement( 'video-player' ))
            this.hideModal()
            this.resetView()
            this.gs.recording = null
        }
    },

    videoEnded() {
        this.stopRecording()
        this.stopStream()
    },

    videoClicked() {
        if ( this._misHidden("video-controls") ) {
            this.showVideoControls(2)
        } else {
            this.hideVideoControls();
        }
    },

    videoMouseEvent() {
        this.showVideoControls(2)
    },

    controlStop() {
        this.stopRecording()
        this.stopStream()
    },

    controlPlayPause( ) {
        let video = this._melement( 'video-player' )
        if( video.paused ) {
            this.startVideo( video )
        } else {
            this.pauseVideo( video )
        }
    },

    controlToggleSound( ) {
        let video = this._melement('video-player')
        video.muted = !video.muted;
        this.gs.isMuted = video.muted
        this.updateVideoOrStreamView()
    },

    controlFullScreen() {
        const video = this._melement('video-player')
        if (!video) return;
        if (video.requestFullscreen) {
            video.requestFullscreen().catch(err => this._log(`Fullscreen error: ${err}`));
        } else if (video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        }
    },

    setUpSeekBar() {
        let video = this._melement('video-player')
        let seekBar = this._melement('video-seek')
    
        video.addEventListener( "timeupdate", () => {
            seekBar.value = (100 / video.duration) * video.currentTime;
        });
        seekBar.addEventListener( "change", () => {
            video.currentTime = video.duration * (seekBar.value / 100);
        });
        seekBar.addEventListener( "mousedown", () => {
            this.showVideoControls(0);
            this.gs.streamPaused = video.paused
            video.pause();
        });
        seekBar.addEventListener( "mouseup", () => {
            if (!this.gs.streamPaused) {
                video.play().catch(err => this._log(`Seek play error: ${err}`));
            }
            this.hideVideoControlsLater()
        });
    },

    showVideoControls(seconds = 0) {
        this._mshow("video-controls")
        this._melement("video-player").style.cursor = ""
        this.hideVideoControlsCancel();
        if (seconds !== 0) {
            this.hideVideoControlsLater(seconds);
        }
    },

    hideVideoControls() {
        this.hideVideoControlsCancel();
        this._mhide("video-controls")
        this._melement("video-player").style.cursor = "none"
    },

    hideVideoControlsLater(seconds = 2) {
        this.hideVideoControlsCancel();
        this.cs.controlTimeout = setTimeout(() => {
            this.cs.controlTimeout = null;
            this.hideVideoControls()
        }, seconds * 1000);
    },

    hideVideoControlsCancel() {
        if ( this.cs.controlTimeout !== null ) {
            clearTimeout( this.cs.controlTimeout );
            this.cs.controlTimeout = null
        }
    },

};
