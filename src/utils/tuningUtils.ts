import { TuningType, Note } from '../types';

export const getTuningNotes = (tuningType: TuningType): Note[] => {
  switch (tuningType) {
    case 'standard':
      return ['E', 'A', 'D', 'G', 'B', 'E'];
    case 'dropD':
      return ['D', 'A', 'D', 'G', 'B', 'E'];
    case 'openG':
      return ['D', 'G', 'D', 'G', 'B', 'D'];
    default:
      return ['E', 'A', 'D', 'G', 'B', 'E'];
  }
};

export const getNoteFrequency = (note: Note): number => {
  const frequencies: Record<Note, number> = {
    'E': 82.41,
    'A': 110.00,
    'D': 146.83,
    'G': 196.00,
    'B': 246.94,
    'C': 130.81,
    'F': 174.61
  };
  return frequencies[note];
};

export const getNoteFromFrequency = (frequency: number): { note: string; octave: number } => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFrequency = 440; // A4
  const baseNote = 9; // A is the 9th note in the array
  const baseOctave = 4;

  const halfSteps = Math.round(12 * Math.log2(frequency / baseFrequency));
  const octaveChange = Math.floor((halfSteps + baseNote) / 12);
  const noteIndex = (halfSteps + baseNote + 120) % 12;

  return {
    note: notes[noteIndex],
    octave: baseOctave + octaveChange
  };
};