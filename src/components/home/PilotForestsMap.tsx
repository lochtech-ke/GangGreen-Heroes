import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ForestLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  imageUrl: string;
  treesPlanted: number;
  activeInitiatives: number;
  area: string;
}

interface PilotForestsMapProps {
  forests?: ForestLocation[];
  onForestClick?: (forestId: string) => void;
  onJoinInitiative?: (forestId: string) => void;
}

// Custom tree marker icon
const createTreeIcon = (color: string = '#10B981') => {
  return L.divIcon({
    className: 'custom-tree-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 40px;
          height: 40px;
          background-color: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          animation: pulse 2s infinite;
        ">
          🌳
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const ForestPopup: React.FC<{
  forest: ForestLocation;
  onJoinInitiative: () => void;
}> = ({ forest, onJoinInitiative }) => {
  return (
    <div className="w-64">
      {/* Forest Image */}
      {forest.imageUrl && (
        <img
          src={forest.imageUrl}
          alt={forest.name}
          className="w-full h-32 object-cover rounded-t-lg mb-3"
        />
      )}

      {/* Forest Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{forest.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{forest.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-gray-600">Trees Planted</p>
          <p className="text-sm font-bold text-green-700">{forest.treesPlanted.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <p className="text-xs text-gray-600">Initiatives</p>
          <p className="text-sm font-bold text-blue-700">{forest.activeInitiatives}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-2 mb-3">
        <p className="text-xs text-gray-600">Area</p>
        <p className="text-sm font-bold text-gray-700">{forest.area}</p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onJoinInitiative}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Join Local Initiative →
      </button>
    </div>
  );
};

export const PilotForestsMap: React.FC<PilotForestsMapProps> = ({
  forests,
  onForestClick,
  onJoinInitiative,
}) => {
  const [selectedForest, setSelectedForest] = useState<string | null>(null);

  // Default forest data for the three pilot forests
  const defaultForests: ForestLocation[] = [
    {
      id: 'kakamega',
      name: 'Kakamega Forest',
      coordinates: [0.2827, 34.8597],
      description: 'Primary pilot site - Kenya\'s only tropical rainforest',
      imageUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400',
      treesPlanted: 8543,
      activeInitiatives: 12,
      area: '45,000 hectares',
    },
    {
      id: 'karura',
      name: 'Karura Forest',
      coordinates: [-1.2508, 36.8333],
      description: 'Urban conservation area in Nairobi',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      treesPlanted: 3247,
      activeInitiatives: 8,
      area: '1,041 hectares',
    },
    {
      id: 'mau',
      name: 'Mau Forest',
      coordinates: [-0.5000, 35.5833],
      description: 'Critical water tower ecosystem',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
      treesPlanted: 5892,
      activeInitiatives: 15,
      area: '400,000 hectares',
    },
  ];

  const forestLocations = forests && forests.length > 0 ? forests : defaultForests;

  // Calculate center point for map (center of Kenya)
  const centerPosition: [number, number] = [-0.5, 35.5];

  const handleMarkerClick = (forestId: string) => {
    setSelectedForest(forestId);
    onForestClick?.(forestId);
  };

  const handleJoinInitiative = (forestId: string) => {
    onJoinInitiative?.(forestId);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Pilot Forests
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conservation activities are focused in three key Kenyan forests. Explore each
            location and join local initiatives to make a direct impact.
          </p>
        </div>

        {/* Map Container */}
        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-green-200 mb-8">
          <MapContainer
            center={centerPosition}
            zoom={7}
            style={{ height: '500px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {forestLocations.map((forest) => (
              <Marker
                key={forest.id}
                position={forest.coordinates}
                icon={createTreeIcon(selectedForest === forest.id ? '#059669' : '#10B981')}
                eventHandlers={{
                  click: () => handleMarkerClick(forest.id),
                }}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <ForestPopup
                    forest={forest}
                    onJoinInitiative={() => handleJoinInitiative(forest.id)}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Forest Cards - Alternative view */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forestLocations.map((forest) => (
            <div
              key={forest.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-gray-200 hover:border-green-500 cursor-pointer"
              onClick={() => handleMarkerClick(forest.id)}
            >
              <div className="text-4xl mb-3">🌳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{forest.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{forest.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-semibold">
                  {forest.treesPlanted.toLocaleString()} trees
                </span>
                <span className="text-blue-600 font-semibold">
                  {forest.activeInitiatives} initiatives
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add pulse animation for markers */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  );
};
