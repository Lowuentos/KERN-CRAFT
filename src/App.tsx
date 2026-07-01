import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { ComparisonScreen } from './components/ComparisonScreen';
import { loadFontAndRegister } from './utils/fontLoader';
import { getRandomFont } from './data/fonts';
import { getRandomWord } from './data/words';
import type { LevelState, GameHistoryItem, GlyphPosition } from './types';
import { X } from 'lucide-react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'comparison' | 'scoreboard' | 'loading'>('welcome');
  const [gameMode, setGameMode] = useState<'challenge' | 'infinite'>('challenge');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levelState, setLevelState] = useState<LevelState | null>(null);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string>('Font yükleniyor...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);

  // Load game history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('kern_craft_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to parse saved history:', err);
      }
    }
  }, []);

  // Save game history to localStorage when changed
  const saveHistory = (newHistory: GameHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('kern_craft_history', JSON.stringify(newHistory));
  };

  const startNewGame = (mode: 'challenge' | 'infinite') => {
    setGameMode(mode);
    // If starting a challenge, reset the history for this session?
    // Wait, the localStorage history keeps everything, but we can show stats for all time
    // Let's start from level 1
    startLevel(1, mode);
  };

  const startLevel = async (levelNum: number, mode: 'challenge' | 'infinite') => {
    setGameState('loading');
    setLoadingMessage('Font dosyası indiriliyor ve işleniyor...');
    setErrorMessage(null);

    try {
      const selectedFont = getRandomFont();
      const selectedWord = getRandomWord();

      // Load font via CDN & parse using opentype.js
      const loadedFont = await loadFontAndRegister(selectedFont.id, selectedFont.name, selectedFont.url);
      const font = loadedFont.font;

      // Extract glyphs and calculate default horizontal X positions
      const charArray = selectedWord.split('');
      const glyphsData = charArray.map((char) => {
        const glyph = font.charToGlyph(char);
        return {
          char,
          glyph,
          advanceWidth: glyph.advanceWidth || 0,
          glyphIndex: font.charToGlyphIndex(char)
        };
      });

      // Calculate ideal X offsets (font units) with kerning pairs
      let currentX = 0;
      const idealXOffsets: number[] = [];
      for (let i = 0; i < glyphsData.length; i++) {
        idealXOffsets.push(currentX);
        if (i < glyphsData.length - 1) {
          const nextG = glyphsData[i+1];
          if (nextG) {
            const kern = font.getKerningValue(glyphsData[i].glyph, nextG.glyph);
            currentX += (glyphsData[i].advanceWidth + kern);
          }
        }
      }

      // Randomize middle character offsets (between 2.5% and 8.5% of em size)
      const em = font.unitsPerEm;
      const minShift = em * 0.025;
      const maxShift = em * 0.085;

      const randomizedGlyphs: GlyphPosition[] = glyphsData.map((g, index) => {
        const isFixed = index === 0 || index === glyphsData.length - 1;
        const idealX = idealXOffsets[index];
        let initialX = idealX;

        if (!isFixed) {
          const sign = Math.random() < 0.5 ? -1 : 1;
          const shift = sign * (minShift + Math.random() * (maxShift - minShift));
          initialX = idealX + shift;
        }

        // Vector path centered at origin in font units
        const path = g.glyph.getPath(0, 0, em);
        const pathData = path.toPathData(1);

        return {
          index,
          char: g.char,
          pathData,
          idealX,
          currentX: initialX,
          initialX,
          isFixed,
          advanceWidth: g.advanceWidth,
          glyphIndex: g.glyphIndex
        };
      });

      setLevelState({
        word: selectedWord,
        fontMetadata: selectedFont,
        font,
        glyphs: randomizedGlyphs,
        isCompleted: false,
        score: 0,
        individualScores: []
      });

      setGameMode(mode);
      setCurrentLevel(levelNum);
      setGameState('playing');
    } catch (err) {
      console.error('Failed to load level:', err);
      setErrorMessage('Font ve kelime yüklenirken bir ağ bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      setGameState('welcome');
    }
  };

  const handleUpdateGlyphs = (newGlyphs: GlyphPosition[]) => {
    if (!levelState) return;
    setLevelState({
      ...levelState,
      glyphs: newGlyphs
    });
  };

  const handleDone = () => {
    if (!levelState || !levelState.font) return;
    
    const { glyphs, font } = levelState;
    const em = font.unitsPerEm;
    const tolerance = em * 0.02; // 2% em size tolerance for scoring

    // Get only movable glyphs
    const movableGlyphs = glyphs.filter(g => !g.isFixed);
    if (movableGlyphs.length === 0) return;

    // Calculate Gaussian score per letter
    const individualScores = movableGlyphs.map(g => {
      const deviation = Math.abs(g.currentX - g.idealX);
      const score = 100 * Math.exp(-0.5 * Math.pow(deviation / tolerance, 2));
      return Math.round(score);
    });

    const averageScore = Math.round(
      individualScores.reduce((sum, s) => sum + s, 0) / individualScores.length
    );

    setLevelState({
      ...levelState,
      isCompleted: true,
      score: averageScore,
      individualScores
    });

    // Add to history
    const historyItem: GameHistoryItem = {
      id: `${Date.now()}-${levelState.word}`,
      word: levelState.word,
      fontName: levelState.fontMetadata.name,
      score: averageScore,
      category: levelState.fontMetadata.category
    };

    saveHistory([historyItem, ...history]);
    setGameState('comparison');
  };

  const handleSkip = () => {
    startLevel(currentLevel, gameMode);
  };

  const handleNextLevel = () => {
    if (gameMode === 'challenge') {
      if (currentLevel >= 10) {
        setGameState('scoreboard');
      } else {
        startLevel(currentLevel + 1, 'challenge');
      }
    } else {
      startLevel(currentLevel + 1, 'infinite');
    }
  };

  const handleRestart = () => {
    setGameState('welcome');
    setLevelState(null);
  };

  // Stat calculations
  const totalPlayed = history.length;
  const averageScore = totalPlayed > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / totalPlayed)
    : null;

  return (
    <div className="App">
      <Header
        currentLevel={currentLevel}
        totalLevels={gameMode === 'challenge' ? 10 : null}
        onRestartGame={handleRestart}
        onShowInstructions={() => setShowInstructionsModal(true)}
      />

      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        {errorMessage && (
          <div className="error-banner animate-fade-in">
            <p>{errorMessage}</p>
            <button className="btn-secondary" onClick={handleRestart}>Ana Menüye Dön</button>
          </div>
        )}

        {/* LOADING STATE */}
        {gameState === 'loading' && (
          <div className="loader-container animate-fade-in">
            <div className="spinner"></div>
            <p className="loading-msg">{loadingMessage}</p>
          </div>
        )}

        {/* WELCOME / LANDING STATE */}
        {(gameState === 'welcome' || gameState === 'scoreboard') && !errorMessage && (
          <WelcomeScreen onStartGame={startNewGame} />
        )}

        {/* PLAYING STATE */}
        {gameState === 'playing' && levelState && levelState.font && !errorMessage && (
          <GameScreen
            fontMetadata={levelState.fontMetadata}
            font={levelState.font}
            glyphs={levelState.glyphs}
            onUpdateGlyphs={handleUpdateGlyphs}
            onDone={handleDone}
            onSkip={handleSkip}
          />
        )}

        {/* COMPARISON / DONE STATE */}
        {gameState === 'comparison' && levelState && levelState.font && !errorMessage && (
          <ComparisonScreen
            fontMetadata={levelState.fontMetadata}
            font={levelState.font}
            glyphs={levelState.glyphs}
            score={levelState.score}
            onNext={handleNextLevel}
            isLastLevel={gameMode === 'challenge' && currentLevel === 10}
          />
        )}

        {/* SCOREBOARD STATE */}
        {gameState === 'scoreboard' && (
          <div className="modal-overlay">
            <div className="summary-popup-card animate-fade-in-up">
              <h2>Your score</h2>
              <div className="score-val-row" style={{ margin: '15px 0' }}>
                <span className="score-num" style={{ fontSize: '4.5rem' }}>{averageScore}</span>
                <span className="score-total" style={{ fontSize: '1.2rem', color: '#8e92a4' }}>/100</span>
              </div>
              <hr />
              
              <button 
                className="btn-twitter"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=I%20scored%20${averageScore}%2F100%20on%20Kern%20Type%2C%20a%20game%20to%20practice%20spacing%20fonts!%20http%3A%2F%2Ftype.method.ac`, '_blank');
                }}
              >
                Tweet your score
              </button>

              <a href="#" className="popup-link" onClick={(e) => { e.preventDefault(); handleRestart(); }}>
                Play again
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* HOW TO PLAY INSTRUCTIONS MODAL */}
      {showInstructionsModal && (
        <div className="instructions-modal-overlay" onClick={() => setShowInstructionsModal(false)}>
          <div className="instructions-modal glass-panel-glow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowInstructionsModal(false)}>
              <X size={20} />
            </button>
            <h2 className="instructions-title" style={{ marginBottom: '20px' }}>
              Kern Craft Nasıl Oynanır?
            </h2>
            <div className="step-text" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                <strong>Amaç:</strong> Ekrandaki kelimede yer alan harfleri yatayda kaydırarak birbirleriyle görsel olarak en dengeli, estetik ve okunaklı boşluğa (kerning) sahip olacak şekilde hizalamaktır.
              </p>
              <p>
                <strong>Harfleri Hareket Ettirme:</strong> Kelimenin en başındaki ve sonundaki harfler sabittir (kilitli). Aradaki harfleri farenizle sürükleyip bırakarak veya parmağınızla kaydırarak hareket ettirebilirsiniz.
              </p>
              <p>
                <strong>Klavye Kontrolleri:</strong> Daha hassas ayarlar için harflere tıklayıp seçebilir, ardından klavyenizdeki <strong>Sol ve Sağ Ok</strong> tuşlarını kullanarak harfleri nudging yapabilirsiniz. <strong>Shift</strong> tuşuna basılı tutarak daha büyük adımlarla hareket ettirebilir, <strong>Tab</strong> tuşuyla sonraki harfe geçiş yapabilirsiniz.
              </p>
              <p>
                <strong>Puanlama:</strong> Düzenlemenizi bitirip <strong>"Bitti"</strong> butonuna bastığınızda, yaptığınız hizalama tipografi uzmanlarının ideal çözümüyle karşılaştırılır ve 100 üzerinden başarı skoru verilir.
              </p>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                İpucu: Harfler arasındaki boşlukların alanını (negatif alan) gözünüzde canlandırmaya çalışın. Dengeli kerning, harflerin aralarındaki boşlukların birbirine hacimsel olarak eşit hissettirdiği durumdur.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
