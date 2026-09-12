# vendor

Third-party front-end code, committed rather than pulled from a CDN at page load.

- `maplibre-gl.js` / `maplibre-gl.css` — MapLibre GL JS v5.1.0, 3-Clause BSD.
  Source: https://unpkg.com/maplibre-gl@5.1.0/dist/

Self-hosted for the same reason the fonts are: no third-party requests, so a
compromised CDN can't execute code on the site, and the page still works on a
weak connection at the park. Used by `parking.html`.

To update, download the new version here, re-check the page, and commit.
