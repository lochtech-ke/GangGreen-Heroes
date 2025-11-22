import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  icon?: L.Icon;
  link?: string;
}

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  height?: string;
  onMarkerClick?: (markerId: string) => void;
  boundary?: [number, number][];
}

const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  markers = [],
  className = '',
  height = '400px',
  onMarkerClick,
  boundary,
}) => {
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={marker.icon}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
                {marker.description && (
                  <p className="text-xs text-gray-600 mb-2">{marker.description}</p>
                )}
                {marker.link && (
                  <a
                    href={marker.link}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    View Details →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render boundary if provided */}
        {boundary && boundary.length > 0 && (
          <BoundaryOverlay boundary={boundary} />
        )}
      </MapContainer>
    </div>
  );
};

// Component to handle boundary overlay
const BoundaryOverlay: React.FC<{ boundary: [number, number][] }> = ({ boundary }) => {
  const map = useMap();

  useEffect(() => {
    if (boundary && boundary.length > 0) {
      const polygon = L.polygon(boundary, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);

      // Fit map to boundary
      map.fitBounds(polygon.getBounds());

      return () => {
        map.removeLayer(polygon);
      };
    }
  }, [boundary, map]);

  return null;
};

export default MapView;
