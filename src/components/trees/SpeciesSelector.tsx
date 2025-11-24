import { useState, useEffect } from 'react';
import { treeService } from '../../services';

interface SpeciesSelectorProps {
  value: string;
  onChange: (species: string) => void;
  disabled?: boolean;
  allowCustom?: boolean;
}

// Common tree species in Kenya
const COMMON_SPECIES = [
  'Acacia',
  'Baobab',
  'Cedar',
  'Cypress',
  'Eucalyptus',
  'Fig',
  'Grevillea',
  'Jacaranda',
  'Mahogany',
  'Mangrove',
  'Mango',
  'Neem',
  'Oak',
  'Pine',
  'Teak',
];

export function SpeciesSelector({
  value,
  onChange,
  disabled = false,
  allowCustom = true,
}: SpeciesSelectorProps) {
  const [speciesList, setSpeciesList] = useState<string[]>(COMMON_SPECIES);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSpecies, setCustomSpecies] = useState('');

  useEffect(() => {
    loadSpecies();
  }, []);

  useEffect(() => {
    // Check if current value is not in the list
    if (value && !speciesList.includes(value)) {
      setShowCustomInput(true);
      setCustomSpecies(value);
    }
  }, [value, speciesList]);

  const loadSpecies = async () => {
    const { species } = await treeService.getSpeciesList();
    if (species.length > 0) {
      // Merge with common species and remove duplicates
      const merged = [...new Set([...COMMON_SPECIES, ...species])].sort();
      setSpeciesList(merged);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setShowCustomInput(true);
      setCustomSpecies('');
    } else {
      setShowCustomInput(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSubmit = () => {
    if (customSpecies.trim()) {
      onChange(customSpecies.trim());
      setShowCustomInput(false);
    }
  };

  if (showCustomInput && allowCustom) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Custom Species Name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customSpecies}
            onChange={(e) => setCustomSpecies(e.target.value)}
            placeholder="Enter species name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={disabled}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customSpecies.trim() || disabled}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:bg-gray-400"
          >
            Set
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomSpecies('');
            }}
            disabled={disabled}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tree Species
      </label>
      <select
        value={value}
        onChange={(e) => handleSelectChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Select a species...</option>
        {speciesList.map((species) => (
          <option key={species} value={species}>
            {species}
          </option>
        ))}
        {allowCustom && <option value="custom">+ Add Custom Species</option>}
      </select>
    </div>
  );
}
