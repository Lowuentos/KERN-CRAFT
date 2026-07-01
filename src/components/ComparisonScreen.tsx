import React, { useState, useEffect } from 'react';
import type { FontMetadata, GlyphPosition } from '../types';
import { Font } from 'opentype.js';

interface ComparisonScreenProps {
  fontMetadata: FontMetadata;
  font: Font;
  glyphs: GlyphPosition[];
  score: number;
  onNext: () => void;
  isLastLevel: boolean;
}

export const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  fontMetadata,
  font,
  glyphs,
  score,
  onNext,
  isLastLevel
}) => {
  // 'both' = overlay user (white) and expert (blue)
  // 'expert' = show expert (white) only
  // 'user' = show user (white) only
  const [viewMode, setViewMode] = useState<'both' | 'expert' | 'user'>('both');
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // SVG dimensions
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 380;
  const MARGIN = 80;
  const TARGET_WIDTH = SVG_WIDTH - 2 * MARGIN;

  const totalUnscaledWidth = glyphs.length > 0 
    ? glyphs[glyphs.length - 1].idealX + glyphs[glyphs.length - 1].advanceWidth 
    : 1000;
  
  const scale = TARGET_WIDTH / totalUnscaledWidth;
  const ascender = font.ascender;
  const descender = font.descender;
  const baselineY = (SVG_HEIGHT / 2) + ((ascender + descender) / 2) * scale;

  return (
    <div className="comparison-container animate-fade-in-up">
      {/* SVG Canvas overlaying user and expert solutions */}
      <div className="canvas-wrapper">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="kerning-svg">
          {/* Baseline */}
          <line x1={0} y1={baselineY} x2={SVG_WIDTH} y2={baselineY} className="baseline-grid" />

          {/* 1. Expert solution (Solution) in Blue (only in 'both' mode) */}
          {viewMode === 'both' && (
            <g className="expert-group">
              {glyphs.map((g, index) => {
                const xPos = MARGIN + g.idealX * scale;
                return (
                  <path
                    key={`expert-${index}`}
                    d={g.pathData}
                    transform={`translate(${xPos}, ${baselineY}) scale(${scale})`}
                    className="glyph-path-compare expert"
                  />
                );
              })}
            </g>
          )}

          {/* 2. User solution (Your Spacing) in White (in 'both' or 'user' mode) */}
          {(viewMode === 'both' || viewMode === 'user') && (
            <g className="user-group">
              {glyphs.map((g, index) => {
                const xPos = MARGIN + g.currentX * scale;
                return (
                  <path
                    key={`user-${index}`}
                    d={g.pathData}
                    transform={`translate(${xPos}, ${baselineY}) scale(${scale})`}
                    className="glyph-path-compare user"
                    style={{
                      fill: '#ffffff',
                      fillOpacity: viewMode === 'both' ? 0.85 : 1
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* 3. Expert solution in White (in 'expert' mode only) */}
          {viewMode === 'expert' && (
            <g className="expert-solo-group">
              {glyphs.map((g, index) => {
                const xPos = MARGIN + g.idealX * scale;
                return (
                  <path
                    key={`expert-solo-${index}`}
                    d={g.pathData}
                    transform={`translate(${xPos}, ${baselineY}) scale(${scale})`}
                    style={{ fill: '#ffffff', fillOpacity: 1 }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Footer Block matching original design */}
      <div className="game-footer-container">
        
        {/* Left Side: View Toggles & Font Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Radio Button Controls (Image 1 style) */}
          <div className="view-radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                name="viewMode" 
                checked={viewMode === 'both'} 
                onChange={() => setViewMode('both')} 
              />
              <span className="radio-custom"></span>
              Both
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="viewMode" 
                checked={viewMode === 'expert'} 
                onChange={() => setViewMode('expert')} 
              />
              <span className="radio-custom"></span>
              Solution
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="viewMode" 
                checked={viewMode === 'user'} 
                onChange={() => setViewMode('user')} 
              />
              <span className="radio-custom"></span>
              Your spacing
            </label>
          </div>

          {/* Font Details metadata */}
          <div className="font-meta-block">
            <div className="meta-row">
              <span className="meta-label">Typeface</span>
              <span className="meta-value font-name-preview">{fontMetadata.name}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Creator</span>
              <span className="meta-value">{fontMetadata.designer}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Year</span>
              <span className="meta-value">{fontMetadata.year}</span>
            </div>
          </div>
        </div>

        {/* Center: The score display */}
        <div className="comparison-score-block">
          <span className="score-label">Your score</span>
          <div className="score-val-row">
            <span className="score-num">{Math.round(animatedScore)}</span>
            <span className="score-total">/100</span>
          </div>
        </div>

        {/* Right Side: Next Level Button */}
        <div className="actions-block">
          <button className="btn-done" onClick={onNext}>
            {isLastLevel ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
