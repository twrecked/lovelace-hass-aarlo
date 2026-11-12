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
        if (!this._keydownHandler) {
            this._keydownHandler = (e) => {
                if (e.key === 'Escape' && this.gs && this.gs.isPseudoFullScreen) {
                    this.exitPseudoFullScreen();
                }
            };
            window.addEventListener('keydown', this._keydownHandler);
        }
        if (!this._fullscreenChangeHandler) {
            this._fullscreenChangeHandler = () => {
                this._updateFullScreenButton();
                if (!this._isFullScreen()) {
                    this.exitPseudoFullScreen();
                } else {
                    this.showVideoControls(4);
                }
            };
            document.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
            document.addEventListener('webkitfullscreenchange', this._fullscreenChangeHandler);
        }
        const players = [this._element( "video-player" ), this._element( "modal-video-player" )];
        players.forEach((player) => {
            if (!player) return;
            player.addEventListener( 'ended', (_evt) => {
                this.videoEnded();
            });
            player.addEventListener( 'loadedmetadata', (evt) => {
                this.setUpSeekBar();
                this.startVideo( evt.target );
                this.showVideoControls(this._defaultControlsTimeout());
            });
        });

        const interactionTargets = [
            this._element("video-player"),
            this._element("modal-video-player"),
            this._element("aarlo-wrapper"),
            this._element("modal-video-wrapper"),
        ];
        interactionTargets.forEach((target) => {
            if (!target) return;
            target.addEventListener('click', (evt) => {
                this.handleVideoInteraction(evt);
            });
            target.addEventListener('touchend', (evt) => {
                this.handleVideoInteraction(evt);
            }, { passive: true });
            target.addEventListener('mousemove', (evt) => {
                this.videoMouseEvent(evt);
            });
        });

        const controlBars = [
            this._element("video-controls"),
            this._element("modal-video-controls"),
        ];
        controlBars.forEach((bar) => {
            if (!bar) return;
            ['pointerdown', 'touchstart', 'mousemove'].forEach((evType) => {
                bar.addEventListener(evType, () => {
                    this.showVideoControls(this._defaultControlsTimeout());
                }, { passive: true });
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

    _isFullScreen() {
        const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const isPseudoFs = !!(this.gs && this.gs.isPseudoFullScreen);
        return isNativeFs || isPseudoFs;
    },

    _updateFullScreenButton() {
        const isFs = this._isFullScreen();
        const fsTitle = isFs
            ? (this._i.video.exit_fullscreen || "exit full screen")
            : this._i.video.fullscreen;
        const fsIcon = isFs ? "mdi:fullscreen-exit" : "mdi:fullscreen";
        this._mset("video-full-screen", { title: fsTitle, icon: fsIcon });
    },

    updateRecordingView() {
        this._mset("video-stop",{title: this._i.video.stop, icon: "mdi:stop"});
        this._updateFullScreenButton();
    
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


    destroyWebRTCStream() {
        if (this.gs.webrtcUnsub) {
            try {
                this.gs.webrtcUnsub();
            } catch (e) {
                this._log(e);
            }
            this.gs.webrtcUnsub = null;
        }
        if (this.gs.pc) {
            try {
                this.gs.pc.close();
            } catch (e) {
                this._log(e);
            }
            this.gs.pc = null;
        }
        const video = this._melement('video-player');
        if (video && video.srcObject) {
            video.srcObject = null;
        }
    },

    isWebRTC(cc) {
        if (!cc) return false;
        if (cc.webrtcPlay) return true;
        if (cc.arloPlay || cc.haPlay) return false;
        const state = this._hass && this._hass.states && this._hass.states[cc.id];
        const attrs = (state && state.attributes) || {};
        return Boolean(attrs.sip_streaming || attrs.frontend_stream_type === "web_rtc");
    },

    async startWebRTCStream() {
        this._log(`Starting WebRTC stream for ${this.cc.id}`);
        try {
            const video = this._melement('video-player');
            if (video) {
                video.removeAttribute('src');
                video.muted = this.gs.isMuted;
            }

            const clientConfig = await this._hass.callWS({
                type: "camera/webrtc/get_client_config",
                entity_id: this.cc.id,
            });

            const pcConfig = (clientConfig && clientConfig.configuration) || {};
            const pc = new RTCPeerConnection(pcConfig);
            this.gs.pc = pc;

            pc.addTransceiver("audio", { direction: "recvonly" });
            pc.addTransceiver("video", { direction: "recvonly" });

            pc.ontrack = (event) => {
                const v = this._melement('video-player');
                if (v && event.streams && event.streams[0]) {
                    v.srcObject = event.streams[0];
                    this.startVideo(v);
                }
            };

            const candidatesQueue = [];
            let sessionId = null;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candData = event.candidate.toJSON ? event.candidate.toJSON() : event.candidate;
                    if (sessionId) {
                        this._hass.callWS({
                            type: "camera/webrtc/candidate",
                            entity_id: this.cc.id,
                            session_id: sessionId,
                            candidate: candData,
                        }).catch(() => {});
                    } else {
                        candidatesQueue.push(candData);
                    }
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Brief wait (50ms) to allow initial host candidates to gather into localDescription
            await new Promise((r) => setTimeout(r, 50));

            const offerSdp = (pc.localDescription && pc.localDescription.sdp) || offer.sdp;

            const unsub = await this._hass.connection.subscribeMessage(
                async (msg) => {
                    if (msg.type === "session") {
                        sessionId = msg.session_id;
                        while (candidatesQueue.length > 0) {
                            const c = candidatesQueue.shift();
                            this._hass.callWS({
                                type: "camera/webrtc/candidate",
                                entity_id: this.cc.id,
                                session_id: sessionId,
                                candidate: c,
                            }).catch(() => {});
                        }
                    } else if (msg.type === "answer") {
                        if (pc.signalingState !== "closed") {
                            await pc.setRemoteDescription({
                                type: "answer",
                                sdp: msg.answer,
                            });
                        }
                    } else if (msg.type === "error") {
                        this._log(`WebRTC error: ${msg.message}`);
                        this.stopStream();
                    }
                },
                {
                    type: "camera/webrtc/offer",
                    entity_id: this.cc.id,
                    offer: offerSdp,
                }
            );
            this.gs.webrtcUnsub = unsub;

            this.gs.viewer = this.getViewType(this.cc);
            this.gs.stream = "webrtc";
            this.gs.poster = this.cs.image;
            this.showStream();
        } catch (err) {
            this._log(`startWebRTCStream failed: ${err}`);
            this.destroyWebRTCStream();
            this.gs.stream = null;
        }
    },

    destroyHLSStream() {
        if(this.gs.dash) {
            this.gs.dash.reset();
            this.gs.dash = null;
        }
    },

    setupStreamPlayer() {
        if (this.gs.stream === "webrtc") {
            // WebRTC media attached to video.srcObject ontrack
        } else if (this.gs.stream && this.gs.stream.includes('egressToken')) {
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
        this._updateFullScreenButton();
    
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

    playStream() {
        this.cs.autoPlayTimer = null
        if (this.gs.stream === null) {
            if (this.cc.autoPlay) {
                this.cs.autoPlay = this.cc.autoPlay
            }
            const video = this._melement('video-player')
            if (video) {
                video.muted = this.gs.isMuted
            }

            if (this.isWebRTC(this.cc)) {
                this.startWebRTCStream()
            } else {
                this.wsStartStream()
                    .then((stream) => {
                        this.gs.viewer = this.getViewType(this.cc)
                        this.gs.stream = stream.url
                        this.gs.poster = this.cs.image
                        this.showStream()
                    })
                    .catch((e) => {
                        this._log(e)
                    })
            }
        } else {
            this.showStream()
        }
    },

    stopStream() {
        this.exitAllFullScreen();
        if (this.gs.stream === "webrtc") {
            this._log(`Stopping WebRTC stream for ${this.cc.id}`);
        }
        this.resetView()
        const video = this._melement('video-player')
        if (video) {
            video.pause()
            if (video.srcObject) {
                video.srcObject = null
            }
        }
        this.cs.autoPlay = false
        this.gs.stream = null
        this.destroyWebRTCStream()
        this.destroyMPEGStream()
        this.destroyHLSStream()
        this.wsStopStream()
            .then()
            .catch((e) => {
                this._log(e)
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
        if (this.gs.recording === null) {
            index += this.ls.offset
            if (this.ls.recordings && index < this.ls.recordings.length) {
                this.destroyWebRTCStream()
                this.destroyMPEGStream()
                this.destroyHLSStream()
                const video = this._melement('video-player')
                if (video) {
                    video.muted = this.gs.isMuted
                    video.srcObject = null
                }
                this.gs.viewer = this.getViewType(this.lc)
                this.gs.recording = this.ls.recordings[index].url
                this.gs.poster = this.ls.recordings[index].thumbnail
                this.showRecording()
            }
        }
    },

    playLatestRecording() {
        this.destroyWebRTCStream()
        this.destroyMPEGStream()
        this.destroyHLSStream()
        const video = this._melement('video-player')
        if (video) {
            video.muted = this.gs.isMuted
            video.srcObject = null
        }
        this.gs.viewer = this.getViewType(this.cc)
        this.gs.recording = this.cs.lastRecording
        this.gs.poster = this.cs.image
        this.showRecording()
    },

    stopRecording() {
        this.exitAllFullScreen();
        if (this.gs.recording) {
            const video = this._melement('video-player')
            if (video) {
                this.pauseVideo(video)
                video.removeAttribute('src')
            }
            this.hideModal()
            this.resetView()
            this.gs.recording = null
        }
    },

    videoEnded() {
        this.exitAllFullScreen();
        this.stopRecording()
        this.stopStream()
    },

    _defaultControlsTimeout() {
        return (this.gc.isMobile || this.gc.isApple || this._isFullScreen()) ? 4 : 2;
    },

    handleVideoInteraction(evt) {
        if (this.gs.stream === null && this.gs.recording === null) {
            return;
        }

        const controls = this._melement('video-controls');
        if (controls && controls.contains(evt.target)) {
            return;
        }

        const now = Date.now();
        if (this._lastInteractionTime && (now - this._lastInteractionTime < 350)) {
            return;
        }
        this._lastInteractionTime = now;

        this.videoClicked(evt);
    },

    videoClicked(evt) {
        if ( this._misHidden("video-controls") ) {
            this.showVideoControls(this._defaultControlsTimeout());
        } else {
            this.hideVideoControls();
        }
    },

    videoMouseEvent(evt) {
        if (this.gs.stream === null && this.gs.recording === null) {
            return;
        }
        if (evt && evt.pointerType === 'touch') {
            return;
        }
        this.showVideoControls(this._defaultControlsTimeout());
    },

    controlStop() {
        this.exitAllFullScreen();
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
        // If currently in native fullscreen, exit it
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            return;
        }

        // If currently in pseudo-fullscreen, exit it
        if (this.gs && this.gs.isPseudoFullScreen) {
            this.exitPseudoFullScreen();
            return;
        }

        // On iOS: use pseudo-fullscreen (iOS WebKit blocks Fullscreen API on iPhone)
        if (this.gc.isApple) {
            this.togglePseudoFullScreen();
            return;
        }

        // On desktop: request native fullscreen on the card container
        const targetElement = this.gs.viewer === 'modal'
            ? this._element('modal-viewer')
            : this.querySelector('ha-card');

        if (targetElement && targetElement.requestFullscreen) {
            targetElement.requestFullscreen().catch((err) => {
                this._log(`Native requestFullscreen failed, falling back to pseudo-fullscreen: ${err}`);
                this.togglePseudoFullScreen();
            });
        } else if (targetElement && targetElement.webkitRequestFullscreen) {
            try {
                targetElement.webkitRequestFullscreen();
            } catch (err) {
                this.togglePseudoFullScreen();
            }
        } else {
            this.togglePseudoFullScreen();
        }
    },

    togglePseudoFullScreen() {
        if (!this.gs) {
            this.gs = {};
        }
        this.gs.isPseudoFullScreen = !this.gs.isPseudoFullScreen;
        const isFs = this.gs.isPseudoFullScreen;

        const haCard = this.querySelector('ha-card');
        const modalViewer = this._element('modal-viewer');

        if (this.gs.viewer === 'modal') {
            if (modalViewer) {
                modalViewer.classList.toggle('aarlo-pseudo-fullscreen', isFs);
            }
        } else {
            if (haCard) {
                haCard.classList.toggle('aarlo-pseudo-fullscreen', isFs);
            }
        }

        try {
            document.body.style.overflow = isFs ? 'hidden' : '';
        } catch (e) {}

        this._updateFullScreenButton();
        if (isFs) {
            this.showVideoControls(4);
        }
    },

    exitPseudoFullScreen() {
        if (!this.gs || !this.gs.isPseudoFullScreen) return;
        this.gs.isPseudoFullScreen = false;

        const haCard = this.querySelector('ha-card');
        if (haCard) {
            haCard.classList.remove('aarlo-pseudo-fullscreen');
        }
        const modalViewer = this._element('modal-viewer');
        if (modalViewer) {
            modalViewer.classList.remove('aarlo-pseudo-fullscreen');
        }

        try {
            document.body.style.overflow = '';
        } catch (e) {}

        this._updateFullScreenButton();
    },

    exitAllFullScreen() {
        this.exitPseudoFullScreen();
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            try {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } catch (e) {}
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

    hideVideoControlsLater(seconds = 0) {
        this.hideVideoControlsCancel();
        const timeout = seconds || this._defaultControlsTimeout();
        this.cs.controlTimeout = setTimeout(() => {
            this.cs.controlTimeout = null;
            this.hideVideoControls();
        }, timeout * 1000);
    },

    hideVideoControlsCancel() {
        if ( this.cs.controlTimeout !== null ) {
            clearTimeout( this.cs.controlTimeout );
            this.cs.controlTimeout = null
        }
    },

};
