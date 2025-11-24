import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint } from '../../types/initiative.types';

// Fix for default marker icons
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

interface LocationPickerProps {
  value: GeoPoint;
  onChange: (location: GeoPoint) => void;
  height?: string;
  disabled?: boolean;
}

// Component to handle map clicks
function LocationMarker({
  position,
  onLocationChange,
}: {
  position: LatLngExpression;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: any) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
}

export function LocationPicker({
  value,
  onChange,
  height = '400px',
  disabled = false,
}: LocationPickerProps) {
  const [mapCenter] = useState<LatLngExpression>([
    value.coordinates[1],
    value.coordinates[0],
  ]);

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      if (!disabled) {
        onChange({
          type: 'Point',
          coordinates: [lng, lat],
        });
      }
    },
    [onChange, disabled]
  );

  const markerPosition: LatLngExpression = [
    value.coordinates[1], // latitude
    value.coordinates[0], // longitude
  ];

  // Preset locations for quick selection
  const presetLocations = [
    {
      name: 'Kakamega Forest',
      coordinates: [34.8522, 0.2827] as [number, number],
    },
    {
      name: 'Karura Forest',
      coordinates: [36.8344, -1.2411] as [number, number],
    },
    {
      name: 'Mau Forest',
      coordinates: [35.5833, -0.5] as [number, number],
    },
  ];

  const handlePresetClick = (coordinates: [number, number]) => {
    if (!disabled) {
      onChange({
        type: 'Point',
        coordinates,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Locations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Select Location
        </label>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map((location) => (
            <button
              key={location.name}
              type="button"
              onClick={() => handlePresetClick(location.coordinates)}
              disabled={disabled}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate Display */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={value.coordinates[1]}
            onChange={(e) =>
              handleLocationChange(parseFloat(e.target.value), value.coordinates[0])
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={value.coordinates[0]}
            onChange={(e) =>
              handleLocationChange(value.coordinates[1], parseFloat(e.target.value))
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Map */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Click on map to select location
        </label>
        <div
          style={{ height, width: '100%' }}
          className={`rounded-lg overflow-hidden border-2 border-gray-300 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={markerPosition}
              onLocationChange={handleLocationChange}
            />
          </MapContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click anywhere on the map to set the initiative location, or use the preset
          buttons above.
        </p>
      </div>
    </div>
  );
}
