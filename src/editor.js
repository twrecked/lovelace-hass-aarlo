export const TOP_WIDGET_OPTIONS = [
    { value: "name", label: "Camera Name" },
    { value: "status", label: "Status (Idle/Streaming/etc)" },
    { value: "date", label: "Date / Time of Capture" },
];

export const BOTTOM_WIDGET_OPTIONS = [
    { value: "battery", label: "Battery Level" },
    { value: "signal", label: "Signal Strength" },
    { value: "library", label: "Library / Recordings" },
    { value: "motion", label: "Motion Detection" },
    { value: "sound", label: "Audio Detection" },
    { value: "stream", label: "Live Stream Toggle" },
    { value: "snapshot", label: "Take Snapshot" },
    { value: "onoff", label: "Camera On/Off" },
    { value: "lock", label: "Door Lock" },
    { value: "light", label: "Light" },
    { value: "siren", label: "Siren" },
    { value: "bell", label: "Doorbell" },
    { value: "door", label: "Door Contact" },
    { value: "lock2", label: "Door Lock #2" },
    { value: "light2", label: "Light #2" },
    { value: "bell2", label: "Doorbell #2" },
    { value: "door2", label: "Door Contact #2" },
    { value: "previous", label: "Previous Camera (Multi-cam)" },
    { value: "next", label: "Next Camera (Multi-cam)" },
];

export const EDITOR_SCHEMA = [
    { name: "entity", selector: { entity: { domain: "camera" } } },
    { name: "name", selector: { text: {} } },
    {
        name: "image_click",
        selector: {
            select: {
                options: [
                    { value: "stream", label: "Live Stream" },
                    { value: "recording", label: "Last Recording" },
                ],
            },
        },
    },
    {
        name: "top_left",
        selector: {
            select: {
                multiple: true,
                options: TOP_WIDGET_OPTIONS,
            },
        },
    },
    {
        name: "top_right",
        selector: {
            select: {
                multiple: true,
                options: TOP_WIDGET_OPTIONS,
            },
        },
    },
    {
        name: "bottom_left",
        selector: {
            select: {
                multiple: true,
                options: BOTTOM_WIDGET_OPTIONS,
            },
        },
    },
    {
        name: "bottom_right",
        selector: {
            select: {
                multiple: true,
                options: BOTTOM_WIDGET_OPTIONS,
            },
        },
    },
    { name: "door_lock", selector: { entity: { domain: "lock" } } },
    { name: "light", selector: { entity: { domain: "light" } } },
    { name: "siren", selector: { entity: { domain: "siren" } } },
    { name: "door_bell", selector: { entity: { domain: "binary_sensor" } } },
    { name: "door_bell_mute", selector: { entity: { domain: "switch" } } },
    { name: "door", selector: { entity: { domain: "binary_sensor" } } },
    { name: "library_sizes", selector: { text: {} } },
    { name: "logging", selector: { boolean: {} } },
];

export class AarloGlanceEditor extends HTMLElement {
    constructor() {
        super();
        this._config = null;
        this._hass = null;
        this._form = null;
    }

    setConfig(config) {
        this._config = { ...config };
        this.render();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._form) {
            this._form.hass = hass;
        }
    }

    connectedCallback() {
        this.render();
    }

    _computeLabel(schema) {
        const labels = {
            entity: "Camera Entity",
            name: "Display Name (Optional)",
            image_click: "Click Preview Action",
            top_left: "Top Bar Widgets (Left)",
            top_right: "Top Bar Widgets (Right)",
            bottom_left: "Bottom Bar Widgets (Left)",
            bottom_right: "Bottom Bar Widgets (Right)",
            door_lock: "Door Lock",
            light: "Light",
            siren: "Siren",
            door_bell: "Doorbell Sensor",
            door_bell_mute: "Doorbell Mute Switch",
            door: "Door Contact Sensor",
            library_sizes: "Library Grid Sizes (e.g. 2,3,4)",
            logging: "Enable Debug Logging",
        };
        return labels[schema.name] || schema.name;
    }

    _parseWidgets(field) {
        if (!field) return [[], []];
        const raw = Array.isArray(field) ? field.join("|") : String(field);
        const parts = raw.split("|");
        const left = parts[0] ? parts[0].split(",").map((s) => s.trim()).filter(Boolean) : [];
        const right = parts[1] ? parts[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
        return [left, right];
    }

    _valueChanged(ev) {
        if (!this._config || !this._hass) return;
        const value = ev.detail.value;
        const newConfig = { ...this._config };

        for (const [k, v] of Object.entries(value)) {
            if (v === "" || v === undefined) {
                delete newConfig[k];
            } else {
                newConfig[k] = v;
            }
        }

        const topL = (value.top_left || []).join(",");
        const topR = (value.top_right || []).join(",");
        if (topL || topR) {
            newConfig.image_top = topR ? `${topL}|${topR}` : topL;
        } else {
            delete newConfig.image_top;
        }

        const bottomL = (value.bottom_left || []).join(",");
        const bottomR = (value.bottom_right || []).join(",");
        if (bottomL || bottomR) {
            newConfig.image_bottom = bottomR ? `${bottomL}|${bottomR}` : bottomL;
        } else {
            delete newConfig.image_bottom;
        }

        delete newConfig.top_left;
        delete newConfig.top_right;
        delete newConfig.bottom_left;
        delete newConfig.bottom_right;

        this._config = newConfig;
        const event = new CustomEvent("config-changed", {
            bubbles: true,
            composed: true,
            detail: { config: newConfig },
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this._hass || !this._config) return;

        if (!this._form) {
            this.innerHTML = `
                <style>
                    .card-config {
                        padding: 16px 0;
                    }
                </style>
                <div class="card-config">
                    <ha-form></ha-form>
                </div>
            `;
            this._form = this.querySelector("ha-form");
            this._form.addEventListener("value-changed", (ev) => this._valueChanged(ev));
            this._form.computeLabel = (s) => this._computeLabel(s);
        }

        const [topLeft, topRight] = this._parseWidgets(this._config.image_top);
        const [bottomLeft, bottomRight] = this._parseWidgets(this._config.image_bottom);

        const formData = {
            ...this._config,
            top_left: topLeft,
            top_right: topRight,
            bottom_left: bottomLeft,
            bottom_right: bottomRight,
        };

        this._form.hass = this._hass;
        this._form.schema = EDITOR_SCHEMA;
        this._form.data = formData;
    }
}

