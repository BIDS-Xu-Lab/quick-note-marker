# Quick Note Marker

No need to install, just start annotating docs!

# Development

Just go to the `web` folder and run the following commands:

```bash
cd web
npm install
npx vite
```

Then open your browser and go to `http://localhost:8901` or other URL suggested by `vite`.

# Build and deployment

For GitHub pages or deploy to a sub folder `/dist/`. Please change the folder name in the command according to actual path.

```bash
export VITE_BASE_PATH=/dist/ && npx vite build
```

# Changelog

## 2025-10-29: v1.0.3

- Added text comment in schema