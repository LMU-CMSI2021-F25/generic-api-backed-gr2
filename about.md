# Mission Control Dashboard

Mission Control Dashboard is a responsive React application that surfaces two different NASA data products side-by-side:

- Astronomy Picture of the Day (APOD) with its explanatory context
- Mars rover telemetry that combines mission manifest statistics with recent camera imagery based on a user-selected rover and sol

## NASA APIs

This project uses the public NASA Open APIs:

- APOD: https://api.nasa.gov/
- Mars Rover Photos & Mission Manifest: https://api.nasa.gov/

Supply your own NASA API key via a `.env` entry named `VITE_NASA_API_KEY` for improved rate limits. Without a key, the app falls back to `DEMO_KEY` which is suitable for light usage.

## Highlights

- All API calls are wrapped in `src/api/nasa.js`, keeping fetch logic outside of React components.
- Mission telemetry shows launch, landing, operational status, and photo counts alongside a gallery of images for the selected sol.
- The layout adapts to small and large screens, includes custom fonts, gradients, grid/flex layouts, and animated loading feedback to meet the assignment styling requirements.

