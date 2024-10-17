import React, { useState } from 'react';
import TunerDisplay from './components/TunerDisplay';
import TuningSelector from './components/TuningSelector';
import { TuningType } from './types';
import { Guitar, Music } from 'lucide-react';

function App() {
  const [tuningType, setTuningType] = useState<TuningType>('standard');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Guitar className="w-10 h-10 text-red-600 mr-2" />
          <h1 className="text-3xl font-bold text-black">Afinador de Guitarra</h1>
          <Music className="w-10 h-10 text-red-600 ml-2" />
        </div>
        <TuningSelector tuningType={tuningType} setTuningType={setTuningType} />
        <TunerDisplay tuningType={tuningType} />
      </div>
    </div>
  );
}

export default App;