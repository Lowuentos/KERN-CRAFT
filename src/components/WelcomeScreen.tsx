import React from 'react';

interface WelcomeScreenProps {
  onStartGame: (mode: 'challenge' | 'infinite') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame }) => {
  return (
    <div className="welcome-container animate-fade-in-up">
      <h1 className="welcome-title">Kern Craft</h1>
      
      <div className="mode-selection" style={{ marginTop: '30px', gap: '20px' }}>
        <button 
          className="btn-done" 
          onClick={() => onStartGame('challenge')}
          style={{ padding: '12px 30px', fontSize: '1rem' }}
        >
          Challenge Mode
        </button>

        <button 
          className="btn-done" 
          onClick={() => onStartGame('infinite')}
          style={{ padding: '12px 30px', fontSize: '1rem' }}
        >
          Infinite Mode
        </button>
      </div>
    </div>
  );
};
