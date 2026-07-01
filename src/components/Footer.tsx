import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container animate-fade-in">
      <div className="footer-content">
        <p className="credits">
          Yapan:{' '}
          <a 
            href="https://github.com/Lowuentos" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            Lowuentos
          </a>{' '}
          • Esinlenme:{' '}
          <a 
            href="https://type.method.ac" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            Kern Type by method.ac
          </a>
        </p>
        <p className="educational-note">
          Tipografide görsel denge (optik aralık), matematiksel eşitlikten daha önemlidir. Harflerin arasındaki beyaz alanın (negatif alan) hacmini dengelemeyi öğrenin.
        </p>
      </div>
    </footer>
  );
};
