import { _array, _includes, _real, _value, _tsi } from "../helpers.js";

export const LibraryViewMixin = {
    buildLibraryIconDiv(items, prefix = "") {
        let div = document.createElement("div");
        items.forEach((item) => {
            div.appendChild(this.buildIcon(item, prefix, (evt) => {
                this.libraryIconClicked(evt)
            }));
        });
        return div;
    },

    buildLibraryControl(element, prefix) {
        element.innerHTML = ''
        element.appendChild(this.buildLibraryIconDiv(["library-control-first", "library-control-previous"], prefix))
        element.appendChild(this.buildLibraryIconDiv(["library-control-resize", "library-control-close"], prefix))
        element.appendChild(this.buildLibraryIconDiv(["library-control-next", "library-control-last"], prefix))
    },

    libraryIconClicked(evt) {
        const id = evt.target.id;
    
        if(id.startsWith("library-control-close")) {
            this.closeLibrary();
        } else if(id.startsWith("library-control-resize")) {
            this.resizeLibrary();
        } else if(id.startsWith("library-control-first")) {
            this.firstLibraryPage();
        } else if(id.startsWith("library-control-previous")) {
            this.previousLibraryPage();
        } else if(id.startsWith("library-control-next")) {
            this.nextLibraryPage();
        } else if(id.startsWith("library-control-last")) {
            this.lastLibraryPage();
        }
    },

    setupLibraryView() {
        this.buildLibraryControl(this._element('library-controls'), "")
        // TODO maybe modal?
    },

    setupLibraryHandlers() {
        // rudimentary swipe support
        const viewer = this._element("library-viewer")
    
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
                        this.nextLibraryPage()
                    } else if( xDiff < (0 - this.gc.swipeThreshold) ) {
                        this.previousLibraryPage()
                    }
                }
            }, { passive: true })
        }
    },

    _updateLibraryHTML() {
        // update library state to reflect the new layout
        this.gs.librarySize = this.lc.sizes[this.ls.sizeIndex]
        this.ls.gridCount = this.gs.librarySize * this.gs.librarySize
    
        let grid = document.createElement("div")
        grid.style.display = "grid"
        grid.style['grid-template-columns'] = `repeat(${this.gs.librarySize},1fr)`
        grid.style['grid-template-rows'] = `repeat(${this.gs.librarySize},1fr)`
        grid.style['grid-gap'] = '1px'
        grid.style.padding= '2px'
    
        for( let i = 0; i < this.gs.librarySize * this.gs.librarySize; ++i ) {
    
            // The thumbnail element.
            let img = document.createElement("img")
            img.id = this._id(`library-${i}`)
            img.style.width = "100%"
            img.style.height = "100%"
            img.style.objectFit = "cover"
            img.addEventListener("click", () => { this.playRecording(i) } )
            img.addEventListener("mouseover", () => { this.showDownloadIcon(i) } )
            img.addEventListener("mouseout", () => { this.hideDownloadIcon(i) } )
    
            // The region highlight element
            let box = document.createElement("div")
            box.id = this._id(`library-box-${i}`)
            box.style.width = "100%"
            box.style.height = "100%"
            box.style.position = "absolute"
            box.style.top = "0"
            box.addEventListener("click", () => { this.playRecording(i) } )
            box.addEventListener("mouseover", () => { this.showDownloadIcon(i) } )
            box.addEventListener("mouseout", () => { this.hideDownloadIcon(i) } )
    
            // The download icon
            let a = document.createElement("a")
            a.id = this._id(`library-a-${i}`)
            a.style.position = "absolute"
            a.style.left = `2%`
            a.style.top  = `5%`
            a.setAttribute("download","")
            a.innerHTML = `<ha-icon class="aarlo-icon-small" icon="mdi:download" style="color: white;"></ha-icon>`
    
            const column = Math.floor((i % this.gs.librarySize) + 1)
            const row = Math.floor((i / this.gs.librarySize) + 1)
            let div = document.createElement("div")
            div.style.position= 'relative'
            div.style.gridColumn = `${column}`
            div.style.gridRow    = `${row}`
            div.appendChild(img)
            div.appendChild(box)
            div.appendChild(a)
            grid.appendChild(div)
        }
    
        // replace.
        let container = this._element('library-viewer')
        container.innerHTML = ''
        container.appendChild(grid)
    },

    _updateLibraryView() {
        // Massage offset so it fits in library.
        if( this.ls.offset + this.ls.gridCount > this.ls.recordings.length ) {
            this.ls.offset = Math.max(this.ls.recordings.length - this.ls.gridCount, 0)
        } else if( this.ls.offset < 0 ) {
            this.ls.offset = 0
        }
    
        let i = 0;
        let j= this.ls.offset;
        const show_triggers = this.lc.regions.includes(this.gs.librarySize)
        const last = Math.min(j + this.ls.gridCount, this.ls.recordings.length)
        for( ; j < last; i++, j++ ) {
            const id = `library-${i}`
            const bid = `library-box-${i}`
            const video = this.ls.recordings[j]
            let captured_text = `${this._i.library.captured}: ${video.created_at_pretty}`
            if( this.lc.duration ) {
                const minutes = Math.floor(video.duration / 60)
                const seconds = video.duration % 60
                captured_text += `\n${this._i.library.duration}: ${minutes}:${seconds.toString().padStart(2,'0')}`
            }
            if ( video.trigger && video.trigger !== '' ) {
                captured_text += `\n${this._i.library.reason}: ${this._i.trigger[video.trigger.toLowerCase()]}`
            }
            this._set( id,{title: captured_text, alt: captured_text, src: video.thumbnail} )
            this._show( id )
    
            // highlight is on at this level and we have something?
            if( show_triggers && video.trigger !== null && video.trigger_region !== null ) {
                const coords = video.trigger_region.split(",")
    
                let box = this._element( bid )
                box.style.left = `${parseFloat(coords[0]) * 100}%`
                box.style.top = `${parseFloat(coords[1]) * 100}%`
                box.style.width = `${(parseFloat(coords[2]) - parseFloat(coords[0])) * 100}%`
                box.style.height = `${(parseFloat(coords[3]) - parseFloat(coords[1])) * 100}%`
                box.style.borderStyle = "solid"
                box.style.borderWidth = "thin"
                box.style.borderColor = video.trigger in this.lc.colors ?
                                               this.lc.colors[video.trigger] : "cyan"
                this._set( bid,{title: captured_text, alt: captured_text } )
                this._show( bid )
            } else {
                this._hide( bid )
            }
    
            // download icon
            const aid = `library-a-${i}`
            this._element( aid ).href = video.url
            this._hide( aid )
    
        }
        for( ; i < this.ls.gridCount; i++ ) {
            this._hide(`library-${i}`)
            this._hide(`library-box-${i}`)
            this._hide(`library-a-${i}`)
        }
    
        // save state
        this.ls.lastOffset = this.ls.offset
        this.gs.libraryCamera = this._cameraIndex
    
        const not_at_start = this.ls.offset !== 0
        this._set( "library-control-first",{
            title: not_at_start ? this._i.library.first_page : "",
            icon: 'mdi:page-first',
            state: not_at_start ? "on" : "off"
        })
        this._set( "library-control-previous",{
            title: not_at_start ? this._i.library.previous_page : "",
            icon: 'mdi:chevron-left',
            state: not_at_start ? "on" : "off"
        })
    
        this._set( "library-control-resize",{ title: this._i.library.next_size, icon: 'mdi:resize', state: "on" })
        this._set( "library-control-close",{ title: this._i.library.close, icon: 'mdi:close', state: "on" })
    
        const not_at_end = this.ls.offset + this.ls.gridCount < this.ls.recordings.length
        this._set( "library-control-next",{
            title: not_at_end ? this._i.library.next_page : "",
            icon: 'mdi:chevron-right',
            state: not_at_end ? "on" : "off"
        })
        this._set( "library-control-last",{
            title: not_at_end ? this._i.library.last_page : "",
            icon: 'mdi:page-last',
            state: not_at_end ? "on" : "off"
        })
    },

    updateLibraryView() {
        this._show('library-control-resize',this.lc.sizes.length > 1 );
    
        // If camera index has changed then load library
        if ( this.gs.libraryCamera !== this._cameraIndex ) {
            this._log( `library-camera-change` )
            this._updateLibraryHTML()
            this._updateLibraryView()
    
        // Resized? Rebuild grid and force reload of images.
        } else if ( this.gs.librarySize !== this.lc.sizes[this.ls.sizeIndex] ) {
            this._log( `library-size-change` )
            this._updateLibraryHTML()
            this._updateLibraryView()
    
        // If offset has changed then reload images
        } else if ( this.ls.lastOffset !== this.ls.offset ) {
            this._log( `library-view-update` )
            this._updateLibraryView()
        } 
    },

    showLibraryView() {
        this._show("library-viewer")
        this._show("library-controls")
        this.hideRecordingView()
        this.hideStreamView()
        this.hideImageView()
        this.hideModal()
    },

    hideLibraryView() {
        this._hide("library-viewer")
        this._hide("library-controls")
    },

    mergeLibraries() {
        if( !this.gc.blendedMode ) {
            return
        }
        let recordings = this._ls[0].recordings.slice()
        for( let i = 1; i < this._cameraCount; i++ ) {
            let j = 0
            let k = 0
            while( k < this._ls[i].recordings.length ) {
                if( j === recordings.length ) {
                    recordings.push( this._ls[i].recordings[k] )
                    k++
                } else if( recordings[j].created_at < this._ls[i].recordings[k].created_at ) {
                    recordings.splice( j, 0, this._ls[i].recordings[k] )
                    k++
                }
                j++
            }
        }
        this._ls[this._cameraCount].recordings = recordings
    },

    openLibrary() {
        if( this.ls.recordings && this.ls.recordings.length > 0 ) {
            this.ls.showing = true
            this.getModalDimensions()
            this.updateLibraryView()
            this.showLibraryView()
        }
    },

    firstLibraryPage() {
        this.ls.offset = 0
        this.updateLibraryView()
    },

    previousLibraryPage() {
        this.ls.offset = Math.max(this.ls.offset - this.ls.gridCount, 0)
        this.updateLibraryView()
    },

    nextLibraryPage() {
        const last = Math.max(this.ls.recordings.length - this.ls.gridCount, 0)
        this.ls.offset = Math.min(this.ls.offset + this.ls.gridCount, last)
        this.updateLibraryView()
    },

    lastLibraryPage() {
        this.ls.offset = Math.max(this.ls.recordings.length - this.ls.gridCount, 0)
        this.updateLibraryView()
    },

    resizeLibrary() {
        this.ls.sizeIndex += 1
        if( this.ls.sizeIndex === this.lc.sizes.length ) {
            this.ls.sizeIndex = 0
        }
        this.updateLibraryView()
    },

    closeLibrary() {
        this.ls.showing = false
        this.stopRecording()
        this.showImageView()
    },

    showDownloadIcon(index) {
        if( this.lc.download ) {
            this._show(`library-a-${index}`)
        }
    },

    hideDownloadIcon(index) {
        this._hide(`library-a-${index}`)
    },

};
