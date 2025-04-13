'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GAME_STATES, 
  GAME_SETTINGS, 
  createInitialGameState, 
  handleGameInput, 
  updateGame,
  resetGame
} from './utils/gameStateUtils';
import { renderGame, preloadAssets } from './utils/renderUtils';

/**
 * Main Game component that handles the game canvas and game loop
 */
export default function Game({ 
  onScoreUpdate, 
  onGameOver, 
  showLeaderboard, 
  onShowLeaderboard, 
  onCloseLeaderboard
}) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameState, setGameState] = useState(createInitialGameState());
  const [assets, setAssets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [scoreData, setScoreData] = useState({ score: 0, highScore: 0 });
  
  // Keep game state in ref to avoid re-renders
  const gameStateRef = useRef(gameState);
  
  // Store button hitboxes for Game Over screen
  const buttonAreasRef = useRef({
    playAgainButton: null
  });

  // Update gameStateRef when initial state is set
  useEffect(() => {
    gameStateRef.current = gameState;
  }, []);

  // Load assets when component mounts
  useEffect(() => {
    let isMounted = true;
    
    async function loadAssets() {
      if (!isMounted) return;
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const loadedAssets = await preloadAssets();
        if (isMounted) {
          setAssets(loadedAssets);
        }
      } catch (error) {
        console.error('Failed to load assets:', error);
        if (isMounted) {
          setLoadError('Failed to load game assets. Please try refreshing the page.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadAssets();
    
    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Inside the Game component, add a function to manually increment score for testing
  useEffect(() => {
    // Function to manually increment score (for testing)
    const incrementScore = (e) => {
      if (e.key === 'i' && gameStateRef.current.gameState === GAME_STATES.PLAYING) {
        console.log("Manually incrementing score");
        gameStateRef.current.score += 1;
        if (onScoreUpdate) {
          onScoreUpdate(gameStateRef.current.score);
        }
      }
    };

    window.addEventListener('keydown', incrementScore);
    return () => {
      window.removeEventListener('keydown', incrementScore);
    };
  }, [onScoreUpdate]);

  // Update the handleTap function to set the game state to PLAYING if it's in MENU or READY state
  const handleTap = useCallback((e) => {
    // If on game over screen, check if buttons were clicked
    if (gameStateRef.current.gameState === GAME_STATES.GAME_OVER) {
      
      // Get canvas and calculate click position relative to canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let x, y;
      
      // Handle both mouse click and touch events
      if (e.type === 'touchstart') {
        e.preventDefault(); 
        x = (e.touches[0].clientX - rect.left) * scaleX;
        y = (e.touches[0].clientY - rect.top) * scaleY;
      } else if (e.type === 'click') {
        x = (e.clientX - rect.left) * scaleX;
        y = (e.clientY - rect.top) * scaleY;
      } else {
        // Handle keyboard space/up arrow as Play Again for accessibility
        if (e.type === 'keyboard' && (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp')) {
          console.log("Play Again triggered by keyboard, resetting game");
          // Use the resetGame utility function
          gameStateRef.current = resetGame(gameStateRef.current);
          return; 
        }
        return;
      }
      
      console.log("Canvas click/touch detected at:", x, y);
      console.log("Button areas:", buttonAreasRef.current);
      
      // Check if Play Again button (drawn on canvas) was clicked
      const playAgainBtn = buttonAreasRef.current.playAgainButton;
      if (playAgainBtn && 
          x >= playAgainBtn.x && 
          x <= playAgainBtn.x + playAgainBtn.width && 
          y >= playAgainBtn.y && 
          y <= playAgainBtn.y + playAgainBtn.height) {
        console.log("Play Again button (canvas fallback) clicked, resetting game");
        // Use the resetGame utility function
        gameStateRef.current = resetGame(gameStateRef.current);
        return; // Exit after handling click
      }
    }
    
    // If in MENU or READY state, set to PLAYING
    if (gameStateRef.current.gameState === GAME_STATES.MENU || 
        gameStateRef.current.gameState === GAME_STATES.READY) {
      console.log("Starting game");
      gameStateRef.current.gameState = GAME_STATES.PLAYING;
      gameStateRef.current = handleGameInput(gameStateRef.current);
      return; 
    }
    
    // Regular game input handling (only if playing)
    if (gameStateRef.current.gameState === GAME_STATES.PLAYING) {
        gameStateRef.current = handleGameInput(gameStateRef.current);
    }

  }, []);

  // Start game loop once assets are loaded and canvas is ready
  useEffect(() => {
    if (isLoading || !canvasRef.current || !assets) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Track if component is still mounted
    let isMounted = true;
    
    // Game loop function that updates the ref without triggering re-renders
    const gameLoop = (timestamp) => {
      try {
        // Calculate delta time
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
        }
        
        // Update game state in the ref (no re-render)
        const newState = updateGame(gameStateRef.current, timestamp);
        
        // Store previous scores to check for changes
        const prevScore = gameStateRef.current.score;
        const prevHighScore = gameStateRef.current.highScore;
        // Store previous game state *before* updating the ref
        const prevGameState = gameStateRef.current.gameState;
        
        // Update the ref
        gameStateRef.current = newState;
        
        // Only update React state when scores change and component is mounted
        if (isMounted && (prevScore !== newState.score || prevHighScore !== newState.highScore)) {
          // Batch score updates together to prevent multiple re-renders
          setScoreData({
            score: newState.score,
            highScore: newState.highScore
          });
          
          // Call onScoreUpdate prop with new score
          if (onScoreUpdate) {
            onScoreUpdate(newState.score);
          }
        }
        
        // Check if game state changed to GAME_OVER
        // Read the new game state from the updated ref (or newState)
        const newGameState = gameStateRef.current.gameState;
        
        if (prevGameState !== GAME_STATES.GAME_OVER && 
            newGameState === GAME_STATES.GAME_OVER) {
          // Get the final score
          const finalScore = newState.score;
          
          if (onGameOver) {
            // Pass the final score to the callback
            onGameOver(finalScore);
          }
        }
        
        // Render the game using the ref state and store returned button areas
        const buttonAreas = renderGame(ctx, gameStateRef.current, assets);
        buttonAreasRef.current = buttonAreas || {}; // Update button areas, default to empty object if null
        
        // Continue the loop
        if (isMounted) {
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
      } catch (error) {
        console.error('Error in game loop:', error);
        // Try to continue the game loop despite the error
        if (isMounted) {
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
      }
    };
    
    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    // Mouse/touch events
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', handleTap);
    
    // Keyboard events
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        handleTap({ type: 'keyboard' });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      canvas.removeEventListener('click', handleTap);
      canvas.removeEventListener('touchstart', handleTap);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, assets, handleTap, onScoreUpdate, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      {isLoading ? (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Loading Game...</h2>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : loadError ? (
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{loadError}</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Reload Game
          </button>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GAME_SETTINGS.CANVAS_WIDTH}
            height={GAME_SETTINGS.CANVAS_HEIGHT}
            className="border border-gray-300 rounded-lg shadow-lg"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              touchAction: 'none', // Prevents default touch actions
              backgroundColor: '#4dc6ff' // Fallback background color
            }}
          />
        </div>
      )}
      
      {!isLoading && !loadError && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 mb-4">
            <p>Tap, click, or press Space/Up Arrow to play</p>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <button 
              onClick={onShowLeaderboard}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-bold border-b-4 border-yellow-700 hover:border-yellow-800 transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-2"
            >
              View Leaderboard
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-bold border-b-4 border-blue-700 hover:border-blue-800 transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-2"
            >
              Back to RSVP
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 