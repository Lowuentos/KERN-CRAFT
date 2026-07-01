import React, { useState, useEffect, useRef } from 'react';
import type { FontMetadata, GlyphPosition } from '../types';
import { Font } from 'opentype.js';

interface GameScreenProps {
  fontMetadata: FontMetadata;
  font: Font;
  glyphs: GlyphPosition[];
  onUpdateGlyphs: (newGlyphs: GlyphPosition[]) => void;
  onDone: () => void;
  onSkip: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  fontMetadata,
  font,
  glyphs,
  onUpdateGlyphs,
  onDone,
  onSkip
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartGlyphX, setDragStartGlyphX] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG viewport dimensions
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 380;
  const MARGIN = 80;
  const TARGET_WIDTH = SVG_WIDTH - 2 * MARGIN;

  // Compute scale and baseline Y based on the font geometry
  const totalUnscaledWidth = glyphs.length > 0 
    ? glyphs[glyphs.length - 1].idealX + glyphs[glyphs.length - 1].advanceWidth 
    : 1000;
  
  const scale = TARGET_WIDTH / totalUnscaledWidth;
  const ascender = font.ascender;
  const descender = font.descender;
  
  // Center baseline Y vertically
  const baselineY = (SVG_HEIGHT / 2) + ((ascender + descender) / 2) * scale;

  // Handle global mouse/touch listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingIndex !== null) {
        handleMove(e.clientX);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (draggingIndex !== null && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggingIndex !== null) {
        setDraggingIndex(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [draggingIndex, dragStartX, dragStartGlyphX, glyphs]);

  // Keyboard events for precision nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (selectedIndex === null) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
          if (glyphs.length > 2) {
            setSelectedIndex(1);
            e.preventDefault();
          }
        }
        return;
      }

      let nudgeAmount = 1.0 / scale; // ~1px nudge in SVG viewport, converted to font units
      if (e.shiftKey) nudgeAmount *= 8; // Faster nudge

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newX = Math.max(glyphs[0].idealX, glyphs[selectedIndex].currentX - nudgeAmount);
        updateGlyphX(selectedIndex, newX);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newX = Math.min(glyphs[glyphs.length - 1].idealX, glyphs[selectedIndex].currentX + nudgeAmount);
        updateGlyphX(selectedIndex, newX);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const movableCount = glyphs.length - 2;
        if (movableCount <= 0) return;

        let nextSel = selectedIndex;
        if (e.shiftKey) {
          nextSel = selectedIndex - 1;
          if (nextSel < 1) nextSel = glyphs.length - 2;
        } else {
          nextSel = selectedIndex + 1;
          if (nextSel > glyphs.length - 2) nextSel = 1;
        }
        setSelectedIndex(nextSel);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'Enter') {
        onDone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, glyphs, scale]);

  const updateGlyphX = (index: number, newX: number) => {
    const newGlyphs = glyphs.map((g, idx) => 
      idx === index ? { ...g, currentX: newX } : g
    );
    onUpdateGlyphs(newGlyphs);
  };

  const handleMove = (clientX: number) => {
    if (draggingIndex === null) return;

    const svgEl = svgRef.current;
    if (!svgEl) return;

    const rect = svgEl.getBoundingClientRect();
    const deltaXPixels = clientX - dragStartX;
    const svgToScreenRatio = SVG_WIDTH / rect.width;
    const deltaXSvg = deltaXPixels * svgToScreenRatio;
    const deltaXFont = deltaXSvg / scale;

    let newX = dragStartGlyphX + deltaXFont;

    const minBound = glyphs[0].currentX;
    const maxBound = glyphs[glyphs.length - 1].currentX;

    if (newX < minBound) newX = minBound;
    if (newX > maxBound) newX = maxBound;

    updateGlyphX(draggingIndex, newX);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.preventDefault();
    setDraggingIndex(index);
    setSelectedIndex(index);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragStartGlyphX(glyphs[index].currentX);
  };

  const handleReset = () => {
    const resetGlyphs = glyphs.map(g => ({
      ...g,
      currentX: g.initialX
    }));
    onUpdateGlyphs(resetGlyphs);
    setSelectedIndex(null);
  };

  return (
    <div className="game-container animate-fade-in-up">
      {/* Dynamic SVG Board */}
      <div className="canvas-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="kerning-svg"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Baseline Grid */}
          <line 
            x1={0} 
            y1={baselineY} 
            x2={SVG_WIDTH} 
            y2={baselineY} 
            className="baseline-grid" 
          />

          {/* Letter Vector Shapes */}
          {glyphs.map((g, index) => {
            const isSelected = selectedIndex === index;
            const isDragging = draggingIndex === index;
            const xPos = MARGIN + g.currentX * scale;

            return (
              <path
                key={index}
                d={g.pathData}
                transform={`translate(${xPos}, ${baselineY}) scale(${scale})`}
                className={`glyph-path ${g.isFixed ? 'fixed-glyph' : 'movable-glyph'} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                onMouseDown={(e) => {
                  if (!g.isFixed) handleMouseDown(e, index);
                }}
                onTouchStart={(e) => {
                  if (!g.isFixed) handleMouseDown(e, index);
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Footer Block matching original design */}
      <div className="game-footer-container">
        
        {/* Left Side: Font Info metadata */}
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

        {/* Right Side: Actions Buttons */}
        <div className="actions-block">
          <button className="btn-text-only" onClick={handleReset}>
            Reset
          </button>
          <button className="btn-text-only" onClick={onSkip}>
            Skip
          </button>
          <button className="btn-done" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
