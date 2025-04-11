'use client';

import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

const GameCanvas = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [waitingToStart, setWaitingToStart] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  
  // Sound effects
  const [playFlap] = useSound('/sounds/flap.mp3', { volume: 0.5 });
  const [playPoint] = useSound('/sounds/point.mp3', { volume: 0.5 });
  const [playCollision] = useSound('/sounds/collision.mp3', { volume: 0.7 });
  const [playDing] = useSound('/sounds/flap.mp3', { volume: 0.5 });
  
  // Load font first
  useEffect(() => {
    // Continue anyway without waiting for font
    setFontLoaded(true);
    
    // Try to load font in background
    try {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(fontLink);
    } catch (err) {
      console.error('Font link error:', err);
    }
  }, []);
  
  // Game state
  const gameStateRef = useRef({
    player: {
      x: 0,
      y: 0,
      width: 40, // Larger bird
      height: 30, // Larger bird
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
    obstacleGap: 140,
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
      sky: '#70C5CE',
      ground: '#DED895',
      pipe: '#73BF2E',
      pipeHighlight: '#8CC542',
      pipeShadow: '#588A1B',
      bird: '#FFDB4D', // Bird color
      birdDetail: '#F37820', // Bird detail color
      text: '#FFFFFF' // Text color
    },
    animationFrameId: null,
    jumpCooldown: 0,
    maxJumpCooldown: 5,
    flashOpacity: 0,
    shakeDuration: 0,
    shakeIntensity: 0
  });
  
  // Helper function to get proper font string with fallback
  const getPixelFont = (size) => {
    return `bold ${size}px Arial, sans-serif`;
  };
  
  // Function to draw the bird (extracted for consistency)
  const drawBird = (ctx, x, y, rotation, frameIndex) => {
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
    // Using rectangles to create a pixel-art diamond like in the image
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
    // Center row
    ctx.strokeRect(diamondX, diamondY + diamondSize/2 - 2, diamondSize, 4);
    
    // One row up from center
    ctx.strokeRect(diamondX + 4, diamondY + diamondSize/2 - 6, diamondSize - 8, 4);
    
    // Two rows up from center
    ctx.strokeRect(diamondX + 8, diamondY + diamondSize/2 - 10, diamondSize - 16, 4);
    
    // Top row
    ctx.strokeRect(diamondX + 12, diamondY + diamondSize/2 - 14, diamondSize - 24, 4);
    
    // One row down from center
    ctx.strokeRect(diamondX + 4, diamondY + diamondSize/2 + 2, diamondSize - 8, 4);
    
    // Two rows down from center
    ctx.strokeRect(diamondX + 8, diamondY + diamondSize/2 + 6, diamondSize - 16, 4);
    
    // Bottom row
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
  };
  
  // Function to draw text with a visible outline
  const drawText = (ctx, text, x, y, fontSize, textOnly = false) => {
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
  };
  
  // Initialize game
  useEffect(() => {
    if (!canvasRef.current || !fontLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Update player position
      gameState.player.x = containerWidth * 0.3;
      gameState.player.y = containerHeight * 0.5;
      
      // Set ground position
      gameState.ground.y = containerHeight - gameState.ground.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Draw the starting screen
    if (waitingToStart) {
      const drawInitialState = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw sky background (blue)
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
        
        // Draw bird (flapping animation for idle state)
        gameState.frameTimer++;
        if (gameState.frameTimer >= gameState.frameDelay) {
          gameState.frameTimer = 0;
          gameState.frameIndex = (gameState.frameIndex + 1) % gameState.frameCount;
        }
        
        // Calculate floating animation
        const floatOffset = Math.sin(Date.now() * 0.003) * 10;
        
        // Draw bird at center with pixelated style
        const birdX = gameState.player.x;
        const birdY = gameState.player.y + floatOffset;
        
        // Draw the bird
        drawBird(ctx, birdX, birdY, 0, gameState.frameIndex);
        
        try {
          // Get Ready text
          drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 40);
          
          // Instructions
          drawText(ctx, 'PRESS SPACE', canvas.width / 2, canvas.height / 2, 20);
          drawText(ctx, 'OR TAP', canvas.width / 2, canvas.height / 2 + 40, 20);
        } catch (e) {
          console.error('Error rendering text:', e);
          
          // Simple fallback text rendering without fancy styling
          drawText(ctx, 'GET READY!', canvas.width / 2, canvas.height / 3, 30, true);
          drawText(ctx, 'PRESS SPACE OR TAP', canvas.width / 2, canvas.height / 2, 20, true);
        }
        
        if (waitingToStart) {
          requestAnimationFrame(drawInitialState);
        }
      };
      
      drawInitialState();
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
      }
    };
  }, [gameStarted, gameOver, waitingToStart, fontLoaded]);
  
  // Game loop
  useEffect(() => {
    if (!canvasRef.current || !gameStarted || gameOver || waitingToStart || !fontLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;
    
    const gameLoop = (timestamp) => {
      try {
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
          const shakeX = Math.random() * gameState.shakeIntensity * 2 - gameState.shakeIntensity;
          const shakeY = Math.random() * gameState.shakeIntensity * 2 - gameState.shakeIntensity;
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
        
        // Draw ground pattern (8-bit style)
        ctx.fillStyle = '#C0AB72';
        for (let x = -gameState.ground.offset; x < canvas.width; x += 24) {
          ctx.fillRect(x, gameState.ground.y, 12, 24);
        }
        
        // Update player
        gameState.player.velocity += gameState.player.gravity;
        gameState.player.y += gameState.player.velocity;
        
        // Rotate player based on velocity
        gameState.player.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/6, gameState.player.velocity * 0.1));
        
        // Draw player (bird) using the dedicated function
        drawBird(ctx, gameState.player.x, gameState.player.y, gameState.player.rotation, gameState.frameIndex);
        
        // Spawn obstacles
        if (timestamp - gameState.lastObstacleSpawn > gameState.obstacleSpawnRate) {
          const gapPosition = Math.random() * (canvas.height - gameState.obstacleGap - gameState.ground.height - 80) + 50;
          gameState.obstacles.push({
            x: canvas.width,
            topHeight: gapPosition,
            bottomY: gapPosition + gameState.obstacleGap,
            passed: false
          });
          gameState.lastObstacleSpawn = timestamp;
        }
        
        // Draw and update obstacles (pipes)
        gameState.obstacles.forEach((obstacle, index) => {
          obstacle.x -= gameState.obstacleSpeed;
          
          // Draw top pipe
          drawPipe(ctx, obstacle.x, 0, gameState.obstacleWidth, obstacle.topHeight, true);
          
          // Draw bottom pipe
          drawPipe(ctx, obstacle.x, obstacle.bottomY, gameState.obstacleWidth, canvas.height - obstacle.bottomY - gameState.ground.height, false);
          
          // Check for collision
          if (
            gameState.player.x + gameState.player.width * 0.8 > obstacle.x && 
            gameState.player.x + gameState.player.width * 0.2 < obstacle.x + gameState.obstacleWidth &&
            (gameState.player.y + gameState.player.height * 0.2 < obstacle.topHeight || 
             gameState.player.y + gameState.player.height * 0.8 > obstacle.bottomY)
          ) {
            if (!gameOver) {
              // Start screen shake
              gameState.shakeDuration = 10;
              gameState.shakeIntensity = 5;
              
              // Flash screen white
              gameState.flashOpacity = 0.8;
              
              playCollision();
              setGameOver(true);
              onGameOver(score);
            }
          }
          
          // Check for score
          if (!obstacle.passed && obstacle.x + gameState.obstacleWidth < gameState.player.x) {
            obstacle.passed = true;
            const newScore = score + 1;
            setScore(newScore);
            onScoreUpdate(newScore);
            playPoint();
            
            // Update high score
            if (newScore > highScore) {
              setHighScore(newScore);
            }
          }
          
          // Remove obstacles that are off-screen
          if (obstacle.x + gameState.obstacleWidth < 0) {
            gameState.obstacles.splice(index, 1);
          }
        });
        
        // Check for collision with ground or ceiling
        if (gameState.player.y < 0 || gameState.player.y + gameState.player.height > gameState.ground.y) {
          if (!gameOver) {
            // Start screen shake
            gameState.shakeDuration = 10;
            gameState.shakeIntensity = 5;
            
            // Flash screen white
            gameState.flashOpacity = 0.8;
            
            playCollision();
            setGameOver(true);
            onGameOver(score);
          }
        }
        
        // Draw score in 8-bit style using our helper function
        drawText(ctx, score.toString(), canvas.width / 2, 60, 40);
        
        // Draw flash overlay for collisions
        if (gameState.flashOpacity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${gameState.flashOpacity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          gameState.flashOpacity -= 0.05;
        }
        
        ctx.restore(); // Restore from the screen shake translation
      } catch (e) {
        console.error('Error in game loop:', e);
        // Try to recover by clearing the screen and continuing
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = gameState.colors.sky;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Tap to continue', canvas.width / 2, canvas.height / 2);
        }
      }
      
      // Continue game loop
      gameState.animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    // Helper function to draw 8-bit style pipes
    function drawPipe(ctx, x, y, width, height, isTop) {
      // Main pipe body
      ctx.fillStyle = gameState.colors.pipe;
      ctx.fillRect(x, y, width, height);
      
      // Add black outline to make pipes more visible
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
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
    }
    
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
      }
    };
  }, [gameStarted, gameOver, waitingToStart, score, highScore, onGameOver, onScoreUpdate, playCollision, playPoint, fontLoaded]);
  
  // Handle keyboard input for jumping and game control
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space bar to jump
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        // Prevent space from scrolling the page
        e.preventDefault();
        
        // Different logic depending on game state
        if (waitingToStart) {
          setWaitingToStart(false);
          setGameStarted(true);
          return;
        }
        
        if (gameOver) {
          setGameOver(false);
          setScore(0);
          gameStateRef.current.obstacles = [];
          gameStateRef.current.player.y = canvasRef.current.height * 0.5;
          gameStateRef.current.player.velocity = 0;
          setGameStarted(true);
          return;
        }
        
        // Normal gameplay jump
        if (gameStarted && !gameOver) {
          // Prevent jump spamming with a small cooldown
          if (gameStateRef.current.jumpCooldown > 0) return;
          
          // Jump
          gameStateRef.current.player.velocity = gameStateRef.current.player.jump;
          gameStateRef.current.jumpCooldown = gameStateRef.current.maxJumpCooldown;
          playFlap();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameOver, waitingToStart, playFlap]);
  
  // Handle touch events specifically for mobile
  useEffect(() => {
    // Prevent default touch behavior to avoid scrolling while playing
    const preventScroll = (e) => {
      if (gameStarted && !gameOver) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [gameStarted, gameOver]);
  
  // Handle direct click on canvas - update to use the same logic
  const handleClick = (e) => {
    // Prevent default behavior to avoid any unwanted scrolling on mobile
    e.preventDefault();
    
    // Use the same logic as the pointer event handler
    if (waitingToStart) {
      console.log('Starting game from canvas click');
      setWaitingToStart(false);
      setGameStarted(true);
      return;
    }
    
    if (gameOver) {
      setGameOver(false);
      setScore(0);
      gameStateRef.current.obstacles = [];
      gameStateRef.current.player.y = canvasRef.current.height * 0.5;
      gameStateRef.current.player.velocity = 0;
      setGameStarted(true);
      return;
    }
    
    if (gameStarted && !gameOver) {
      if (gameStateRef.current.jumpCooldown > 0) return;
      gameStateRef.current.player.velocity = gameStateRef.current.player.jump;
      gameStateRef.current.jumpCooldown = gameStateRef.current.maxJumpCooldown;
      playFlap();
    }
  };
  
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
      className="w-full h-full flex items-center justify-center touch-none"
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default GameCanvas; 