import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Initiative } from '../../types/initiative.types';
import { useEffect } from 'react';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface InitiativeMapProps {
  initiatives: Initiative[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  onMarkerClick?: (initiative: Initiative) => void;
  selectedInitiativeId?: string;
}

// Component to handle map centering
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export function InitiativeMap({
  initiatives,
  center = [0.2827, 34.8522], // Default: Kakamega Forest
  zoom = 10,
  height = '500px',
  onMarkerClick,
  selectedInitiativeId,
}: InitiativeMapProps) {
  const getMarkerColor = (initiative: Initiative) => {
    if (selectedInitiativeId === initiative.id) {
      return '#DC2626'; // Red for selected
    }
    switch (initiative.status) {
      case 'active':
        return '#059669'; // Green
      case 'completed':
        return '#2563EB'; // Blue
      case 'paused':
        return '#D97706'; // Yellow
      default:
        return '#6B7280'; // Gray
    }
  };

  const createCustomIcon = (initiative: Initiative) => {
    const color = getMarkerColor(initiative);
    const svgIcon = `
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const getForestDisplay = (forest: string) => {
    const forestMap: Record<string, string> = {
      kakamega: 'Kakamega Forest',
      karura: 'Karura Forest',
      mau: 'Mau Forest',
    };
    return forestMap[forest] || forest;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {initiatives.map((initiative) => {
          const position: LatLngExpression = [
            initiative.location.coordinates[1], // latitude
            initiative.location.coordinates[0], // longitude
          ];

          return (
            <Marker
              key={initiative.id}
              position={position}
              icon={createCustomIcon(initiative)}
              eventHandlers={{
                click: () => onMarkerClick?.(initiative),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">{initiative.title}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Forest:</span>{' '}
                      {getForestDisplay(initiative.forest)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          initiative.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : initiative.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {initiative.status}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Progress:</span>{' '}
                      {Math.round(
                        (initiative.trees_planted / initiative.target_trees) * 100
                      )}
                      %
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Trees:</span>{' '}
                      {initiative.trees_planted.toLocaleString()} /{' '}
                      {initiative.target_trees.toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Area:</span> {initiative.area_hectares}{' '}
                      hectares
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Started:</span>{' '}
                      {formatDate(initiative.start_date)}
                    </p>
                  </div>
                  {onMarkerClick && (
                    <button
                      onClick={() => onMarkerClick(initiative)}
                      className="mt-3 w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
