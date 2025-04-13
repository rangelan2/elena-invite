'use client';

import React, { useState } from 'react';
import Game from './components/Game';
import GameHUD from './components/GameHUD';
import HighScoreForm from './components/HighScoreForm';
import HighScoreList from './components/HighScoreList';
import { useRouter } from 'next/navigation';

export default function PlayPage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  
  // Function to handle game restart
  const handleRestart = () => {
    console.log("Game restart requested, incrementing game key");
    // Clear all forms and overlays first
    setShowScoreForm(false);
    setShowLeaderboard(false);
    
    // Then reset game state in parent
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
    
    // Increment key to force Game component re-mount
    setGameKey(prevKey => prevKey + 1);
  };

  // Function to update score
  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };

  // Function to handle game over
  const handleGameOver = (finalScore) => {
    console.log("Game over handled with score:", finalScore);
    setGameOver(true);
    setGameStarted(false);
    setFinalScore(finalScore);
    
    // Always show the score submission form for testing
    console.log("Force showing submission form for testing");
    // First close any open leaderboard to avoid UI conflicts
    setShowLeaderboard(false);
    // Then show the score form immediately
    console.log("Setting showScoreForm to true");
    setShowScoreForm(true);
    
    // // Original logic (commented out for testing):
    // if (finalScore > 0) {
    //   console.log("Score > 0, showing submission form");
    //   // First close any open leaderboard to avoid UI conflicts
    //   setShowLeaderboard(false);
    //   // Then show the score form immediately
    //   console.log("Setting showScoreForm to true");
    //   setShowScoreForm(true);
    // } else {
    //   console.log("Score is 0, not showing form");
    // }
  };

  // Function to close the score form
  const handleCloseScoreForm = () => {
    setShowScoreForm(false);
  };

  // Function to show leaderboard
  const handleShowLeaderboard = () => {
    console.log("Show leaderboard button clicked");
    // Close the score form if it's open
    if (showScoreForm) {
      setShowScoreForm(false);
    }
    // Short delay for UI transition
    setTimeout(() => {
      setShowLeaderboard(true);
      console.log("Leaderboard visibility set to true");
    }, 100);
  };

  // Function to handle when score is successfully submitted
  const handleScoreSubmitted = () => {
    console.log("Score submitted successfully!");
    // Show the leaderboard after successful submission
    setShowScoreForm(false);
    setTimeout(() => {
      console.log("Opening leaderboard after score submission");
      setShowLeaderboard(true);
    }, 500);
  };

  // Debug output for key states
  console.log("Main page state:", { 
    score, 
    finalScore,
    gameStarted, 
    gameOver, 
    showScoreForm, 
    showLeaderboard 
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Bonus Minigame</h1>
      
      <div className="w-full max-w-md relative">
        <Game 
          key={gameKey}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          showLeaderboard={showLeaderboard}
          onShowLeaderboard={handleShowLeaderboard}
          onCloseLeaderboard={() => setShowLeaderboard(false)}
          onRestartRequest={handleRestart}
        />
        
        <GameHUD 
          score={score}
          highScore={highScore}
          gameStarted={gameStarted}
          gameOver={gameOver}
          onRestart={handleRestart}
          onShowLeaderboard={handleShowLeaderboard}
        />
      </div>
      
      {/* Move HighScoreForm outside the relative div to prevent positioning issues */}
      <HighScoreForm 
        show={showScoreForm}
        onClose={handleCloseScoreForm}
        score={finalScore}
        onSubmitted={handleScoreSubmitted}
      />
      
      {/* Add the HighScoreList component */}
      <HighScoreList 
        show={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)}
      />
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Built with ❤️ by the happy couple. Have fun!</p>
      </footer>
    </main>
  );
} 