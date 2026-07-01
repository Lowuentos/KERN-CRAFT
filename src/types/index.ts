import { Font } from 'opentype.js';

export interface FontMetadata {
  id: string;
  name: string;
  designer: string;
  year: string;
  category: 'serif' | 'sans-serif' | 'slab-serif' | 'display' | 'monospace';
  description: string;
  url: string;
}

export interface GlyphPosition {
  index: number;
  char: string;
  pathData: string;
  idealX: number;     // in font units
  currentX: number;   // in font units, moves during drag
  initialX: number;   // in font units
  isFixed: boolean;   // true for first and last letters
  advanceWidth: number; // in font units
  glyphIndex: number;  // opentype glyph index
}

export interface LevelState {
  word: string;
  fontMetadata: FontMetadata;
  font: Font | null;
  glyphs: GlyphPosition[];
  isCompleted: boolean;
  score: number;
  individualScores: number[];
}

export interface GameHistoryItem {
  id: string;
  word: string;
  fontName: string;
  score: number;
  category: string;
}
