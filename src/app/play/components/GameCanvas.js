'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import useSound from 'use-sound';

const GameCanvas = memo(({ onGameOver, onScoreUpdate, onStartGame, showScoreForm, gameStarted, gameOver }) => {
  // Core refs for game rendering and animation
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const frameTimeRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const touchTimeoutRef = useRef(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [waitingToStart, setWaitingToStart] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const frameIntervalRef = useRef(1000 / 60); // Default to 60 FPS
  
  // Sound effects with fallbacks and error handling
  const [playFlap] = useSound('/sounds/flap.mp3', { 
    volume: 0.5,
    soundEnabled: true,
    onplayerror: () => { return () => {} }
  });
  
  const [playPoint] = useSound('/sounds/flap.mp3', { 
    volume: 0.5,
    soundEnabled: true,
    onplayerror: () => { return () => {} }
  });
  
  const [playCollision] = useSound('/sounds/collision.mp3', { 
    volume: 0.7,
    soundEnabled: true,
    onplayerror: () => { return () => {} }
  });
  
  // Update game state based on props
  useEffect(() => {
    if (gameStarted && waitingToStart) {
      setWaitingToStart(false);
    }
  }, [gameStarted, waitingToStart]);
  
  // Detect mobile devices and set performance targets
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
                    'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
      
      // Adjust FPS target based on device
      frameIntervalRef.current = mobile ? 1000 / 30 : 1000 / 60;
      
      // Update game state graphics settings and physics
      if (gameStateRef.current) {
        gameStateRef.current.useLowGraphics = mobile;
        // Adjust jump strength for mobile
        gameStateRef.current.player.jump = mobile ? -4 : -8.5;
        gameStateRef.current.player.gravity = mobile ? 0.4 : 0.5;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load font and continue regardless
  useEffect(() => {
    setFontLoaded(true);
    
    try {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(fontLink);
    } catch (err) {
      console.error('Font link error:', err);
    }
  }, []);
  
  // Game state with mobile-aware settings
  const gameStateRef = useRef({
    player: {
      x: 0,
      y: 0,
      width: 40,
      height: 30,
      velocity: 0,
      gravity: 0.5,
      jump: -8,
      rotation: 0,
      frameIndex: 0,
      frameCount: 3,
      frameDelay: 5,
      frameTimer: 0
    },
    obstacles: [],
    obstacleWidth: 52,
    obstacleGap: 180,
    obstacleSpeed: 2,
    obstacleSpawnRate: 1500,
    lastObstacleSpawn: 0,
    ground: {
      y: 0,
      height: 112,
      speed: 2,
      offset: 0
    },
    background: {
      speed: 0.5,
      offset: 0
    },
    colors: {
      sky: '#8B4513',
      ground: '#DED895',
      pipe: '#DEB887',
      pipeHighlight: '#F5F5DC',
      pipeShadow: '#A0522D',
      bird: '#FFDB4D',
      birdDetail: '#F37820',
      text: '#FFFFFF'
    },
    jumpCooldown: 0,
    maxJumpCooldown: 5,
    flashOpacity: 0,
    shakeDuration: 0,
    shakeIntensity: 0,
    useLowGraphics: false,
    isGameActive: false
  });
  
  // Helper function to get proper font string with fallback
  const getPixelFont = useCallback((size) => {
    if (!canvasRef.current) return `bold ${size}px Arial, sans-serif`;
    
    const canvas = canvasRef.current;
    const baseWidth = 400;
    const scaleFactor = Math.min(1.2, Math.max(0.8, canvas.width / baseWidth));
    size = Math.floor(size * scaleFactor);
    return `bold ${size}px Arial, sans-serif`;
  }, []);
  
  // Function to draw the bird (extracted for consistency)
  const drawBird = useCallback((ctx, x, y, rotation, frameIndex) => {
    const state = gameStateRef.current;
    
    ctx.save();
    ctx.translate(x + state.player.width/2, y + state.player.height/2);
    if (rotation) {
      ctx.rotate(rotation);
    }
    
    // Draw wedding ring instead of bird
    // Main ring band (gold)
    ctx.fillStyle = '#FFFF00'; // Bright gold/yellow color
    ctx.beginPath();
    ctx.arc(0, 0, state.player.width/2 - 4, 0, Math.PI * 2);
    ctx.arc(0, 0, state.player.width/2 - 12, 0, Math.PI * 2, true);
    ctx.fill();
    
    // Ring outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, state.player.width/2 - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, state.player.width/2 - 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw 8-bit style diamond
    const diamondSize = 24;
    const diamondX = -diamondSize/2;
    const diamondY = -state.player.height/2 - diamondSize/2;
    
    // Draw 8-bit pixel diamond
    ctx.fillStyle = '#4FC3F7'; // Light blue for diamond
    
    // Create an 8-bit pixel diamond shape
    // Center row (widest part)
    ctx.fillRect(diamondX, diamondY + diamondSize/2 - 2, diamondSize, 4);
    
    // One row up from center
    ctx.fillRect(diamondX + 4, diamondY + diamondSize/2 - 6, diamondSize - 8, 4);
    
    // Two rows up from center
    ctx.fillRect(diamondX + 8, diamondY + diamondSize/2 - 10, diamondSize - 16, 4);
    
    // Top row
    ctx.fillRect(diamondX + 12, diamondY + diamondSize/2 - 14, diamondSize - 24, 4);
    
    // One row down from center
    ctx.fillRect(diamondX + 4, diamondY + diamondSize/2 + 2, diamondSize - 8, 4);
    
    // Two rows down from center
    ctx.fillRect(diamondX + 8, diamondY + diamondSize/2 + 6, diamondSize - 16, 4);
    
    // Bottom row
    ctx.fillRect(diamondX + 12, diamondY + diamondSize/2 + 10, diamondSize - 24, 4);
    
    // Diamond outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Outline each pixel section
    ctx.strokeRect(diamondX, diamondY + diamondSize/2 - 2, diamondSize, 4);
    ctx.strokeRect(diamondX + 4, diamondY + diamondSize/2 - 6, diamondSize - 8, 4);
    ctx.strokeRect(diamondX + 8, diamondY + diamondSize/2 - 10, diamondSize - 16, 4);
    ctx.strokeRect(diamondX + 12, diamondY + diamondSize/2 - 14, diamondSize - 24, 4);
    ctx.strokeRect(diamondX + 4, diamondY + diamondSize/2 + 2, diamondSize - 8, 4);
    ctx.strokeRect(diamondX + 8, diamondY + diamondSize/2 + 6, diamondSize - 16, 4);
    ctx.strokeRect(diamondX + 12, diamondY + diamondSize/2 + 10, diamondSize - 24, 4);
    
    // Add light blue highlight to simulate shine
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(diamondX + 12, diamondY + diamondSize/2 - 14, diamondSize - 24, 4); // Top pixel
    ctx.fillRect(diamondX + 4, diamondY + diamondSize/2 - 6, 4, 4); // Left side highlight
    
    // Add darker blue for depth
    ctx.fillStyle = '#039BE5';
    ctx.fillRect(diamondX + 16, diamondY + diamondSize/2 + 6, 4, 4); // Right side shadow
    ctx.fillRect(diamondX + 12, diamondY + diamondSize/2 + 10, diamondSize - 24, 4); // Bottom pixel
    
    ctx.restore();
  }, []);
  
  // Function to draw text with a visible outline
  const drawText = useCallback((ctx, text, x, y, fontSize, textOnly = false) => {
    ctx.font = getPixelFont(fontSize);
    ctx.textAlign = 'center';
    
    if (!textOnly) {
      // Add a black outline/shadow for better visibility
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeText(text, x, y);
    }
    
    ctx.fillStyle = gameStateRef.current.colors.text;
    ctx.fillText(text, x, y);
  }, [getPixelFont]);
  
  // Initialize and resize canvas
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Optimize rendering on mobile by adjusting rendering resolution
    if (isMobile) {
      const scale = window.devicePixelRatio || 1;
      if (scale > 1) {
        const scaleFactor = 1 / (scale * 0.7);
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(scaleFactor, scaleFactor);
      }
    }
    
    const gameState = gameStateRef.current;
    
    // Update player position
    gameState.player.x = containerWidth * 0.3;
    gameState.player.y = containerHeight * 0.5;
    
    // Set ground position
    gameState.ground.y = containerHeight - gameState.ground.height;
    
    // Scale obstacle gap based on screen height for better playability
    const minGap = 120; // Minimum gap size in pixels
    const idealGap = containerHeight * (isMobile ? 0.35 : 0.32); // Adjusted mobile gap percentage
    gameState.obstacleGap = Math.max(minGap, idealGap);
    
    // Adjust pipe width based on screen width
    const minWidth = 40; // Minimum width in pixels
    const idealWidth = containerWidth * 0.08; // 8% of screen width
    gameState.obstacleWidth = Math.max(minWidth, Math.min(60, idealWidth));
    
    // Adjust player physics based on screen size
    gameState.player.gravity = isMobile ? 0.4 : 0.5;
    gameState.player.jump = isMobile ? -4 : -8.5;
  }, [isMobile]);
  
  // Draw the initial waiting screen
  const drawWaitingScreen = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    drawBird(ctx, birdX, birdY, 0, gameState.frameIndex);
    
    // Draw instructional text
    try {
      drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 36);
      drawText(ctx, 'PRESS SPACE', canvas.width / 2, canvas.height / 2, 18);
      drawText(ctx, 'OR TAP', canvas.width / 2, canvas.height / 2 + 36, 18);
    } catch (e) {
      console.error('Error rendering text:', e);
      
      // Simple fallback text rendering
      drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 26, true);
      drawText(ctx, 'PRESS SPACE OR TAP', canvas.width / 2, canvas.height / 2, 18, true);
    }
    
    if (waitingToStart && !gameStarted) {
      gameLoopRef.current = requestAnimationFrame(drawWaitingScreen);
    }
  }, [drawBird, drawText, gameStarted, waitingToStart]);
  
  // Initialize obstacle distances and timing for continuous flow
  const mainGameInitialization = useCallback(() => {
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
  }, [isMobile]);
  
  // Initialize canvas and start game
  useEffect(() => {
    if (!canvasRef.current || !fontLoaded) return;
    
    // Initialize with proper dimensions
    resizeCanvas();
    
    // Draw waiting screen if waiting to start
    if (waitingToStart && !gameStarted) {
      drawWaitingScreen();
    }
    
    // Add resize handler
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [resizeCanvas, drawWaitingScreen, waitingToStart, gameStarted, fontLoaded]);
  
  // Helper function to draw 8-bit style pipes with mobile optimization
  const drawPipe = useCallback((ctx, x, y, width, height, isTop, simplified = false) => {
    const gameState = gameStateRef.current;
    
    // Main pipe body
    ctx.fillStyle = gameState.colors.pipe;
    ctx.fillRect(x, y, width, height);
    
    // Add black outline to make pipes more visible
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    if (simplified) {
      // Skip detailed rendering for better performance on mobile
      return;
    }
    
    // Pipe cap
    const capHeight = 26;
    const capWidth = width + 8;
    const capX = x - 4;
    
    if (isTop) {
      const capY = y + height - capHeight;
      ctx.fillRect(capX, capY, capWidth, capHeight);
      ctx.strokeRect(capX, capY, capWidth, capHeight);
      
      // Pipe highlights for 8-bit style
      ctx.fillStyle = gameState.colors.pipeHighlight;
      ctx.fillRect(x + 4, y, 4, height - capHeight);
      ctx.fillRect(capX + 4, capY, 4, capHeight);
      
      // Pipe shadows for 8-bit style
      ctx.fillStyle = gameState.colors.pipeShadow;
      ctx.fillRect(x + width - 8, y, 4, height - capHeight);
      ctx.fillRect(capX + capWidth - 8, capY, 4, capHeight);
    } else {
      const capY = y;
      ctx.fillRect(capX, capY, capWidth, capHeight);
      ctx.strokeRect(capX, capY, capWidth, capHeight);
      
      // Pipe highlights for 8-bit style
      ctx.fillStyle = gameState.colors.pipeHighlight;
      ctx.fillRect(x + 4, y + capHeight, 4, height - capHeight);
      ctx.fillRect(capX + 4, capY, 4, capHeight);
      
      // Pipe shadows for 8-bit style
      ctx.fillStyle = gameState.colors.pipeShadow;
      ctx.fillRect(x + width - 8, y + capHeight, 4, height - capHeight);
      ctx.fillRect(capX + capWidth - 8, capY, 4, capHeight);
    }
  }, []);
  
  // Function to handle button clicks on game over screen
  const handleCanvasButtonClick = useCallback((x, y) => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calculate hitboxes for buttons
    const canvasWidth = canvas.width;
    const buttonY = canvas.height * 0.7; // Match position from renderUtils
    const buttonHeight = 50;
    const buttonPadding = 20;
    
    // Play Again button hitbox (centered)
    const playAgainText = 'Play Again';
    const ctx = canvas.getContext('2d');
    ctx.font = getPixelFont(24);
    
    const playAgainWidth = ctx.measureText(playAgainText).width + buttonPadding * 2;
    const playAgainX = canvasWidth / 2 - playAgainWidth / 2; // Center the button
    
    // Check if Play Again button was clicked
    if (x >= playAgainX && x <= playAgainX + playAgainWidth && 
        y >= buttonY && y <= buttonY + buttonHeight) {
      // Reset game state
      gameStateRef.current.obstacles = [];
      gameStateRef.current.player.velocity = 0;
      gameStateRef.current.player.y = canvas.height * 0.5;
      setScore(0);
      setWaitingToStart(false);
      if (onStartGame) onStartGame();
      return true;
    }
    
    return false;
  }, [getPixelFont, onStartGame]);
  
  // Handle clicks and touches
  const handleCanvasInteraction = useCallback((e) => {
    // Prevent default to avoid unwanted scrolling
    e.preventDefault();
    
    // Throttle touch events for better performance
    if (touchTimeoutRef.current) return;
    touchTimeoutRef.current = setTimeout(() => {
      touchTimeoutRef.current = null;
    }, 100);
    
    // If game over, check for button clicks
    if (gameOver) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get click coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if (e.type === 'touchstart' && e.touches && e.touches[0]) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      // Scale coordinates to match canvas internal dimensions
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;
      
      // Handle button clicks
      if (handleCanvasButtonClick(x, y)) {
        return;
      }
    }
    
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
  }, [waitingToStart, gameStarted, gameOver, isMobile, playFlap, onStartGame, handleCanvasButtonClick]);
  
  // Main game loop
  const gameLoop = useCallback((timestamp) => {
    // Skip frames to maintain target FPS
    if (timestamp - frameTimeRef.current < frameIntervalRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Calculate delta time for smooth animation
    const deltaTime = Math.min(50, timestamp - lastTimestampRef.current);
    lastTimestampRef.current = timestamp;
    frameTimeRef.current = timestamp;
    
    try {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const gameState = gameStateRef.current;
      
      // Update jump cooldown
      if (gameState.jumpCooldown > 0) {
        gameState.jumpCooldown--;
      }
      
      // Update bird animation frame
      gameState.frameTimer++;
      if (gameState.frameTimer >= gameState.frameDelay) {
        gameState.frameTimer = 0;
        gameState.frameIndex = (gameState.frameIndex + 1) % gameState.frameCount;
      }
      
      // Apply screen shake effect
      ctx.save();
      if (gameState.shakeDuration > 0) {
        const shakeIntensity = isMobile ? gameState.shakeIntensity * 0.7 : gameState.shakeIntensity;
        const shakeX = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const shakeY = Math.random() * shakeIntensity * 2 - shakeIntensity;
        ctx.translate(shakeX, shakeY);
        gameState.shakeDuration--;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sky background
      ctx.fillStyle = gameState.colors.sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw ground
      gameState.ground.offset = (gameState.ground.offset + gameState.ground.speed) % 24;
      
      // Draw ground
      ctx.fillStyle = gameState.colors.ground;
      ctx.fillRect(0, gameState.ground.y, canvas.width, gameState.ground.height);
      
      // Draw ground pattern (simplified on mobile)
      ctx.fillStyle = '#C0AB72';
      const patternStep = isMobile ? 48 : 24;
      for (let x = -gameState.ground.offset; x < canvas.width; x += patternStep) {
        ctx.fillRect(x, gameState.ground.y, patternStep/2, 24);
      }
      
      // Update player with delta time adjustment
      const timeScale = Math.min(deltaTime / (1000 / 60), 2);
      gameState.player.velocity += gameState.player.gravity * timeScale;
      gameState.player.y += gameState.player.velocity * timeScale;
      
      // Rotate player based on velocity
      gameState.player.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/6, gameState.player.velocity * 0.1));
      
      // Draw player
      drawBird(ctx, gameState.player.x, gameState.player.y, gameState.player.rotation, gameState.frameIndex);
      
      // Calculate a smaller hitbox for the player (ring)
      // Use 60% of the player dimensions, centered inside the ring
      const hitboxScale = 0.6; // 60% of original size
      
      const playerHitbox = {
        width: gameState.player.width * hitboxScale,
        height: gameState.player.height * hitboxScale,
        // Center the hitbox horizontally and vertically
        x: gameState.player.x + (gameState.player.width - gameState.player.width * hitboxScale) / 2,
        y: gameState.player.y + (gameState.player.height - gameState.player.height * hitboxScale) / 2
      };
      
      // Draw hitbox for debugging (red rectangle)
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        playerHitbox.x, 
        playerHitbox.y, 
        playerHitbox.width, 
        playerHitbox.height
      );
      
      // Spawn obstacles at fixed intervals based on time
      // This ensures consistent pipe spacing regardless of player passing them
      const now = Date.now();
      if (gameState.isGameActive && now - gameState.lastObstacleSpawn > gameState.obstacleSpawnRate) {
        gameState.lastObstacleSpawn = now;
        
        // Ensure pipes don't overlap with the ground
        const minObstacleHeight = 50; // Minimum height for top/bottom pipes
        const availableHeight = canvas.height - gameState.ground.height - gameState.obstacleGap - (minObstacleHeight * 2);
        
        if (availableHeight > 0) {
          let obstacleTopHeight = minObstacleHeight + Math.random() * availableHeight;
          
          // Add safety margin above ground
          const groundSafetyMargin = 20; 
          const maxTopHeight = canvas.height - gameState.ground.height - gameState.obstacleGap - minObstacleHeight - groundSafetyMargin;
          obstacleTopHeight = Math.min(obstacleTopHeight, maxTopHeight);
          
          // Calculate bottom pipe Y position based on top pipe height and gap
          const bottomPipeY = obstacleTopHeight + gameState.obstacleGap;
          
          gameState.obstacles.push({
            x: canvas.width,
            topHeight: obstacleTopHeight,
            bottomY: bottomPipeY, // Store bottom Y position
            scored: false
          });
        } else {
           console.warn("Not enough space to spawn obstacles without overlapping ground or gap.");
           // Optionally handle this case, e.g., spawn a simpler obstacle or skip spawning
        }
        
        // Adjust spawn rate using mobile-specific ranges
        if (isMobile) {
          gameState.obstacleSpawnRate = 2000 + Math.random() * 400; // e.g., 2.0s - 2.4s for mobile
        } else {
          gameState.obstacleSpawnRate = 1400 + Math.random() * 200; // e.g., 1.4s - 1.6s for desktop
        }
      }
      
      // Draw and update all obstacles
      for (let i = 0; i < gameState.obstacles.length; i++) {
        const obstacle = gameState.obstacles[i];
        
        // Calculate pixels to move this frame, adjusted for time delta
        // This keeps pipe speed consistent even with frame rate variations
        const moveAmount = gameState.obstacleSpeed * (deltaTime / (1000 / 60));
        
        // Update obstacle position with time-normalized movement
        obstacle.x -= moveAmount;
        
        // Determine if obstacle is close to player for detail rendering
        const isClose = obstacle.x < canvas.width * 0.8;
        
        // Draw pipes - both top and bottom segments
        drawPipe(ctx, obstacle.x, 0, gameState.obstacleWidth, obstacle.topHeight, true, isMobile && !isClose);
        drawPipe(ctx, obstacle.x, obstacle.bottomY, gameState.obstacleWidth, canvas.height - obstacle.bottomY - gameState.ground.height, false, isMobile && !isClose);
        
        // Improved collision detection with the smaller hitbox
        if (
          playerHitbox.x + playerHitbox.width > obstacle.x && 
          playerHitbox.x < obstacle.x + gameState.obstacleWidth &&
          (playerHitbox.y < obstacle.topHeight || 
           playerHitbox.y + playerHitbox.height > obstacle.bottomY)
        ) {
          if (!gameOver) {
            // Effects for collision
            gameState.shakeDuration = isMobile ? 5 : 10;
            gameState.shakeIntensity = isMobile ? 3 : 5;
            gameState.flashOpacity = isMobile ? 0.5 : 0.8;
            
            playCollision();
            onGameOver(score);
          }
        }
        
        // Check for score only when the player passes through a pipe
        if (!obstacle.scored && obstacle.x + gameState.obstacleWidth < gameState.player.x) {
          obstacle.scored = true;
          const newScore = score + 1;
          setScore(newScore);
          onScoreUpdate(newScore);
          playPoint();
        }
        
        // Remove obstacles only when they are completely off the left edge of the screen
        // This ensures pipes continue to move across the entire screen for a smooth visual experience
        if (obstacle.x + gameState.obstacleWidth < -20) { // Add a small buffer to ensure it's fully off-screen
          gameState.obstacles.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
      
      // Check for collision with ground or ceiling using the same smaller hitbox
      if (playerHitbox.y < 0 || playerHitbox.y + playerHitbox.height > gameState.ground.y) {
        if (!gameOver) {
          gameState.shakeDuration = isMobile ? 5 : 10;
          gameState.shakeIntensity = isMobile ? 3 : 5;
          gameState.flashOpacity = isMobile ? 0.5 : 0.8;
          
          playCollision();
          onGameOver(score);
        }
      }
      
      // Draw score
      drawText(ctx, score.toString(), canvas.width / 2, 50, 32);
      
      // Draw flash overlay for collisions
      if (gameState.flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${gameState.flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        gameState.flashOpacity -= isMobile ? 0.1 : 0.05;
      }
      
      ctx.restore(); // Restore from the screen shake translation
    } catch (e) {
      console.error('Error in game loop:', e);
      // Recovery fallback
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = gameStateRef.current.colors.sky;
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Tap to continue', canvasRef.current.width / 2, canvasRef.current.height / 2);
        }
      }
    }
    
    // Continue game loop if game is still active
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [drawBird, drawPipe, drawText, gameOver, gameStarted, isMobile, onGameOver, onScoreUpdate, playCollision, playPoint, score]);
  
  // Add global input event handling
  useEffect(() => {
    // Add keyboard handler
    const handleKeyDown = (e) => {
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Touch/click interaction prevention helper
    const preventDefaultForCanvas = (e) => {
      if ((gameStarted || waitingToStart) && e.target.tagName === 'CANVAS') {
        e.preventDefault();
      }
    };
    
    // Add touch handlers with passive: false to allow preventDefault
    document.addEventListener('touchstart', preventDefaultForCanvas, { passive: false });
    document.addEventListener('touchmove', preventDefaultForCanvas, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', preventDefaultForCanvas);
      document.removeEventListener('touchmove', preventDefaultForCanvas);
      
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [gameStarted, gameOver, waitingToStart, playFlap, onStartGame]);
  
  // Main game state management effect
  useEffect(() => {
    if (!canvasRef.current || !fontLoaded) return;
    
    // Reset game state when starting a new game
    if (gameStarted && !gameOver) {
      // Make sure canvas is properly sized
      resizeCanvas();
      
      // Initialize game state with proper timing and distances
      mainGameInitialization();
      
      // Reset timing references to current time for consistent initial frame
      const now = performance.now();
      lastTimestampRef.current = now;
      frameTimeRef.current = now;
      
      // Start the game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    // Clean up when game is over or unmounted
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver, fontLoaded, resizeCanvas, gameLoop, mainGameInitialization]);
  
  // Reset game state on game over
  useEffect(() => {
    if (gameOver) {
      // Cancel the game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [gameOver]);
  
  /*
  // Draw gameover screen with appropriate buttons
  const drawGameOver = useCallback((ctx, score, canvasRef, gameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over Text
    const fontSize = canvas.width < 500 ? 28 : 48;
    ctx.font = `bold ${fontSize}px ${gameState.fontFamily || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text shadow for "Game Over"
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Draw "Game Over" with gradient
    const gradient = ctx.createLinearGradient(
      canvas.width / 2 - 100, 
      canvas.height / 2 - 50, 
      canvas.width / 2 + 100, 
      canvas.height / 2 + 50
    );
    gradient.addColorStop(0, '#ff5252');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Score text
    const smallerFontSize = canvas.width < 500 ? 22 : 36;
    ctx.font = `bold ${smallerFontSize}px ${gameState.fontFamily || 'Arial, sans-serif'}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    // Play again instruction
    const smallestFontSize = canvas.width < 500 ? 16 : 24;
    ctx.font = `${smallestFontSize}px ${gameState.fontFamily || 'Arial, sans-serif'}`;
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Tap / Click to play again', canvas.width / 2, canvas.height / 2 + 80);
    
    // Note: We've removed the "RSVP Link" / "Back to Invitation" button
    // as it's already being handled by GameHUD.js
  }, []);
  */
  
  // Show loading indicator if fonts aren't loaded yet
  if (!fontLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#70C5CE]">
        <div className="text-white text-center">
          <div className="mb-4">Loading game...</div>
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full h-full flex items-center justify-center touch-action-none"
      onClick={handleCanvasInteraction}
      onTouchStart={handleCanvasInteraction}
      style={{ 
        touchAction: gameStarted || waitingToStart ? 'none' : 'auto',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        maxHeight: '100%',
        zIndex: 10
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-[#70C5CE]"
      />
    </div>
  );
});

export default GameCanvas; 