import { CARD_VERSION } from "./const.js";
import { AarloGlance } from "./aarlo-glance.js";
import { AarloGlanceEditor } from "./editor.js";

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

(async function loadMediaLibraries() {
    if (!window.Hls) {
        await loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js");
    }
    if (!window.dashjs) {
        await loadScript("https://cdn.dashjs.org/v3.2.1/dash.all.min.js");
    }
})();

if (!customElements.get("aarlo-glance-editor")) {
    customElements.define("aarlo-glance-editor", AarloGlanceEditor);
}

if (!customElements.get("aarlo-glance")) {
    customElements.define("aarlo-glance", AarloGlance);
}

console.info(
    `%c AARLO-GLANCE %c ${CARD_VERSION} `,
    "color: white; background: #03a9f4; font-weight: 700;",
    "color: #03a9f4; background: white; font-weight: 700;"
);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "aarlo-glance")) {
    window.customCards.push({
        type: "aarlo-glance",
        name: "Aarlo Glance Card",
        description: "Aarlo camera glance card with live streaming and library viewer",
        preview: true,
    });
}

export { AarloGlance, AarloGlanceEditor };
