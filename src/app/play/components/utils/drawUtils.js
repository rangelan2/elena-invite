'use client';

/**
 * Generates a pixel font string with proper sizing
 */
export function getPixelFont(size, canvasRef) {
  if (!canvasRef.current) return `bold ${size}px Arial, sans-serif`;
  
  const canvas = canvasRef.current;
  const baseWidth = 400;
  const scaleFactor = Math.min(1.2, Math.max(0.8, canvas.width / baseWidth));
  size = Math.floor(size * scaleFactor);
  return `bold ${size}px Arial, sans-serif`;
}

/**
 * Draws the player (bird) on the canvas
 */
export function drawBird(ctx, x, y, rotation, frameIndex, gameState) {
  // Save the current context state
  ctx.save();
  
  // Move to the bird's position and apply rotation
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Bird body
  const size = gameState.player.size;
  
  // Create a yellow/gold bird with animated wings
  const birdColors = {
    body: '#F8E473', // Main yellow color
    beak: '#FF6B35', // Orange beak
    eye: '#333333',  // Black eye
    wing: '#F8CD05'  // Slightly darker yellow for wing
  };
  
  // Draw body (circle)
  ctx.beginPath();
  ctx.fillStyle = birdColors.body;
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Determine wing position based on animation frame
  let wingOffset = 0;
  if (frameIndex === 0) wingOffset = -size * 0.1;
  else if (frameIndex === 1) wingOffset = 0;
  else if (frameIndex === 2) wingOffset = size * 0.1;
  
  // Draw wing
  ctx.beginPath();
  ctx.fillStyle = birdColors.wing;
  ctx.ellipse(
    -size * 0.1, 
    wingOffset, 
    size * 0.5, 
    size * 0.25, 
    Math.PI / 4, 
    0, 
    Math.PI * 2
  );
  ctx.fill();
  
  // Draw beak
  ctx.beginPath();
  ctx.fillStyle = birdColors.beak;
  ctx.moveTo(size * 0.4, -size * 0.1);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(size * 0.4, size * 0.1);
  ctx.fill();
  
  // Draw eye
  ctx.beginPath();
  ctx.fillStyle = birdColors.eye;
  ctx.arc(size * 0.2, -size * 0.1, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  
  // Add white reflection in eye
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.arc(size * 0.23, -size * 0.13, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  
  // Restore the context
  ctx.restore();
}

/**
 * Draws text with outline
 */
export function drawText(ctx, text, x, y, size, gameState, canvasRef) {
  // Ensure canvas exists
  const canvas = canvasRef?.current;
  if (!canvas) return;
  
  // Set font size and style
  const fontFamily = gameState.fontFamily || 'Arial, sans-serif';
  const fontSize = size || 24;
  
  // Determine if this is mobile
  const isMobile = window.innerWidth <= 768;
  
  // Scale text for mobile or small canvas
  const scaledFontSize = Math.min(
    fontSize,
    Math.floor(canvas.width / (text.length * 1.2))
  );
  
  ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Draw the text with blue color from gameState
  ctx.fillStyle = gameState.colors.text || '#0077cc';
  ctx.fillText(text, x, y);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Add outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = isMobile ? 1 : 2;
  ctx.strokeText(text, x, y);
}

/**
 * Draws the pipe obstacles
 */
export function drawPipe(ctx, x, y, width, height, isTop, gameState, isMobile) {
  const pipeColors = gameState.colors.pipe;
  
  // Adjust dimensions for mobile if needed
  const pipeWidth = width;
  const lipSize = isMobile ? width * 0.2 : width * 0.15;
  
  // Main pipe body
  ctx.fillStyle = pipeColors.main;
  ctx.fillRect(x, y, pipeWidth, height);
  
  // Pipe lip/border
  ctx.fillStyle = pipeColors.border;
  
  if (isTop) {
    // Top pipe has lip at the bottom
    ctx.fillRect(
      x - lipSize / 2, 
      y + height - lipSize, 
      pipeWidth + lipSize, 
      lipSize
    );
  } else {
    // Bottom pipe has lip at the top
    ctx.fillRect(
      x - lipSize / 2, 
      y, 
      pipeWidth + lipSize, 
      lipSize
    );
  }
  
  // Add highlight effect
  ctx.fillStyle = pipeColors.highlight;
  ctx.fillRect(
    x + pipeWidth * 0.15, 
    y + (isTop ? 0 : lipSize), 
    pipeWidth * 0.15, 
    height - (isTop ? lipSize : 0)
  );
}

/**
 * Draws the game over screen
 */
export function drawGameOver(ctx, score, canvasRef, gameState) {
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
  
  // RSVP Link
  const rsvpFontSize = canvas.width < 500 ? 18 : 28;
  ctx.font = `bold ${rsvpFontSize}px ${gameState.fontFamily || 'Arial, sans-serif'}`;
  
  // Create button-like rectangle
  const buttonWidth = canvas.width * 0.6;
  const buttonHeight = 50;
  const buttonX = (canvas.width - buttonWidth) / 2;
  const buttonY = canvas.height / 2 + 120;
  
  // Draw button background
  const buttonGradient = ctx.createLinearGradient(
    buttonX, buttonY, 
    buttonX + buttonWidth, buttonY + buttonHeight
  );
  buttonGradient.addColorStop(0, '#4CAF50');
  buttonGradient.addColorStop(1, '#388E3C');
  
  ctx.fillStyle = buttonGradient;
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
  ctx.fill();
  
  // Draw button text
  ctx.fillStyle = '#ffffff';
  ctx.fillText('RSVP NOW', canvas.width / 2, buttonY + buttonHeight / 2);
  
  return { 
    rsvpButton: {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    }
  };
}

/**
 * Renders the player score during gameplay
 */
export function drawScore(ctx, score, canvasRef) {
  if (!ctx || !canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const fontSize = canvas.width < 500 ? 24 : 32;
  
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  
  // Draw text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText(score.toString(), canvas.width - 25, 20 + 2);
  
  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(score.toString(), canvas.width - 25, 20);
} 