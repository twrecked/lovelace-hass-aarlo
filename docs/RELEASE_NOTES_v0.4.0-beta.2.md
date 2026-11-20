# Lovelace Hass Aarlo v0.4.0-beta.2 — Release Notes

## Live stream controls

- The live stream overlay shows siren, light, and door-lock controls only when explicitly configured for the card ([#182](https://github.com/twrecked/lovelace-hass-aarlo/pull/182)).
- Camera-level siren auto-discovery no longer falls back to the `all_sirens` entity.

## Upgrading via HACS

Open **HACS → Aarlo Glance → Redownload**, enable beta versions, and select `v0.4.0-beta.2`. Hard-refresh the dashboard to load the updated card.
