'use client';

/**
 * Handles keyboard input for jumping and game control
 */
export function handleKeyDown(e, {
  waitingToStart,
  setWaitingToStart,
  gameStarted,
  gameOver,
  gameStateRef,
  playFlap,
  onStartGame
}) {
  // Space bar to jump
  if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
    e.preventDefault();
    
    // Start game if waiting
    if (waitingToStart) {
      setWaitingToStart(false);
      if (onStartGame) onStartGame();
      return;
    }
    
    // Normal gameplay jump
    if (gameStarted && !gameOver) {
      // Prevent jump spamming with a small cooldown
      if (gameStateRef.current.jumpCooldown > 0) return;
      
      // Apply jump force
      gameStateRef.current.player.velocity = gameStateRef.current.player.jump;
      gameStateRef.current.jumpCooldown = gameStateRef.current.maxJumpCooldown;
      playFlap();
    }
  }
}

/**
 * Handles click and touch events for jumping and game start
 */
export function handleCanvasInteraction(e, {
  waitingToStart,
  setWaitingToStart,
  gameStarted,
  gameOver,
  gameStateRef,
  playFlap,
  isMobile,
  onStartGame,
  touchTimeoutRef
}) {
  // Prevent default to avoid unwanted scrolling
  e.preventDefault();
  
  // Throttle touch events for better performance
  if (touchTimeoutRef.current) return;
  touchTimeoutRef.current = setTimeout(() => {
    touchTimeoutRef.current = null;
  }, 100);
  
  // Start game if waiting
  if (waitingToStart) {
    setWaitingToStart(false);
    if (onStartGame) onStartGame();
    return;
  }
  
  // Normal gameplay jump
  if (gameStarted && !gameOver) {
    if (gameStateRef.current.jumpCooldown > 0) return;
    
    // Mobile-optimized jump force
    const jumpForce = isMobile 
      ? gameStateRef.current.player.jump * 1.1 
      : gameStateRef.current.player.jump;
    
    gameStateRef.current.player.velocity = jumpForce;
    gameStateRef.current.jumpCooldown = gameStateRef.current.maxJumpCooldown;
    playFlap();
  }
}

/**
 * Sets up event listeners for input handling
 */
export function setupInputHandlers({
  handleKeyDown,
  handleCanvasInteraction,
  preventDefaultForCanvas,
  touchTimeoutRef
}) {
  // Add event listeners
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('touchstart', preventDefaultForCanvas, { passive: false });
  document.addEventListener('touchmove', preventDefaultForCanvas, { passive: false });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('touchstart', preventDefaultForCanvas);
    document.removeEventListener('touchmove', preventDefaultForCanvas);
    
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };
} 