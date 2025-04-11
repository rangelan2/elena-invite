'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';

export default function Play() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Simple styles for consistent text rendering
  const textStyle = {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  // Handle space bar in the score form
  const handleKeyDown = useCallback((e) => {
    // For game over screen, allow restarting with space
    if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && gameOver && !showScoreForm) {
      e.preventDefault();
      handleRestart();
    }
    
    // Allow submitting score form with Enter key
    if (e.key === 'Enter' && showScoreForm) {
      e.preventDefault();
      if (nameInput) {
        handleSubmitScore(e);
      }
    }
  }, [gameOver, showScoreForm, nameInput]);

  // Load high scores from localStorage on component mount
  useEffect(() => {
    try {
      const storedScores = localStorage.getItem("flappyHighScores");
      if (storedScores) {
        setHighScores(JSON.parse(storedScores));
      }
      const storedHighScore = localStorage.getItem("flappyHighScore");
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore));
      }
    } catch (error) {
      console.error("Error loading high scores:", error);
    }
    
    // Add global keyboard handler
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleGameOver = (finalScore) => {
    setGameOver(true);
    setShowScoreForm(finalScore > 5); // Only show score form if score is worth saving
    
    // Update high score if necessary
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("flappyHighScore", finalScore.toString());
    }
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const handleRestart = () => {
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
    setShowScoreForm(false);
  };

  const handleSubmitScore = (e) => {
    if (e) e.preventDefault();
    if (!nameInput) return;
    
    const newHighScores = [...highScores, { name: nameInput, score }];
    newHighScores.sort((a, b) => b.score - a.score);
    
    // Only keep top 10 scores
    const topScores = newHighScores.slice(0, 10);
    
    setHighScores(topScores);
    localStorage.setItem("flappyHighScores", JSON.stringify(topScores));
    
    setNameInput("");
    setShowScoreForm(false);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#70C5CE] touch-none" 
      tabIndex="0"
    >
      {/* Game Canvas */}
      <GameCanvas 
        onGameOver={handleGameOver} 
        onScoreUpdate={handleScoreUpdate}
      />
      
      {/* HUD Elements */}
      <GameHUD 
        score={score}
        highScore={highScore}
        gameStarted={gameStarted}
        gameOver={gameOver}
        onRestart={handleRestart}
      />
      
      {/* Score submission form */}
      {showScoreForm && gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 px-4">
          <div className="bg-[#DEA430] border-4 border-black rounded-xl p-4 sm:p-6 max-w-xs mx-auto text-center shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4" style={textStyle}>NEW SCORE!</h2>
            <p className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3" style={textStyle}>Score: {score}</p>
            
            <form onSubmit={handleSubmitScore} className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="NAME"
                className="border-2 border-black p-2 rounded w-full bg-white text-center uppercase"
                style={{ ...textStyle, fontSize: '14px' }}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.substring(0, 10))}
                maxLength={10}
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg border-b-4 border-green-700 hover:bg-green-600 transition"
                  style={{ ...textStyle, fontSize: '14px' }}
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setShowScoreForm(false)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg border-b-4 border-red-700 hover:bg-red-600 transition"
                  style={{ ...textStyle, fontSize: '14px' }}
                >
                  SKIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* High scores display - only show before game has started */}
      {!gameStarted && !gameOver && highScores.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-[#DEA430] border-2 border-black rounded-lg px-4 py-3 shadow-md max-w-xs">
          <h3 className="text-xl font-bold mb-2 text-white" style={textStyle}>TOP SCORES</h3>
          <div className="bg-white border-2 border-black p-2 rounded">
            <ul className="space-y-2">
              {highScores.slice(0, 5).map((entry, idx) => (
                <li key={idx} className="text-black flex justify-between text-sm" style={{ ...textStyle, fontSize: '10px' }}>
                  <span>{idx + 1}. {entry.name}</span>
                  <span className="font-bold">{entry.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}