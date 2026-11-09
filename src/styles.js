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
`;
