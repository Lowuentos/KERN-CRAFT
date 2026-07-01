import React from 'react';

interface HeaderProps {
  currentLevel: number;
  totalLevels: number | null; // null for infinite mode
  onRestartGame: () => void;
  onShowInstructions: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  totalLevels,
  onRestartGame,
  onShowInstructions
}) => {
  return (
    <header className="header-container animate-fade-in">
      <div className="logo" onClick={onRestartGame}>
        <span className="logo-title">Kern Craft</span>
        <span className="logo-desc">a letter spacing game</span>
      </div>

      <div className="header-right">
        {totalLevels && (
          <div className="status-badge">
            {currentLevel} / {totalLevels}
          </div>
        )}
        {!totalLevels && (
          <div className="status-badge">
            Sonsuz Mod — Kelime {currentLevel}
          </div>
        )}
        
        <button 
          className="btn-text-only" 
          onClick={onShowInstructions}
        >
          Nasıl Oynanır?
        </button>
      </div>
    </header>
  );
};
