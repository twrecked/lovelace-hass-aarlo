import { _array, _includes, _real, _value, _tsi } from "../helpers.js";

export const ImageViewMixin = {
    buildImageRow(element, sections) {
        let text_items = ["name", "date", "status"]
        element.innerHTML = ''
        _array(sections).forEach((section, index, array) => {
            let div = document.createElement("div")
            _array(section).forEach((item) => {
                if (item === '') {
                    div.appendChild(this.buildGap())
                } else if (text_items.includes(item)) {
                    div.appendChild(this.buildText(item, "camera-"))
                } else {
                    div.appendChild(this.buildIcon(item, "camera-", (evt) => {
                        this.imageIconClicked(evt)
                    }))
                }
            })
    
            // Set div alignment
            if (index === 0) {
                div.classList.add(`box-align-left`)
            } else if (index === array.length - 1) {
                div.classList.add(`box-align-right`)
            }
            element.appendChild(div)
        })
    },

    imageIconClicked(evt) {
        const id = evt.target.id
        const modified = evt.ctrlKey || evt.shiftKey
    
        if (id.startsWith("camera-motion")) {
            this.moreInfo(this.cc.motionId)
        } else if (id.startsWith("camera-sound")) {
            this.moreInfo(this.cc.soundId)
        } else if (id.startsWith("camera-battery")) {
            this.moreInfo(this.cc.batteryId)
        } else if (id.startsWith("camera-signal")) {
            this.moreInfo(this.cc.signalId)
    
        } else if (id.startsWith("camera-onoff")) {
            this.toggleCamera()
        } else if (id.startsWith("camera-library")) {
            this.openLibrary()
        } else if (id.startsWith("camera-stream")) {
            this.showOrStopStream()
        } else if (id.startsWith("camera-snapshot")) {
            this.updateSnapshot()
    
        } else if (id.startsWith("camera-door2")) {
            this.moreInfo(this.cc.door2Id)
        } else if (id.startsWith("camera-lock2")) {
            if (modified) {
                this.moreInfo(this.cc.door2LockId)
            } else {
                this.toggleLock(this.cc.door2LockId)
            }
        } else if (id.startsWith("camera-bell2")) {
            if (!this.cc.door2BellMuteId || modified) {
                this.moreInfo(this.cc.door2BellId)
            } else {
                this.toggleSwitch(this.cc.door2BellMuteId)
            }
        } else if (id.startsWith("camera-door")) {
            this.moreInfo(this.cc.doorId)
        } else if (id.startsWith("camera-lock")) {
            if (modified) {
                this.moreInfo(this.cc.doorLockId)
            } else {
                this.toggleLock(this.cc.doorLockId)
            }
        } else if (id.startsWith("camera-bell")) {
            if (!this.cc.doorBellMuteId || modified) {
                this.moreInfo(this.cc.doorBellId)
            } else {
                this.toggleSwitch(this.cc.doorBellMuteId)
            }
        } else if (id.startsWith("camera-light2")) {
            if (modified) {
                this.moreInfo(this.cc.light2Id)
            } else {
                this.toggleLight(this.cc.light2Id)
            }
        } else if (id.startsWith("camera-light")) {
            if (modified) {
                this.moreInfo(this.cc.lightId)
            } else {
                this.toggleLight(this.cc.lightId)
            }
        } else if (id.startsWith("camera-siren")) {
            if (modified) {
                this.moreInfo(this.cc.sirenId)
            } else {
                this.toggleSiren(this.cc.sirenId)
            }
    
        } else if (id.startsWith("camera-previous")) {
            this.previousCameraImage()
        } else if (id.startsWith("camera-next")) {
            this.nextCameraImage()
        } else {
            this._log("something clicked")
        }
    },

    setupImageView() {
        if( this.cc.image_top ) {
            this.buildImageRow(this._element('top-bar'), this.cc.image_top)
        }
        if( this.cc.image_bottom ) {
            this.buildImageRow(this._element('bottom-bar'), this.cc.image_bottom)
        }
    
        if( this.gc.isMobile ) {
            this._hide("camera-previous")
            this._hide("camera-next")
        } else {
            this._set("camera-previous", {title: this._i.status.previous_camera, icon: "mdi:chevron-left", state: "on"})
            this._set("camera-next", {title: this._i.status.next_camera, icon: "mdi:chevron-right", state: "on"})
        }
    },

    setupImageHandlers() {
        const viewer = this._element("camera-viewer")
    
        viewer.addEventListener('error', () => {
            this.imageFailed();
        });
        viewer.addEventListener('click', () => {
            this.imageClicked();
        });
    
        if( this.gc.isMobile ) {
            viewer.addEventListener('touchstart', (e) => {
                this.ls.xDown = e.touches[0].clientX
                this.ls.xUp = null
            }, { passive: true })
    
            viewer.addEventListener('touchmove', (e) => {
                this.ls.xUp = e.touches[0].clientX
            }, { passive: true })
    
            viewer.addEventListener('touchend', () => {
                if( this.ls.xDown && this.ls.xUp ) {
                    const xDiff = this.ls.xDown - this.ls.xUp;
                    if( xDiff > this.gc.swipeThreshold ) {
                        this.nextCameraImage()
                    } else if( xDiff < (0 - this.gc.swipeThreshold) ) {
                        this.previousCameraImage()
                    }
                }
            }, { passive: true })
        }
    },

    updateImageView() {
        this._set("camera-name", {text: this.cc.name})
    
        for (const item in this.cs.details) {
            // noinspection JSUnfilteredForInLoop
            this._set(`camera-${item}`, this.cs.details[item])
        }
    },

    generateImageURL() {
        const camera = this._getState(this.cc.id,'unknown');
        
        // For cast compatibility, use hassUrl()
        // matches https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/components/hui-image.ts
        this.cs.image = this._hass.hassUrl(camera.attributes.entity_picture + "&t=" + new Date().getTime()) 
        this.cs.imageBase = camera.attributes.entity_picture
    },

    generateImageURLLater(seconds = 2) {
        setTimeout(() => {
            this.generateImageURL()
            this.updateImageView()
        }, seconds * 1000);
    },

    showImageView() {
        if( this.cs.image !== null ) {
            this._show("camera-viewer")
            this._hide("broken-image")
        } else {
            this._show("broken-image")
            this._hide("camera-viewer")
        }
        this._show('top-bar', !!this.cc.image_top)
        this._show('bottom-bar', !!this.cc.image_bottom)
        this.hideRecordingView()
        this.hideStreamView()
        this.hideLibraryView()
        this.hideModal()
    },

    hideImageView() {
        this._hide("camera-viewer")
        this._hide("broken-image")
        this._hide('top-bar')
        this._hide('bottom-bar')
    },

    imageFailed() {
        this.cs.details.viewer = {title: "", alt: "", src: null}
        this.cs.image = null
        this.updateImageView()
        this.showImageView()
        this._log("image load failed")
    },

    imageClicked() {
        if ( this.cc.playStream ) {
            this.playStream()
        } else {
            this.playLatestRecording()
        }
    },

    setCameraImage( index ) {
        this._cameraIndex = index
        this.setupImageView()
        this.setupLibraryView()
        this.updateImageView()
    },

    nextCameraImage() {
        this.setCameraImage( this._cameraIndex === (this._cameraCount - 1) ? 0 : (this._cameraIndex + 1) )
    },

    previousCameraImage() {
        this.setCameraImage( this._cameraIndex === 0 ? (this._cameraCount - 1) : (this._cameraIndex - 1) )
    },

    toggleCamera( ) {
        if ( this.cs.state === 'off' ) {
            this._hass.callService( 'camera','turn_on', { entity_id: this.cc.id } )
        } else {
            this._hass.callService( 'camera','turn_off', { entity_id: this.cc.id } )
        }
    },

    toggleLock( id ) {
        if ( this._getState(id,'locked').state === 'locked' ) {
            this._hass.callService( 'lock','unlock', { entity_id:id } )
        } else {
            this._hass.callService( 'lock','lock', { entity_id:id } )
        }
    },

    toggleLight( id ) {
        if ( this._getState(id,'on').state === 'on' ) {
            this._hass.callService( 'light','turn_off', { entity_id:id } )
        } else {
            this._hass.callService( 'light','turn_on', { entity_id:id } )
        }
    },

    toggleSiren( id ) {
        if ( !id ) return;
        if ( this._getState(id,'on').state === 'on' ) {
            this._hass.callService( 'siren','turn_off', { entity_id:id } )
        } else {
            this._hass.callService( 'siren','turn_on', { entity_id:id } )
        }
    },

    toggleSwitch( id ) {
        if ( this._getState(id,'on').state === 'on' ) {
            this._hass.callService( 'switch','turn_off', { entity_id:id } )
        } else {
            this._hass.callService( 'switch','turn_on', { entity_id:id } )
        }
    },

};
