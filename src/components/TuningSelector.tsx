import React from 'react';
import { TuningType } from '../types';

interface TuningSelectorProps {
  tuningType: TuningType;
  setTuningType: (type: TuningType) => void;
}

const TuningSelector: React.FC<TuningSelectorProps> = ({ tuningType, setTuningType }) => {
  return (
    <div className="mb-6">
      <label htmlFor="tuning-select" className="block text-sm font-medium text-black mb-2">
        Seleccionar afinación:
      </label>
      <select
        id="tuning-select"
        value={tuningType}
        onChange={(e) => setTuningType(e.target.value as TuningType)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black"
      >
        <option value="standard">Afinación Estándar (E A D G B E)</option>
        <option value="dropD">Drop D (D A D G B E)</option>
        <option value="openG">Afinación Abierta G (D G D G B D)</option>
      </select>
    </div>
  );
};

export default TuningSelector;