import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ForestPreference } from '../../types/user.types';

interface ForestBoundaryMapProps {
  forest?: ForestPreference;
  height?: string;
  showAllForests?: boolean;
}

// Approximate forest boundaries (simplified polygons)
const FOREST_BOUNDARIES = {
  kakamega: {
    name: 'Kakamega Forest',
    center: [0.2827, 34.8522] as LatLngExpression,
    bounds: [
      [0.35, 34.8],
      [0.35, 34.9],
      [0.2, 34.9],
      [0.2, 34.8],
    ] as LatLngExpression[],
    color: '#059669',
    area: '238 km²',
    description: 'Primary pilot site - Indigenous rainforest',
  },
  karura: {
    name: 'Karura Forest',
    center: [-1.2411, 36.8344] as LatLngExpression,
    bounds: [
      [-1.23, 36.82],
      [-1.23, 36.85],
      [-1.25, 36.85],
      [-1.25, 36.82],
    ] as LatLngExpression[],
    color: '#2563EB',
    area: '10.5 km²',
    description: 'Urban conservation area in Nairobi',
  },
  mau: {
    name: 'Mau Forest',
    center: [-0.5, 35.5833] as LatLngExpression,
    bounds: [
      [-0.3, 35.4],
      [-0.3, 35.8],
      [-0.7, 35.8],
      [-0.7, 35.4],
    ] as LatLngExpression[],
    color: '#7C3AED',
    area: '400 km²',
    description: 'Critical water tower ecosystem',
  },
};

export function ForestBoundaryMap({
  forest,
  height = '500px',
  showAllForests = false,
}: ForestBoundaryMapProps) {
  // Determine which forests to show
  const forestsToShow = showAllForests
    ? Object.keys(FOREST_BOUNDARIES)
    : forest
    ? [forest]
    : Object.keys(FOREST_BOUNDARIES);

  // Calculate center point
  const getMapCenter = (): LatLngExpression => {
    if (forest && FOREST_BOUNDARIES[forest]) {
      return FOREST_BOUNDARIES[forest].center;
    }
    // Center of Kenya if showing all forests
    return [0.0236, 37.9062];
  };

  const getMapZoom = (): number => {
    if (showAllForests) {
      return 7; // Zoom out to show all of Kenya
    }
    return forest ? 11 : 7;
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {forestsToShow.map((forestKey) => {
          const forestData =
            FOREST_BOUNDARIES[forestKey as keyof typeof FOREST_BOUNDARIES];

          return (
            <Polygon
              key={forestKey}
              positions={forestData.bounds}
              pathOptions={{
                color: forestData.color,
                fillColor: forestData.color,
                fillOpacity: 0.3,
                weight: 3,
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">{forestData.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">{forestData.description}</p>
                    <p className="text-gray-600">
                      <span className="font-medium">Area:</span> {forestData.area}
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
