'use client';

/**
 * Creates a new obstacle with proper sizing and positioning
 */
export function createObstacle(canvasRef, gameState) {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  
  // Randomize gap position
  const minGapY = canvas.height * 0.2; // Top 20% of canvas
  const maxGapY = canvas.height * 0.8; // Bottom 80% of canvas
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
  
  return {
    x: canvas.width, // Start at the right edge of the canvas
    gapY: gapY,
    gapHeight: gameState.obstacle.gapHeight,
    width: gameState.obstacle.width,
    passed: false
  };
}

/**
 * Updates obstacles position and spawns new ones
 */
export function updateObstacles(canvasRef, gameStateRef, setScore, timestamp) {
  const gameState = gameStateRef.current;
  const canvas = canvasRef.current;
  
  if (!canvas || !gameState.isGameActive) return;
  
  // Use timestamp for consistent time-based spawning
  const timeSinceLastSpawn = timestamp - gameState.lastObstacleSpawn;
  
  // Spawn a new obstacle based on absolute time interval
  if (timeSinceLastSpawn >= gameState.obstacleSpawnRate) {
    const newObstacle = createObstacle(canvasRef, gameState);
    if (newObstacle) {
      gameState.obstacles.push(newObstacle);
      gameState.lastObstacleSpawn = timestamp;
    }
  }
  
  // Update obstacle positions
  for (let i = 0; i < gameState.obstacles.length; i++) {
    const obstacle = gameState.obstacles[i];
    obstacle.x -= gameState.obstacleSpeed * (gameState.timeDelta / 16.67); // Normalized for 60fps
    
    // Check if player has passed obstacle
    if (!obstacle.passed && 
        gameState.player.x > obstacle.x + obstacle.width) {
      obstacle.passed = true;
      setScore(prevScore => prevScore + 1);
    }
  }
  
  // Remove obstacles that have moved offscreen
  gameState.obstacles = gameState.obstacles.filter(obstacle => 
    obstacle.x + obstacle.width > -100 // Give some buffer for smooth removal
  );
}

/**
 * Check collision between player and obstacles
 */
export function checkCollisions(gameStateRef, setGameOver) {
  const gameState = gameStateRef.current;
  
  if (!gameState.isGameActive) return false;
  
  // Player hit box (60% of player size for better UX)
  const playerRadius = gameState.player.size * 0.3;
  const playerLeft = gameState.player.x - playerRadius;
  const playerRight = gameState.player.x + playerRadius;
  const playerTop = gameState.player.y - playerRadius;
  const playerBottom = gameState.player.y + playerRadius;
  
  // Check ground collision
  if (playerBottom >= gameState.ground.y) {
    gameState.isGameActive = false;
    setGameOver(true);
    return true;
  }
  
  // Check obstacle collisions
  for (const obstacle of gameState.obstacles) {
    // If player is within horizontal bounds of the pipe
    if (playerRight > obstacle.x && playerLeft < obstacle.x + obstacle.width) {
      // Check if player is not within the gap
      if (playerTop < obstacle.gapY - obstacle.gapHeight/2 || 
          playerBottom > obstacle.gapY + obstacle.gapHeight/2) {
        gameState.isGameActive = false;
        setGameOver(true);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Updates player position based on physics
 */
export function updatePlayer(gameStateRef) {
  const gameState = gameStateRef.current;
  
  if (!gameState.isGameActive) return;
  
  // Apply gravity with time-delta normalization
  gameState.player.velocity += gameState.player.gravity * (gameState.timeDelta / 16.67);
  
  // Apply velocity to position with time-delta normalization
  gameState.player.y += gameState.player.velocity * (gameState.timeDelta / 16.67);
  
  // Apply rotation based on velocity
  gameState.player.rotation = Math.min(
    Math.PI / 4, 
    Math.max(-Math.PI / 4, gameState.player.velocity * 0.04)
  );
}

/**
 * Main game loop function
 */
export function gameLoop(canvasRef, gameStateRef, drawBird, drawPipe, drawText, setScore, setGameOver, timestamp) {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const gameState = gameStateRef.current;
  
  // Calculate time delta for smooth animation
  const currentTime = timestamp || performance.now();
  gameState.timeDelta = gameState.lastTimestamp ? currentTime - gameState.lastTimestamp : 16.67;
  
  // Cap delta to prevent issues after tab switching or lag spikes
  gameState.timeDelta = Math.min(gameState.timeDelta, 50);
  
  // Update last timestamp
  gameState.lastTimestamp = currentTime;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw sky background
  ctx.fillStyle = gameState.colors.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw obstacles
  updateObstacles(canvasRef, gameStateRef, setScore, currentTime);
  
  // Draw pipes
  const isMobile = window.innerWidth <= 768;
  for (const obstacle of gameState.obstacles) {
    // Draw top pipe
    drawPipe(
      ctx, 
      obstacle.x, 
      0, 
      obstacle.width, 
      obstacle.gapY - obstacle.gapHeight/2, 
      true, 
      gameState,
      isMobile
    );
    
    // Draw bottom pipe
    drawPipe(
      ctx, 
      obstacle.x, 
      obstacle.gapY + obstacle.gapHeight/2, 
      obstacle.width, 
      canvas.height - (obstacle.gapY + obstacle.gapHeight/2), 
      false, 
      gameState,
      isMobile
    );
  }
  
  // Update player physics
  updatePlayer(gameStateRef);
  
  // Check collisions
  const hasCollided = checkCollisions(gameStateRef, setGameOver);
  
  // Update bird animation frame
  gameState.frameTimer++;
  if (gameState.frameTimer >= gameState.frameDelay) {
    gameState.frameTimer = 0;
    gameState.frameIndex = (gameState.frameIndex + 1) % gameState.frameCount;
  }
  
  // Draw player
  drawBird(
    ctx, 
    gameState.player.x, 
    gameState.player.y, 
    gameState.player.rotation, 
    gameState.frameIndex,
    gameState
  );
  
  // Draw ground
  ctx.fillStyle = gameState.colors.ground;
  ctx.fillRect(0, gameState.ground.y, canvas.width, gameState.ground.height);
  
  // Draw ground pattern (8-bit style)
  ctx.fillStyle = '#C0AB72';
  for (let x = 0; x < canvas.width; x += 24) {
    ctx.fillRect(x, gameState.ground.y, 12, 24);
  }
  
  // Draw save-the-date announcement with white box
  try {
    // Draw white background box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const boxWidth = canvas.width * 0.7;
    const boxHeight = canvas.height * 0.15;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = canvas.height * 0.05;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw text on top of white box
    const fontSize = canvas.width < 500 ? 16 : 24;
    drawText(ctx, 'SAVE THE DATE', canvas.width / 2, boxY + boxHeight * 0.33, fontSize, gameState, canvasRef);
    drawText(ctx, 'JUNE 29, 2024', canvas.width / 2, boxY + boxHeight * 0.75, fontSize, gameState, canvasRef);
  } catch (e) {
    console.error('Error rendering save the date:', e);
  }
  
  return ctx;
} 