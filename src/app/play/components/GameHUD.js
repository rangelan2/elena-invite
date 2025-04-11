'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GameHUD = ({ score, highScore, gameStarted, gameOver, onRestart }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Pixel font style that can be reused - use a fallback font chain
  const pixelFontStyle = {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };
  
  // Style with black outline for better text visibility
  const textWithOutline = {
    ...pixelFontStyle,
    textShadow: '2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000'
  };
  
  // Handle space bar press for instructions screen
  useEffect(() => {
    const handleSpaceBar = (e) => {
      if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && showInstructions && !gameStarted) {
        e.preventDefault();
        setShowInstructions(false);
      }
    };

    window.addEventListener('keydown', handleSpaceBar);
    return () => {
      window.removeEventListener('keydown', handleSpaceBar);
    };
  }, [showInstructions, gameStarted]);
  
  useEffect(() => {
    if (gameStarted) {
      setShowInstructions(false);
    }
  }, [gameStarted]);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score display is now handled in GameCanvas */}
      
      {/* Instructions overlay */}
      {showInstructions && !gameStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <div className="mb-4 w-full max-w-xs text-center bg-[#DEA430] border-4 border-black rounded-xl p-6 shadow-lg">
            <h2 className="text-4xl text-white mb-4" style={textWithOutline}>
              FLAPPY BIRD
            </h2>
            <p className="text-white mb-4" style={textWithOutline}>
              Tap or press SPACE to flap your wings
            </p>
            <p className="text-white mb-6" style={textWithOutline}>
              Avoid the pipes and survive!
            </p>
            <button
              onClick={() => setShowInstructions(false)}
              className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-md border-b-4 border-yellow-600 hover:bg-yellow-500 transition pointer-events-auto"
              style={pixelFontStyle}
              aria-label="Start game"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
      
      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <div className="bg-[#DEA430] border-4 border-black rounded-xl p-4 sm:p-6 max-w-md mx-4 sm:mx-auto text-center shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4" style={pixelFontStyle}>GAME OVER</h2>
            
            <div className="bg-[#4EC0CA] border-2 border-black p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <div className="mb-2">
                <span className="text-white text-sm sm:text-base" style={pixelFontStyle}>SCORE</span>
                <div className="bg-white border-2 border-black rounded-md p-1 sm:p-2 mt-1">
                  <span className="text-xl sm:text-2xl text-black" style={pixelFontStyle}>{score}</span>
                </div>
              </div>
              
              <div>
                <span className="text-white text-sm sm:text-base" style={pixelFontStyle}>BEST</span>
                <div className="bg-white border-2 border-black rounded-md p-1 sm:p-2 mt-1">
                  <span className="text-xl sm:text-2xl text-black" style={pixelFontStyle}>{highScore}</span>
                </div>
              </div>
            </div>
            
            {/* Wedding Announcement */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3" style={pixelFontStyle}>You did it! 🎉</h3>
              <p className="text-sm sm:text-base text-black mb-3 sm:mb-4" style={pixelFontStyle}>
                You made it through each chapter of memories…
              </p>
              <p className="text-sm sm:text-base text-black mb-3 sm:mb-4" style={pixelFontStyle}>
                And unlocked the sweetest secret of all.
              </p>
              
              <div className="border-t-2 border-black my-3 sm:my-4"></div>
              
              <h3 className="text-lg sm:text-xl font-bold text-black mb-1 sm:mb-2" style={pixelFontStyle}>Save the date!</h3>
              <p className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3" style={pixelFontStyle}>May 16, 2026</p>
              <p className="text-xs sm:text-sm text-black mb-1" style={pixelFontStyle}>
                Mark your calendar — we can't wait
              </p>
              <p className="text-xs sm:text-sm text-black mb-3 sm:mb-4" style={pixelFontStyle}>
                to gather again with you.
              </p>
              
              <div className="border-t-2 border-black my-3 sm:my-4"></div>
              
              <p className="text-xs text-black italic" style={pixelFontStyle}>
                Because this story still has chapters left to write — 
                and we want you in the next one.
              </p>
            </div>
            
            <div className="flex gap-2 sm:gap-4 justify-center">
              <button
                onClick={onRestart}
                className="pointer-events-auto bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg border-b-4 border-green-700 hover:bg-green-600 transition"
                style={{ ...pixelFontStyle, fontSize: '13px' }}
              >
                PLAY
              </button>
              
              <Link 
                href="/" 
                className="pointer-events-auto bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg border-b-4 border-blue-700 hover:bg-blue-600 transition text-center"
                style={{ ...pixelFontStyle, fontSize: '13px' }}
              >
                BACK TO RSVP
              </Link>
            </div>
          </div>
          
          {/* Medal display if score is good */}
          {score >= 10 && (
            <div className="absolute left-1/4 transform -translate-x-1/2 translate-y-1/4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 
                ${score >= 40 ? 'bg-yellow-400 border-yellow-600' : 
                  score >= 30 ? 'bg-gray-300 border-gray-500' : 
                  score >= 20 ? 'bg-yellow-600 border-yellow-800' : 
                  'bg-gray-500 border-gray-700'}`}
              >
                <span className="text-white font-bold text-xs" style={pixelFontStyle}>
                  {score >= 40 ? 'PLAT' : 
                   score >= 30 ? 'GOLD' : 
                   score >= 20 ? 'SILV' : 
                   'BRNZ'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameHUD; 