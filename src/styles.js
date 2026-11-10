export const CARD_STYLES = `
            <style>
                .w3-modal {
                    z-index: 1000;
                    display: none;
                    padding-top: 100px;
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgb(0,0,0);
                    background-color: rgba(0,0,0,0.4);
                }
                .w3-modal-content {
                    margin: auto;
                    background-color: #fff;
                    position: relative;
                    padding: 0;
                    outline: 0;
                    width: 600px;
                }
                .w3-animate-opacity {
                    animation: opac 0.8s;
                }
                @keyframes opac {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                ha-card {
                    position: relative;
                    min-height: 48px;
                    overflow: hidden;
                }
                .box {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    position: absolute;
                    left: 0;
                    right: 0;
                    background-color: rgba(0, 0, 0, 0.4);
                    padding: 4px 8px;
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
                .box-align-left {
                    margin-left: 4px;
                }
                .box-align-right {
                    margin-right: 4px;
                }
                .camera-name {
                    font-weight: 500;
                }
                .camera-status {
                    font-weight: 500;
                    text-transform: capitalize;
                }
                .camera-date {
                    font-weight: 500;
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
                .aarlo-modal-video-wrapper {
                    overflow: hidden;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .aarlo-modal-video {
                    position: absolute;
                    top: -8px;
                    left: 0;
                }
                .aarlo-modal-video-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    background-color: darkgrey;
                }
                .aarlo-library {
                    width: 100%;
                    cursor: pointer;
                }
                .aarlo-library-row {
                    display: flex;
                    margin: 6px 2px 6px 2px;
                }
                .aarlo-library-column {
                    flex: 32%;
                    padding: 2px;
                }
                .aarlo-text-medium {
                    font-size: 16px;
                    line-height: 26px;
                }
                .aarlo-text-small {
                    font-size: 14px;
                    line-height: 24px;
                }
                .aarlo-text-tiny {
                    font-size: 12px;
                    line-height: 22px;
                }
                .aarlo-icon-medium {
                }
                .aarlo-icon-small {
                    --mdc-icon-size: 18px;
                    height: 18px;
                    width: 18px;
                }
                .aarlo-icon-tiny {
                    --mdc-icon-size: 14px;
                    height: 14px;
                    width: 14px;
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
                ha-card.aarlo-pseudo-fullscreen,
                ha-card:fullscreen,
                ha-card:-webkit-full-screen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    z-index: 99999 !important;
                    background-color: #000 !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                }
                ha-card.aarlo-pseudo-fullscreen div.aarlo-base,
                ha-card:fullscreen div.aarlo-base,
                ha-card:-webkit-full-screen div.aarlo-base {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    padding-top: 0 !important;
                    margin: 0 !important;
                }
                ha-card.aarlo-pseudo-fullscreen .aarlo-video,
                ha-card:fullscreen .aarlo-video,
                ha-card:-webkit-full-screen .aarlo-video {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    transform: none !important;
                    object-fit: contain !important;
                }
                ha-card.aarlo-pseudo-fullscreen .box-bottom,
                ha-card:fullscreen .box-bottom,
                ha-card:-webkit-full-screen .box-bottom {
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    z-index: 10 !important;
                    padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
                    padding-left: max(12px, env(safe-area-inset-left)) !important;
                    padding-right: max(12px, env(safe-area-inset-right)) !important;
                    background-color: rgba(0, 0, 0, 0.6) !important;
                }
                ha-card.aarlo-pseudo-fullscreen ha-icon,
                ha-card:fullscreen ha-icon,
                ha-card:-webkit-full-screen ha-icon,
                .w3-modal.aarlo-pseudo-fullscreen ha-icon,
                .w3-modal:fullscreen ha-icon,
                .w3-modal:-webkit-full-screen ha-icon {
                    --mdc-icon-size: 26px !important;
                    height: 26px !important;
                    width: 26px !important;
                    padding: 4px !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen,
                .w3-modal:fullscreen,
                .w3-modal:-webkit-full-screen {
                    padding-top: 0 !important;
                    background-color: #000 !important;
                    z-index: 99999 !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen .w3-modal-content,
                .w3-modal:fullscreen .w3-modal-content,
                .w3-modal:-webkit-full-screen .w3-modal-content {
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    background-color: #000 !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen .aarlo-modal-video-wrapper,
                .w3-modal:fullscreen .aarlo-modal-video-wrapper,
                .w3-modal:-webkit-full-screen .aarlo-modal-video-wrapper {
                    width: 100vw !important;
                    height: 100vh !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen .aarlo-modal-video-background,
                .w3-modal:fullscreen .aarlo-modal-video-background,
                .w3-modal:-webkit-full-screen .aarlo-modal-video-background {
                    width: 100vw !important;
                    height: 100vh !important;
                    background-color: #000 !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen .aarlo-modal-video,
                .w3-modal:fullscreen .aarlo-modal-video,
                .w3-modal:-webkit-full-screen .aarlo-modal-video {
                    width: 100vw !important;
                    height: 100vh !important;
                    top: 0 !important;
                    left: 0 !important;
                    transform: none !important;
                    object-fit: contain !important;
                }
                .w3-modal.aarlo-pseudo-fullscreen .box-bottom,
                .w3-modal:fullscreen .box-bottom,
                .w3-modal:-webkit-full-screen .box-bottom {
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    z-index: 10 !important;
                    padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
                    padding-left: max(12px, env(safe-area-inset-left)) !important;
                    padding-right: max(12px, env(safe-area-inset-right)) !important;
                    background-color: rgba(0, 0, 0, 0.6) !important;
                }
`;
