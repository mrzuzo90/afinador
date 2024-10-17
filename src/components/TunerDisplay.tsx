import React, { useState, useEffect, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { TuningType } from '../types';
import { getNoteFrequency, getTuningNotes, getNoteFromFrequency } from '../utils/tuningUtils';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle, Mic } from 'lucide-react';

interface TunerDisplayProps {
  tuningType: TuningType;
}

const TunerDisplay: React.FC<TunerDisplayProps> = ({ tuningType }) => {
  const [note, setNote] = useState<string>('');
  const [frequency, setFrequency] = useState<number>(0);
  const [isInTune, setIsInTune] = useState<boolean>(false);
  const [deviation, setDeviation] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [tunedStrings, setTunedStrings] = useState<string[]>([]);
  const [allTuned, setAllTuned] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (tunedStrings.length === 6) {
      setAllTuned(true);
      playCompletionMelody();
    }
  }, [tunedStrings]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const detector = PitchDetector.forFloat32Array(analyserRef.current.fftSize);
      const input = new Float32Array(detector.inputLength);
      
      const updatePitch = () => {
        analyserRef.current!.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input, audioContextRef.current!.sampleRate);
        
        if (clarity > 0.7 && pitch > 60 && pitch < 1000) {
          const detectedNote = getNoteFromFrequency(pitch);
          setNote(detectedNote.note);
          setFrequency(pitch);
          const expectedFrequency = getNoteFrequency(detectedNote.note as any);
          const newIsInTune = Math.abs(pitch - expectedFrequency) < 1;
          setIsInTune(newIsInTune);
          setDeviation(pitch - expectedFrequency);

          if (newIsInTune && !tunedStrings.includes(detectedNote.note)) {
            setTunedStrings(prev => [...prev, detectedNote.note]);
            playCorrectPitchSound();
          }
        }
        
        rafIdRef.current = requestAnimationFrame(updatePitch);
      };
      
      updatePitch();
      setIsListening(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
    }
  };

  const stopListening = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setNote('');
    setFrequency(0);
    setIsInTune(false);
    setDeviation(0);
    setTunedStrings([]);
    setAllTuned(false);
  };

  const playCorrectPitchSound = () => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
      oscillator.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    }
  };

  const playCompletionMelody = () => {
    if (audioContextRef.current) {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime + index * 0.2);
        oscillator.connect(audioContextRef.current!.destination);
        oscillator.start(audioContextRef.current!.currentTime + index * 0.2);
        oscillator.stop(audioContextRef.current!.currentTime + (index + 1) * 0.2);
      });
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`mb-4 px-4 py-2 rounded-full ${
          isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
        } text-white flex items-center justify-center mx-auto`}
      >
        <Mic className="w-5 h-5 mr-2" />
        {isListening ? 'Detener' : 'Comenzar a escuchar'}
      </button>
      <div className="text-6xl font-bold mb-4 text-red-600">{note || '-'}</div>
      <div className="text-2xl mb-4 text-black">{frequency.toFixed(2)} Hz</div>
      <div className="flex justify-center items-center mb-4">
        {isInTune ? (
          <CheckCircle className="w-16 h-16 text-green-500" />
        ) : deviation < 0 ? (
          <ArrowUpCircle className="w-16 h-16 text-red-600" />
        ) : (
          <ArrowDownCircle className="w-16 h-16 text-red-600" />
        )}
      </div>
      <div className="text-xl text-black mb-4">
        {isInTune ? '¡Afinado!' : `Afinar ${deviation < 0 ? 'Arriba' : 'Abajo'}`}
      </div>
      <div className="flex justify-center space-x-2 mb-4">
        {getTuningNotes(tuningType).map((stringNote, index) => (
          <div
            key={`${stringNote}-${index}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              tunedStrings.includes(stringNote) ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}
          >
            {stringNote}
          </div>
        ))}
      </div>
      {allTuned && (
        <div className="text-6xl font-bold text-green-500 animate-pulse">OK</div>
      )}
    </div>
  );
};

export default TunerDisplay;