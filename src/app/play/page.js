'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import HighScoreList from './components/HighScoreList';
import { addHighScore, getHighestPersonalScore } from './components/ScoreService';

export default function Play() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDebugButton, setShowDebugButton] = useState(false);

  // Simple styles for consistent text rendering
  const textStyle = {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  // Update viewport height on resize and check if we're on mobile
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
      // Force redraw by updating CSS var
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      // Check if we're on mobile
      setIsMobile(window.innerWidth < 640);
    };
    
    // Set initial height
    updateViewportHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  // Handle space bar in the score form
  const handleKeyDown = useCallback((e) => {
    // For game over screen, allow restarting with space
    if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && gameOver && !showScoreForm && !showLeaderboard) {
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

    // Close leaderboard with Escape key
    if (e.key === 'Escape' && showLeaderboard) {
      e.preventDefault();
      setShowLeaderboard(false);
    }
  }, [gameOver, showScoreForm, nameInput, showLeaderboard]);

  // Load high scores on component mount
  useEffect(() => {
    // Get the personal high score
    async function loadHighScore() {
      const personalBest = await getHighestPersonalScore();
      if (personalBest > 0) {
        setHighScore(personalBest);
      }
    }
    
    loadHighScore();
    
    // Add global keyboard handler
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleGameOver = (finalScore) => {
    setGameOver(true);
    
    // Only show score form if the score is greater than 0
    if (finalScore > 0) {
      setShowScoreForm(true);
    } else {
      setShowScoreForm(false);
    }
    
    // Update high score if necessary
    if (finalScore > highScore) {
      setHighScore(finalScore);
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
    setShowLeaderboard(false);
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  const handleSubmitScore = async (e) => {
    if (e) e.preventDefault();
    if (!nameInput || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Save score to our score service
      await addHighScore(nameInput, score);
      
      // Close score form
      setShowScoreForm(false);
      // Automatically show leaderboard after submitting
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Try to load or get player name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && showScoreForm) {
      const savedName = localStorage.getItem('flappyPlayerName');
      if (savedName) {
        setNameInput(savedName);
      } else {
        // Clear the input if no saved name exists
        setNameInput('');
      }
    }
  }, [showScoreForm]);

  // Save player name when they enter it
  const updatePlayerName = (name) => {
    setNameInput(name);
    // Save the name for future games
    if (typeof window !== 'undefined') {
      localStorage.setItem('flappyPlayerName', name);
    }
  };

  return (
    <div 
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#70C5CE] touch-none" 
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100vh' }}
      tabIndex="0"
    >
      {/* Game Canvas */}
      <div className="relative flex-grow w-full flex items-center justify-center">
        <GameCanvas 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleScoreUpdate}
          showScoreForm={showScoreForm}
        />
      
        {/* HUD Elements */}
        <GameHUD 
          score={score}
          highScore={highScore}
          gameStarted={gameStarted}
          gameOver={gameOver}
          onRestart={handleRestart}
          onShowLeaderboard={toggleLeaderboard}
        />
      </div>
      
      {/* Leaderboard button - only show on start screen or game over screen */}
      {(!gameStarted || gameOver) && !showScoreForm && !showLeaderboard && (
        <div className="absolute bottom-4 z-10">
          <button
            onClick={toggleLeaderboard}
            className="bg-[#DEA430] border-2 border-black text-black font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#F5BB40] transition-colors"
            style={textStyle}
          >
            VIEW LEADERBOARD
          </button>
        </div>
      )}
      
      {/* Score submission form */}
      {showScoreForm && gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 px-4">
          <div className="bg-[#DEA430] border-4 border-black rounded-xl p-4 sm:p-6 max-w-xs mx-auto text-center shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4" style={textStyle}>NEW SCORE!</h2>
            <p className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3" style={textStyle}>Score: {score}</p>
            
            <form onSubmit={handleSubmitScore} className="mt-4 space-y-2">
              <label htmlFor="player-name" className="block text-black text-sm font-bold mb-1" style={textStyle}>
                ENTER YOUR NAME:
              </label>
              <input
                id="player-name"
                type="text"
                placeholder="YOUR NAME HERE"
                className="border-2 border-black p-2 rounded w-full bg-white text-center uppercase text-black"
                style={{ ...textStyle, fontSize: '14px' }}
                value={nameInput}
                onChange={(e) => updatePlayerName(e.target.value.substring(0, 15))}
                maxLength={15}
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !nameInput.trim()}
                  className={`flex-1 text-white px-4 py-2 rounded-lg border-b-4 transition ${
                    isSubmitting || !nameInput.trim()
                      ? 'bg-gray-400 border-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 border-green-800 hover:bg-green-700'
                  }`}
                  style={{ ...textStyle, fontSize: '14px' }}
                >
                  {isSubmitting ? 'SAVING...' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreForm(false);
                    setShowLeaderboard(true);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg border-b-4 border-red-800 hover:bg-red-700 transition"
                  style={{ ...textStyle, fontSize: '14px' }}
                >
                  SKIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Leaderboard modal */}
      {showLeaderboard && (
        <HighScoreList 
          show={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}
    </div>
  );
}