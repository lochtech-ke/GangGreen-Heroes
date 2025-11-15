# Leaflet Map Integration Setup

This document provides instructions for setting up the Leaflet map integration for the GangGreen platform.

## Installation

The required dependencies have been added to `package.json`. To install them, run:

```bash
npm install
```

This will install:
- `leaflet@^1.9.4` - Core Leaflet library for interactive maps
- `react-leaflet@^4.2.1` - React components for Leaflet
- `@types/leaflet@^1.9.8` - TypeScript type definitions for Leaflet

## What Was Implemented

### 1. Map Components

Three new map components have been created in `src/components/initiatives/`:

#### InitiativeMap
- Displays multiple initiatives on an interactive map
- Color-coded markers by status (active, completed, paused)
- Clickable markers with popups showing initiative details
- Supports marker click callbacks for navigation

#### LocationPicker
- Interactive map for selecting initiative locations
- Click-to-place marker functionality
- Preset location buttons for quick forest selection
- Manual coordinate input fields
- Used in the InitiativeForm component

#### ForestBoundaryMap
- Displays forest boundaries as colored polygons
- Shows Kakamega, Karura, and Mau forests
- Can display single forest or all forests
- Popups with forest information

### 2. Updated Components

#### InitiativeForm
- Now uses LocationPicker component for location selection
- Provides visual map interface instead of just coordinate inputs
- Preset buttons for quick forest location selection

### 3. Styling

- Leaflet CSS imported in `src/index.css`
- Custom popup styling for better integration with Tailwind
- Marker icons properly configured

## Usage Examples

### Display Initiatives on Map

```tsx
import { InitiativeMap } from '@/components/initiatives';

function InitiativesMapView() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  return (
    <InitiativeMap
      initiatives={initiatives}
      center={[0.2827, 34.8522]} // Kakamega Forest
      zoom={10}
      height="600px"
      onMarkerClick={(initiative) => {
        console.log('Clicked:', initiative);
        navigate(`/initiatives/${initiative.id}`);
      }}
    />
  );
}
```

### Location Picker in Form

```tsx
import { LocationPicker } from '@/components/initiatives';

function CreateInitiative() {
  const [location, setLocation] = useState<GeoPoint>({
    type: 'Point',
    coordinates: [34.8522, 0.2827],
  });

  return (
    <LocationPicker
      value={location}
      onChange={setLocation}
      height="400px"
    />
  );
}
```

### Forest Boundary Visualization

```tsx
import { ForestBoundaryMap } from '@/components/initiatives';

// Show single forest
<ForestBoundaryMap forest="kakamega" />

// Show all forests
<ForestBoundaryMap showAllForests={true} height="600px" />
```

## Map Tiles

The implementation uses OpenStreetMap tiles, which are free and don't require an API key. If you want to use Mapbox tiles for better styling:

1. Get a Mapbox API token from https://www.mapbox.com/
2. Add to `.env`:
   ```
   VITE_MAPBOX_TOKEN=your_token_here
   ```
3. Update the TileLayer URL in map components:
   ```tsx
   <TileLayer
     attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
     url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
   />
   ```

## Forest Coordinates

The following coordinates are used for the three pilot forests:

- **Kakamega Forest**: 0.2827°N, 34.8522°E
- **Karura Forest**: -1.2411°N, 36.8344°E
- **Mau Forest**: -0.5°N, 35.5833°E

These are approximate center points. The ForestBoundaryMap component includes simplified boundary polygons.

## Troubleshooting

### Marker Icons Not Showing

If marker icons don't appear, ensure the Leaflet CSS is properly imported in `src/index.css`:

```css
@import 'leaflet/dist/leaflet.css';
```

The components include icon configuration to fix the default marker icon issue in React-Leaflet.

### Map Not Rendering

1. Check that the container has a defined height
2. Ensure Leaflet CSS is loaded
3. Check browser console for errors

### TypeScript Errors

If you see TypeScript errors related to Leaflet types, ensure `@types/leaflet` is installed:

```bash
npm install --save-dev @types/leaflet
```

## Next Steps

After installation, you can:

1. Test the map components in your development environment
2. Customize marker colors and styles
3. Add more detailed forest boundary data
4. Integrate satellite imagery layers
5. Add clustering for many initiatives
6. Implement drawing tools for custom boundaries

## Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Mapbox](https://www.mapbox.com/)
