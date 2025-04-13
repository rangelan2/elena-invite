'use client';

/**
 * gameStateUtils.js - Manages game states, scoring, and game loop
 */

// Game state constants
export const GAME_STATES = {
  MENU: 'menu',
  READY: 'ready',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

// Game settings with default values
export const GAME_SETTINGS = {
  FPS: 60,
  CANVAS_WIDTH: 320,
  CANVAS_HEIGHT: 480,
  PIPE_SPACING: 220,
  PIPE_GAP_HEIGHT: 120,
  GROUND_HEIGHT: 112,
  BIRD_WIDTH: 34,
  BIRD_HEIGHT: 24,
  BIRD_START_X: 60,
  BIRD_START_Y: 250,
  BIRD_RADIUS: 12,
  MIN_PIPE_GAP_Y: 100,
  MAX_PIPE_GAP_Y: 280,
  MEDAL_THRESHOLDS: {
    BRONZE: 10,
    SILVER: 20,
    GOLD: 30,
    PLATINUM: 40
  },
  ANIMATION_SPEEDS: {
    BIRD_FLAP: 150,
    GROUND_MOVE: 2.5,
    CLOUD_MOVE: 1.0
  }
};

/**
 * Initial game state object
 */
export function createInitialGameState() {
  return {
    gameState: GAME_STATES.MENU,
    bird: {
      x: GAME_SETTINGS.BIRD_START_X,
      y: GAME_SETTINGS.BIRD_START_Y,
      width: GAME_SETTINGS.BIRD_WIDTH,
      height: GAME_SETTINGS.BIRD_HEIGHT,
      velocity: 0,
      radius: GAME_SETTINGS.BIRD_RADIUS,
      frameIndex: 0,
      animTime: 0,
      color: 'yellow' // Default bird color
    },
    pipes: [],
    score: 0,
    highScore: 0,
    lastPipeAdded: 0,
    groundOffset: 0,
    clouds: [],
    lastTime: 0,
    medalAwarded: null,
    flash: {
      active: false,
      alpha: 0
    }
  };
}

/**
 * Updates the bird position and animation
 */
export function updateBird(bird, deltaTime, gravity, gameState) {
  // Only apply gravity and movement when playing
  if (gameState === GAME_STATES.PLAYING) {
    bird.velocity += gravity * deltaTime;
    bird.y += bird.velocity;
  }
  
  // Update bird animation regardless of game state
  bird.animTime += deltaTime;
  if (bird.animTime >= GAME_SETTINGS.ANIMATION_SPEEDS.BIRD_FLAP) {
    bird.frameIndex = (bird.frameIndex + 1) % 3; // Bird has 3 frames of animation
    bird.animTime = 0;
  }
  
  return bird;
}

/**
 * Makes the bird jump
 */
export function birdJump(bird, jumpForce) {
  bird.velocity = -jumpForce;
  return bird;
}

/**
 * Updates pipe positions and adds new pipes as needed
 */
export function updatePipes(gameState, deltaTime, pipeSpeed, canvasWidth, canvasHeight) {
  const { pipes, lastPipeAdded } = gameState;
  let newPipes = [...pipes];
  let newLastPipeAdded = lastPipeAdded;
  
  // Update pipe positions
  newPipes = newPipes.map(pipe => ({
    ...pipe,
    x: pipe.x - pipeSpeed * deltaTime
  }));
  
  // Add new pipe when needed
  newLastPipeAdded += deltaTime;
  if (newLastPipeAdded >= GAME_SETTINGS.PIPE_SPACING) {
    // Adjust gap Y based on canvas height (optional, could keep min/max absolute)
    const minGapY = GAME_SETTINGS.MIN_PIPE_GAP_Y;
    const maxGapY = canvasHeight - GAME_SETTINGS.GROUND_HEIGHT - GAME_SETTINGS.PIPE_GAP_HEIGHT - 50; // Ensure gap fits

    const newPipe = {
      x: canvasWidth, // Use dynamic canvasWidth
      width: 52,
      gapY: Math.floor(
        Math.random() * (maxGapY - minGapY) + minGapY // Use adjusted maxGapY
      ),
      gapHeight: GAME_SETTINGS.PIPE_GAP_HEIGHT,
      passed: false
    };
    
    newPipes.push(newPipe);
    newLastPipeAdded = 0;
  }
  
  // Remove pipes that have gone off screen
  newPipes = newPipes.filter(pipe => pipe.x + pipe.width > -50);
  
  return { pipes: newPipes, lastPipeAdded: newLastPipeAdded };
}

/**
 * Updates the score when bird passes pipes
 */
export function updateScore(gameState) {
  const { bird, pipes, score } = gameState;
  let newScore = score;
  let newPipes = [...pipes];
  let medalAwarded = gameState.medalAwarded;
  
  // Check if bird has passed any pipes
  newPipes = newPipes.map(pipe => {
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      newScore += 1;
      return { ...pipe, passed: true };
    }
    return pipe;
  });
  
  // Update medal if score reaches threshold
  if (newScore >= GAME_SETTINGS.MEDAL_THRESHOLDS.PLATINUM && medalAwarded !== 'platinum') {
    medalAwarded = 'platinum';
  } else if (newScore >= GAME_SETTINGS.MEDAL_THRESHOLDS.GOLD && medalAwarded !== 'gold' && medalAwarded !== 'platinum') {
    medalAwarded = 'gold';
  } else if (newScore >= GAME_SETTINGS.MEDAL_THRESHOLDS.SILVER && medalAwarded !== 'silver' && medalAwarded !== 'gold' && medalAwarded !== 'platinum') {
    medalAwarded = 'silver';
  } else if (newScore >= GAME_SETTINGS.MEDAL_THRESHOLDS.BRONZE && medalAwarded !== 'bronze' && medalAwarded !== 'silver' && medalAwarded !== 'gold' && medalAwarded !== 'platinum') {
    medalAwarded = 'bronze';
  }
  
  return { score: newScore, pipes: newPipes, medalAwarded };
}

/**
 * Checks for game over conditions
 */
export function checkGameOver(gameState, canvasHeight) {
  const { bird, pipes } = gameState;
  const birdBox = {
    x: bird.x - bird.width / 2,
    y: bird.y - bird.height / 2,
    width: bird.width,
    height: bird.height
  };
  
  // Check collision with ground
  const groundY = canvasHeight - GAME_SETTINGS.GROUND_HEIGHT;
  if (bird.y + bird.height / 2 >= groundY) {
    return true;
  }
  
  // Check collision with ceiling
  if (bird.y - bird.height / 2 <= 0) {
    return true;
  }
  
  // Check collision with pipes
  for (const pipe of pipes) {
    const topPipeRect = {
      x: pipe.x,
      y: 0,
      width: pipe.width,
      height: pipe.gapY
    };
    
    const bottomPipeRect = {
      x: pipe.x,
      y: pipe.gapY + pipe.gapHeight,
      width: pipe.width,
      height: canvasHeight - (pipe.gapY + pipe.gapHeight)
    };
    
    // Using bounding box for collision detection
    const collisionWithTop = (birdBox.x < topPipeRect.x + topPipeRect.width &&
                             birdBox.x + birdBox.width > topPipeRect.x &&
                             birdBox.y < topPipeRect.y + topPipeRect.height &&
                             birdBox.y + birdBox.height > topPipeRect.y);
                             
    const collisionWithBottom = (birdBox.x < bottomPipeRect.x + bottomPipeRect.width &&
                               birdBox.x + birdBox.width > bottomPipeRect.x &&
                               birdBox.y < bottomPipeRect.y + bottomPipeRect.height &&
                               birdBox.y + birdBox.height > bottomPipeRect.y);
    
    if (collisionWithTop) {
      return true;
    }
    if (collisionWithBottom) {
      return true;
    }
  }
  
  return false;
}

/**
 * Updates ground animation
 */
export function updateGround(groundOffset, deltaTime, speed) {
  // Update ground position for scrolling effect
  let newGroundOffset = (groundOffset + speed * deltaTime) % 336; // 336 is ground sprite width
  
  return newGroundOffset;
}

/**
 * Creates a cloud at a random position
 */
export function createCloud(canvasWidth) {
  return {
    x: canvasWidth,
    y: Math.random() * 200, // Random y position within first 200px
    speed: 0.5 + Math.random() * 0.5, // Random speed between 0.5 and 1.0
    type: Math.floor(Math.random() * 3) // Random cloud type (0, 1, or 2)
  };
}

/**
 * Updates cloud positions and adds new ones when needed
 */
export function updateClouds(clouds, deltaTime, canvasWidth) {
  // Move existing clouds
  let newClouds = clouds.map(cloud => ({
    ...cloud,
    x: cloud.x - cloud.speed * deltaTime
  }));
  
  // Remove clouds that are off screen
  newClouds = newClouds.filter(cloud => cloud.x > -100);
  
  // Random chance to add a new cloud
  if (Math.random() < 0.005 * deltaTime) {
    newClouds.push(createCloud(canvasWidth));
  }
  
  return newClouds;
}

/**
 * Updates flash effect (when bird dies or scores)
 */
export function updateFlash(flash, deltaTime) {
  if (!flash.active) return { active: false, alpha: 0 };
  
  let newAlpha = flash.alpha - 2 * deltaTime; // Fade out
  
  if (newAlpha <= 0) {
    return { active: false, alpha: 0 };
  }
  
  return { active: true, alpha: newAlpha };
}

/**
 * Activates flash effect
 */
export function activateFlash() {
  return { active: true, alpha: 1.0 };
}

/**
 * Resets game to start a new round
 */
export function resetGame(gameState) {
  const { highScore } = gameState;
  const initialState = createInitialGameState();
  
  return {
    ...initialState,
    highScore: Math.max(highScore, gameState.score),
    gameState: GAME_STATES.READY
  };
}

/**
 * Changes the bird color
 */
export function changeBirdColor(bird, color) {
  return {
    ...bird,
    color
  };
}

/**
 * Handles user input
 */
export function handleGameInput(gameState, canvasWidth, canvasHeight) {
  let newState = { ...gameState };
  
  // Log current state
  console.log("Handle game input called in state:", gameState.gameState);
  
  switch (gameState.gameState) {
    case GAME_STATES.MENU:
      // Transition to READY state
      console.log("Transitioning from MENU to READY state");
      newState.gameState = GAME_STATES.READY;
      break;
      
    case GAME_STATES.READY:
      // Transition to PLAYING state
      console.log("Transitioning from READY to PLAYING state");
      newState.gameState = GAME_STATES.PLAYING;
      // Reset bird position/velocity relative to canvas size
      newState.bird = {
        ...newState.bird,
        x: canvasWidth * 0.2, // Place bird 20% across the screen
        y: canvasHeight / 2,  // Place bird vertically centered
        velocity: -7 // Initial jump
      };
      break;
      
    case GAME_STATES.PLAYING:
      // Bird jump
      console.log("Bird jump in PLAYING state");
      newState.bird = birdJump(newState.bird, 7);
      break;
      
    case GAME_STATES.GAME_OVER:
      // Reset game
      console.log("Resetting game from GAME_OVER state");
      newState = resetGame(newState);
      break;
      
    default:
      break;
  }
  
  return newState;
}

/**
 * Main game update function (called on each frame)
 */
export function updateGame(gameState, currentTime, canvasWidth, canvasHeight) {
  const deltaTime = gameState.lastTime ? (currentTime - gameState.lastTime) / (1000 / 60) : 1;
  let newGameState = { ...gameState, lastTime: currentTime };
  
  // Only update gameplay elements when in PLAYING state
  if (newGameState.gameState === GAME_STATES.PLAYING) {
    // Update bird
    newGameState.bird = updateBird(
      newGameState.bird, 
      deltaTime, 
      0.4, // gravity 
      GAME_STATES.PLAYING
    );
    
    // Update pipes
    const pipeUpdate = updatePipes(newGameState, deltaTime, 2.5, canvasWidth, canvasHeight);
    newGameState.pipes = pipeUpdate.pipes;
    newGameState.lastPipeAdded = pipeUpdate.lastPipeAdded;
    
    // Update score
    const scoreUpdate = updateScore(newGameState);
    newGameState.score = scoreUpdate.score;
    newGameState.pipes = scoreUpdate.pipes;
    newGameState.medalAwarded = scoreUpdate.medalAwarded;
    
    // Check for game over
    if (checkGameOver(newGameState, canvasHeight)) {
      newGameState.gameState = GAME_STATES.GAME_OVER;
      newGameState.flash = activateFlash();
      newGameState.highScore = Math.max(newGameState.highScore, newGameState.score);
    }
  }
  
  // Always update these regardless of game state
  newGameState.groundOffset = updateGround(
    newGameState.groundOffset, 
    deltaTime, 
    GAME_SETTINGS.ANIMATION_SPEEDS.GROUND_MOVE
  );
  
  newGameState.clouds = updateClouds(
    newGameState.clouds, 
    deltaTime, 
    canvasWidth
  );
  
  newGameState.flash = updateFlash(newGameState.flash, deltaTime);
  
  // Bird animation continues even when not playing
  if (newGameState.gameState !== GAME_STATES.PLAYING) {
    newGameState.bird = updateBird(
      newGameState.bird, 
      deltaTime, 
      0, // No gravity when not playing
      newGameState.gameState
    );
  }
  
  return newGameState;
}

/**
 * Saves high score to localStorage
 */
export function saveHighScore(score) {
  if (typeof window !== 'undefined') {
    const currentHighScore = localStorage.getItem('flappyHighScore') || 0;
    if (score > currentHighScore) {
      localStorage.setItem('flappyHighScore', score);
    }
  }
}

/**
 * Loads high score from localStorage
 */
export function loadHighScore() {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('flappyHighScore') || '0', 10);
  }
  return 0;
}

/**
 * Formats score as string with leading zeros
 */
export function formatScore(score) {
  return score.toString().padStart(3, '0');
} 