'use client';

/**
 * Initializes game state with proper timing and physics based on device type
 */
export function initializeGameState(gameStateRef, canvasRef, isMobile, setScore) {
  if (!canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const gameState = gameStateRef.current;
  
  // Reset game state
  gameState.obstacles = [];
  gameState.player.velocity = 0;
  gameState.player.y = canvas.height * 0.5;
  gameState.isGameActive = true;
  
  // Reset score
  setScore(0);
  
  // Set absolute time-based values for obstacle spawning
  // These are in milliseconds and don't depend on frame rate
  if (isMobile) {
    gameState.obstacleSpawnRate = 2200; // ms between pipe spawns on mobile (2.2 seconds)
    gameState.obstacleSpeed = 2; // pixels per frame at 60fps
  } else {
    gameState.obstacleSpawnRate = 1600; // ms between pipe spawns on desktop (1.6 seconds)
    gameState.obstacleSpeed = 3; // pixels per frame at 60fps
  }
  
  // Initialize with no obstacles and a properly set timestamp for first spawn
  gameState.lastObstacleSpawn = performance.now() - (gameState.obstacleSpawnRate * 0.5);
}

/**
 * Draws the waiting/intro screen
 */
export function drawWaitingScreen(canvasRef, gameStateRef, drawBird, drawText) {
  if (!canvasRef.current) return null;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const gameState = gameStateRef.current;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw sky background
  ctx.fillStyle = gameState.colors.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw scrolling ground
  ctx.fillStyle = gameState.colors.ground;
  ctx.fillRect(0, gameState.ground.y, canvas.width, gameState.ground.height);
  
  // Draw ground pattern (8-bit style)
  ctx.fillStyle = '#C0AB72';
  for (let x = 0; x < canvas.width; x += 24) {
    ctx.fillRect(x, gameState.ground.y, 12, 24);
  }
  
  // Update bird animation frame
  gameState.frameTimer++;
  if (gameState.frameTimer >= gameState.frameDelay) {
    gameState.frameTimer = 0;
    gameState.frameIndex = (gameState.frameIndex + 1) % gameState.frameCount;
  }
  
  // Calculate floating animation
  const floatOffset = Math.sin(Date.now() * 0.003) * 10;
  
  // Draw bird at center with floating animation
  const birdX = gameState.player.x;
  const birdY = gameState.player.y + floatOffset;
  drawBird(ctx, birdX, birdY, 0, gameState.frameIndex, gameState);
  
  // Draw instructional text
  try {
    drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 36, gameState, canvasRef);
    drawText(ctx, 'PRESS SPACE', canvas.width / 2, canvas.height / 2, 18, gameState, canvasRef);
    drawText(ctx, 'OR TAP', canvas.width / 2, canvas.height / 2 + 36, 18, gameState, canvasRef);
  } catch (e) {
    console.error('Error rendering text:', e);
    
    // Simple fallback text rendering
    drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 26, gameState, canvasRef, true);
    drawText(ctx, 'PRESS SPACE OR TAP', canvas.width / 2, canvas.height / 2, 18, gameState, canvasRef, true);
  }
  
  return ctx;
} 