'use client';

/**
 * renderUtils.js - Handles all canvas rendering operations
 */

import { GAME_STATES, GAME_SETTINGS, formatScore } from './gameStateUtils';

/**
 * Clears the canvas
 */
export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Renders the background (sky and clouds)
 */
export function renderBackground(ctx, clouds) {
  // Draw floor background
  // const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_SETTINGS.CANVAS_HEIGHT);
  // skyGradient.addColorStop(0, '#70c5ce');
  // skyGradient.addColorStop(1, '#b3e5fc');
  
  ctx.fillStyle = '#8B4513'; // Wood brown for floor
  ctx.fillRect(0, 0, GAME_SETTINGS.CANVAS_WIDTH, GAME_SETTINGS.CANVAS_HEIGHT);
  
  // Keep cloud drawing logic if needed, or remove/comment if not desired for floor
  // clouds.forEach(cloud => { ... });
}

/**
 * Renders the ground
 */
export function renderGround(ctx, groundOffset, groundImage) {
  const groundY = GAME_SETTINGS.CANVAS_HEIGHT - GAME_SETTINGS.GROUND_HEIGHT;
  
  // If ground image is loaded and not broken, use it
  if (groundImage && groundImage.complete && groundImage.naturalWidth !== 0) {
    try {
      // Draw ground with scrolling effect
      ctx.drawImage(groundImage, -groundOffset, groundY);
      ctx.drawImage(groundImage, -groundOffset + 336, groundY); // 336 is the width of the ground sprite
    } catch (error) {
      console.warn('Error drawing ground image:', error);
      renderFallbackGround(ctx, groundY);
    }
  } else {
    // Fallback if image isn't loaded or is broken
    renderFallbackGround(ctx, groundY);
  }
}

/**
 * Fallback ground rendering when image is not available
 */
function renderFallbackGround(ctx, groundY) {
  // Draw ground matching GameCanvas style
  ctx.fillStyle = '#DED895'; // Main ground color from GameCanvas
  ctx.fillRect(0, groundY, GAME_SETTINGS.CANVAS_WIDTH, GAME_SETTINGS.GROUND_HEIGHT);
  
  // Draw ground pattern (simplified version)
  ctx.fillStyle = '#C0AB72'; // Pattern color from GameCanvas
  const patternStep = 48; // Use a fixed step or adjust based on GAME_SETTINGS if needed
  // Note: groundOffset is not available here, so pattern won't scroll
  // If scrolling is desired, groundOffset needs to be passed or managed differently
  for (let x = 0; x < GAME_SETTINGS.CANVAS_WIDTH; x += patternStep) {
    ctx.fillRect(x, groundY + (GAME_SETTINGS.GROUND_HEIGHT / 4), patternStep/2, 24); // Adjusted Y position
  }
}

/**
 * Renders the bird
 */
export function renderBird(ctx, bird, birdSprites) {
  ctx.save();
  
  // Translate to bird center
  ctx.translate(bird.x, bird.y);
  
  // Rotate based on velocity (for diving effect)
  const rotation = bird.velocity * 0.05;
  ctx.rotate(Math.min(Math.PI/4, Math.max(-Math.PI/4, rotation)));
  
  // If bird sprites are loaded and not broken, use them
  if (birdSprites && birdSprites[bird.color] && 
      birdSprites[bird.color][bird.frameIndex] && 
      birdSprites[bird.color][bird.frameIndex].complete && 
      birdSprites[bird.color][bird.frameIndex].naturalWidth !== 0) {
    try {
      const sprite = birdSprites[bird.color][bird.frameIndex];
      ctx.drawImage(
        sprite, 
        -bird.width/2, 
        -bird.height/2, 
        bird.width, 
        bird.height
      );
    } catch (error) {
      console.warn('Error drawing bird sprite:', error);
      renderFallbackBird(ctx, bird);
    }
  } else {
    // Fallback if sprites aren't loaded or are broken
    renderFallbackBird(ctx, bird);
  }
  
  ctx.restore();
}

/**
 * Fallback bird rendering when sprite is not available
 */
function renderFallbackBird(ctx, bird) {
  // Draw wedding ring instead of bird (logic copied from GameCanvas.js)
  const playerWidth = bird.width; // Use bird dimensions
  const playerHeight = bird.height;

  // Main ring band (gold)
  ctx.fillStyle = '#FFFF00'; // Bright gold/yellow color
  ctx.beginPath();
  // Adjust radii based on bird dimensions
  ctx.arc(0, 0, playerWidth/2 - 4, 0, Math.PI * 2);
  ctx.arc(0, 0, playerWidth/2 - 12, 0, Math.PI * 2, true);
  ctx.fill();
  
  // Ring outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, playerWidth/2 - 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, playerWidth/2 - 12, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw 8-bit style diamond
  const diamondSize = Math.min(24, playerWidth * 0.6); // Scale diamond size relative to ring
  const diamondX = -diamondSize/2;
  // Position diamond above the center of the ring
  const diamondY = -playerHeight/2 - diamondSize/2 + 5; // Adjust vertical offset if needed
  
  // Draw 8-bit pixel diamond (simplified relative positioning)
  ctx.fillStyle = '#4FC3F7'; // Light blue for diamond
  
  // Simplified pixel drawing (relative sizes might need fine-tuning)
  // Center row (widest part)
  ctx.fillRect(diamondX, diamondY + diamondSize*0.4, diamondSize, diamondSize*0.2);
  // Rows above center
  ctx.fillRect(diamondX + diamondSize*0.15, diamondY + diamondSize*0.2, diamondSize*0.7, diamondSize*0.2);
  ctx.fillRect(diamondX + diamondSize*0.3, diamondY, diamondSize*0.4, diamondSize*0.2);
  // Rows below center
  ctx.fillRect(diamondX + diamondSize*0.15, diamondY + diamondSize*0.6, diamondSize*0.7, diamondSize*0.2);
  ctx.fillRect(diamondX + diamondSize*0.3, diamondY + diamondSize*0.8, diamondSize*0.4, diamondSize*0.2);

  // Diamond outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(diamondX, diamondY + diamondSize*0.4, diamondSize, diamondSize*0.2);
  ctx.strokeRect(diamondX + diamondSize*0.15, diamondY + diamondSize*0.2, diamondSize*0.7, diamondSize*0.2);
  ctx.strokeRect(diamondX + diamondSize*0.3, diamondY, diamondSize*0.4, diamondSize*0.2);
  ctx.strokeRect(diamondX + diamondSize*0.15, diamondY + diamondSize*0.6, diamondSize*0.7, diamondSize*0.2);
  ctx.strokeRect(diamondX + diamondSize*0.3, diamondY + diamondSize*0.8, diamondSize*0.4, diamondSize*0.2);
  
  // Highlights/Shadows (simplified)
  ctx.fillStyle = '#81D4FA'; // Highlight
  ctx.fillRect(diamondX + diamondSize*0.3, diamondY, diamondSize*0.4, diamondSize*0.2); // Top pixel
  ctx.fillStyle = '#039BE5'; // Shadow
  ctx.fillRect(diamondX + diamondSize*0.3, diamondY + diamondSize*0.8, diamondSize*0.4, diamondSize*0.2); // Bottom pixel
}

/**
 * Renders pipes
 */
export function renderPipes(ctx, pipes, pipeImages) {
  pipes.forEach(pipe => {
    // Top pipe (upside down)
    if (pipeImages && pipeImages.top && pipeImages.top.complete && pipeImages.top.naturalWidth !== 0) {
      try {
        ctx.save();
        ctx.translate(pipe.x + pipe.width/2, pipe.gapY);
        ctx.scale(1, -1); // Flip vertically
        ctx.drawImage(
          pipeImages.top, 
          -pipe.width/2, 
          0, 
          pipe.width, 
          pipe.gapY
        );
        ctx.restore();
      } catch (error) {
        console.warn('Error drawing top pipe image:', error);
        renderFallbackTopPipe(ctx, pipe);
      }
    } else {
      // Fallback if image isn't loaded or is broken
      renderFallbackTopPipe(ctx, pipe);
    }
    
    // Bottom pipe
    if (pipeImages && pipeImages.bottom && pipeImages.bottom.complete && pipeImages.bottom.naturalWidth !== 0) {
      try {
        ctx.drawImage(
          pipeImages.bottom, 
          pipe.x, 
          pipe.gapY + pipe.gapHeight, 
          pipe.width, 
          GAME_SETTINGS.CANVAS_HEIGHT - (pipe.gapY + pipe.gapHeight)
        );
      } catch (error) {
        console.warn('Error drawing bottom pipe image:', error);
        renderFallbackBottomPipe(ctx, pipe);
      }
    } else {
      // Fallback if image isn't loaded or is broken
      renderFallbackBottomPipe(ctx, pipe);
    }
  });
}

/**
 * Fallback top pipe rendering when image is not available
 */
function renderFallbackTopPipe(ctx, pipe) {
  // Draw top bench (using colors from GameCanvas)
  const width = pipe.width;
  const height = pipe.gapY;
  const x = pipe.x;
  const y = 0;
  const capHeight = 20; // Keep cap height

  // Main bench body
  ctx.fillStyle = '#DEB887'; // Light wood
  ctx.fillRect(x, y, width, height);

  // Add black outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Bench cap (bottom edge for top pipe)
  const capWidth = width + 8;
  const capX = x - 4;
  const capY = y + height - capHeight;
  ctx.fillStyle = '#A0522D'; // Medium brown shadow color used as cap base
  ctx.fillRect(capX, capY, capWidth, capHeight);
  ctx.strokeRect(capX, capY, capWidth, capHeight);

  // Highlights / Shadows (simplified version)
  // Highlight (left side)
  ctx.fillStyle = '#F5F5DC'; // Beige highlight
  ctx.fillRect(x + 4, y, 4, height - capHeight);
  ctx.fillRect(capX + 4, capY, 4, capHeight);

  // Shadow (right side) - Use main cap color (#A0522D) for simplicity or a darker one
  // ctx.fillStyle = '#A0522D'; // Medium brown shadow
  // ctx.fillRect(x + width - 8, y, 4, height - capHeight);
  // ctx.fillRect(capX + capWidth - 8, capY, 4, capHeight);
}

/**
 * Fallback bottom pipe rendering when image is not available
 */
function renderFallbackBottomPipe(ctx, pipe) {
  // Draw bottom bench (using colors from GameCanvas)
  const width = pipe.width;
  const height = GAME_SETTINGS.CANVAS_HEIGHT - (pipe.gapY + pipe.gapHeight);
  const x = pipe.x;
  const y = pipe.gapY + pipe.gapHeight;
  const capHeight = 20; // Keep cap height

  // Main bench body
  ctx.fillStyle = '#DEB887'; // Light wood
  ctx.fillRect(x, y, width, height);

  // Add black outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Bench cap (top edge for bottom pipe)
  const capWidth = width + 8;
  const capX = x - 4;
  const capY = y; // Cap is at the top of the bottom pipe
  ctx.fillStyle = '#A0522D'; // Medium brown shadow color used as cap base
  ctx.fillRect(capX, capY, capWidth, capHeight);
  ctx.strokeRect(capX, capY, capWidth, capHeight);

  // Highlights / Shadows (simplified version)
  // Highlight (left side)
  ctx.fillStyle = '#F5F5DC'; // Beige highlight
  ctx.fillRect(x + 4, y + capHeight, 4, height - capHeight);
  ctx.fillRect(capX + 4, capY, 4, capHeight);

  // Shadow (right side) - Use main cap color (#A0522D) for simplicity or a darker one
  // ctx.fillStyle = '#A0522D'; // Medium brown shadow
  // ctx.fillRect(x + width - 8, y + capHeight, 4, height - capHeight);
  // ctx.fillRect(capX + capWidth - 8, capY, 4, capHeight);
}

/**
 * Renders the score during gameplay
 */
export function renderScore(ctx, score) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const formattedScore = formatScore(score);
  ctx.strokeText(formattedScore, GAME_SETTINGS.CANVAS_WIDTH / 2, 50);
  ctx.fillText(formattedScore, GAME_SETTINGS.CANVAS_WIDTH / 2, 50);
}

/**
 * Renders the flash effect
 */
export function renderFlash(ctx, flash) {
  if (flash.active) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flash.alpha})`;
    ctx.fillRect(0, 0, GAME_SETTINGS.CANVAS_WIDTH, GAME_SETTINGS.CANVAS_HEIGHT);
  }
}

/**
 * Renders the menu screen
 */
export function renderMenu(ctx, titleImage, messageImage) {
  // Title
  if (titleImage && titleImage.complete && titleImage.naturalWidth !== 0) {
    try {
      const titleX = (GAME_SETTINGS.CANVAS_WIDTH - titleImage.width) / 2;
      ctx.drawImage(titleImage, titleX, 80);
    } catch (error) {
      console.warn('Error drawing title image:', error);
      renderFallbackTitle(ctx);
    }
  } else {
    // Fallback title text
    renderFallbackTitle(ctx);
  }
  
  // "Tap to start" message
  if (messageImage && messageImage.complete && messageImage.naturalWidth !== 0) {
    try {
      const messageX = (GAME_SETTINGS.CANVAS_WIDTH - messageImage.width) / 2;
      ctx.drawImage(messageImage, messageX, 200);
    } catch (error) {
      console.warn('Error drawing message image:', error);
      renderFallbackMessage(ctx);
    }
  } else {
    // Fallback message text
    renderFallbackMessage(ctx);
  }
}

/**
 * Renders fallback title when image is not available
 */
function renderFallbackTitle(ctx) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('RING BEARER', GAME_SETTINGS.CANVAS_WIDTH / 2, 90);
  ctx.fillText('RING BEARER', GAME_SETTINGS.CANVAS_WIDTH / 2, 90);
  ctx.strokeText('MINIGAME', GAME_SETTINGS.CANVAS_WIDTH / 2, 130);
  ctx.fillText('MINIGAME', GAME_SETTINGS.CANVAS_WIDTH / 2, 130);
}

/**
 * Renders fallback message when image is not available
 */
function renderFallbackMessage(ctx) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('Tap to Start', GAME_SETTINGS.CANVAS_WIDTH / 2, 220);
  ctx.fillText('Tap to Start', GAME_SETTINGS.CANVAS_WIDTH / 2, 220);
}

/**
 * Renders the "Get Ready" screen
 */
export function renderGetReady(ctx, readyImage, instructionImage) {
  // Ready text/image
  if (readyImage && readyImage.complete && readyImage.naturalWidth !== 0) {
    try {
      const readyX = (GAME_SETTINGS.CANVAS_WIDTH - readyImage.width) / 2;
      ctx.drawImage(readyImage, readyX, 80);
    } catch (error) {
      console.warn('Error drawing ready image:', error);
      renderFallbackReady(ctx);
    }
  } else {
    // Fallback ready text
    renderFallbackReady(ctx);
  }
  
  // Tap instruction
  if (instructionImage && instructionImage.complete && instructionImage.naturalWidth !== 0) {
    try {
      const instructionX = (GAME_SETTINGS.CANVAS_WIDTH - instructionImage.width) / 2;
      ctx.drawImage(instructionImage, instructionX, 200);
    } catch (error) {
      console.warn('Error drawing instruction image:', error);
      renderFallbackInstruction(ctx);
    }
  } else {
    // Fallback instruction
    renderFallbackInstruction(ctx);
  }
}

/**
 * Renders fallback ready text when image is not available
 */
function renderFallbackReady(ctx) {
  const canvasWidth = GAME_SETTINGS.CANVAS_WIDTH;
  const maxWidth = canvasWidth - 40; // Provide some margin
  
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  
  // Title
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('GET READY!', canvasWidth / 2, 100);
  ctx.fillText('GET READY!', canvasWidth / 2, 100);
  
  // Main instruction - measure to ensure it fits
  ctx.font = 'bold 18px Arial';
  ctx.lineWidth = 1.5;
  
  const instruction1 = 'Make sure the ring gets down the aisle';
  const instruction2 = 'Avoid the pews and make it to I do!';
  
  // Draw first instruction line with wrapping if needed
  if (ctx.measureText(instruction1).width > maxWidth) {
    // Split the first instruction if too long
    const midPoint = Math.floor(instruction1.length / 2);
    const breakPoint = instruction1.lastIndexOf(' ', midPoint);
    
    // Line 1
    ctx.strokeText(instruction1.substring(0, breakPoint), canvasWidth / 2, 140);
    ctx.fillText(instruction1.substring(0, breakPoint), canvasWidth / 2, 140);
    
    // Line 2
    ctx.strokeText(instruction1.substring(breakPoint), canvasWidth / 2, 165);
    ctx.fillText(instruction1.substring(breakPoint), canvasWidth / 2, 165);
    
    // Line 3 (second instruction)
    ctx.strokeText(instruction2, canvasWidth / 2, 190);
    ctx.fillText(instruction2, canvasWidth / 2, 190);
  } else {
    // No wrapping needed, draw normally
    ctx.strokeText(instruction1, canvasWidth / 2, 145);
    ctx.fillText(instruction1, canvasWidth / 2, 145);
    
    ctx.strokeText(instruction2, canvasWidth / 2, 175);
    ctx.fillText(instruction2, canvasWidth / 2, 175);
  }
}

/**
 * Renders fallback instruction when image is not available
 */
function renderFallbackInstruction(ctx) {
  // Draw an arrow pointing up
  ctx.beginPath();
  ctx.moveTo(GAME_SETTINGS.CANVAS_WIDTH / 2, 220);
  ctx.lineTo(GAME_SETTINGS.CANVAS_WIDTH / 2, 240);
  ctx.lineTo(GAME_SETTINGS.CANVAS_WIDTH / 2 - 10, 230);
  ctx.moveTo(GAME_SETTINGS.CANVAS_WIDTH / 2, 240);
  ctx.lineTo(GAME_SETTINGS.CANVAS_WIDTH / 2 + 10, 230);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Renders the game over screen
 */
export function renderGameOver(ctx, gameOverImage, scoreboardImage, score, highScore, medalAwarded, medals) {
  const canvasWidth = GAME_SETTINGS.CANVAS_WIDTH;
  const canvasHeight = GAME_SETTINGS.CANVAS_HEIGHT;
  
  // Draw Game Over title
  if (gameOverImage && gameOverImage.complete && gameOverImage.naturalWidth !== 0) {
    try {
      const gameOverX = (canvasWidth - gameOverImage.width) / 2;
      ctx.drawImage(gameOverImage, gameOverX, 70);
    } catch (error) {
      console.warn('Error drawing game over image:', error);
      renderFallbackGameOver(ctx);
    }
  } else {
    // Fallback game over text
    renderFallbackGameOver(ctx);
  }
  
  // Draw white box for Save the Date content
  const boxWidth = canvasWidth * 0.85;
  const boxHeight = 220;
  const boxX = (canvasWidth - boxWidth) / 2;
  const boxY = 140;
  const cornerRadius = 10;
  
  // Draw white box with rounded corners
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  
  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(boxX + cornerRadius, boxY);
  ctx.lineTo(boxX + boxWidth - cornerRadius, boxY);
  ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + cornerRadius);
  ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerRadius);
  ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - cornerRadius, boxY + boxHeight);
  ctx.lineTo(boxX + cornerRadius, boxY + boxHeight);
  ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - cornerRadius);
  ctx.lineTo(boxX, boxY + cornerRadius);
  ctx.quadraticCurveTo(boxX, boxY, boxX + cornerRadius, boxY);
  ctx.closePath();
  
  // Add shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  
  // Reset shadow before stroke
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();
  
  // Available width for text
  const textMaxWidth = boxWidth - 30; // 15px padding on each side
  
  // Draw Save the Date content
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Helper function to measure and potentially reduce font size
  const fitText = (text, fontSize, maxFontSize, minFontSize) => {
    ctx.font = `bold ${maxFontSize}px Arial`;
    let currentSize = maxFontSize;
    
    while (ctx.measureText(text).width > textMaxWidth && currentSize > minFontSize) {
      currentSize -= 1;
      ctx.font = `bold ${currentSize}px Arial`;
    }
    
    return currentSize;
  };
  
  // Heading - adjust font size if needed
  const headingSize = fitText('Save the date for our wedding!', 22, 22, 16);
  ctx.font = `bold ${headingSize}px Arial`;
  ctx.fillText('Save the date for our wedding!', canvasWidth / 2, boxY + 40);
  
  // Date
  const dateSize = fitText('May 16, 2026', 28, 28, 22);
  ctx.font = `bold ${dateSize}px Arial`;
  ctx.fillText('May 16, 2026', canvasWidth / 2, boxY + 85);
  
  // Supporting text
  ctx.font = '16px Arial';
  
  // Check if the first line fits, otherwise split it
  const supportText1 = 'Mark your calendar — we can\'t wait to';
  if (ctx.measureText(supportText1).width > textMaxWidth) {
    const words = supportText1.split(' ');
    let line1 = words[0];
    let line2 = '';
    
    for (let i = 1; i < words.length; i++) {
      const testLine = line1 + ' ' + words[i];
      if (ctx.measureText(testLine).width <= textMaxWidth) {
        line1 = testLine;
      } else {
        line2 = words.slice(i).join(' ');
        break;
      }
    }
    
    ctx.fillText(line1, canvasWidth / 2, boxY + 120);
    ctx.fillText(line2, canvasWidth / 2, boxY + 140);
    ctx.fillText('gather again with you.', canvasWidth / 2, boxY + 160);
  } else {
    ctx.fillText(supportText1, canvasWidth / 2, boxY + 125);
    ctx.fillText('gather again with you.', canvasWidth / 2, boxY + 145);
  }
  
  // Final line
  ctx.font = 'italic 13px Arial';
  
  // Break up the final lines to ensure they fit
  const finalText1 = 'Because this story still has chapters left to write —';
  const finalText2 = 'and we want you in the next one.';
  
  if (ctx.measureText(finalText1).width > textMaxWidth) {
    // First part is too long, break it up
    const breakPoint = finalText1.lastIndexOf(' ', finalText1.length / 2);
    ctx.fillText(finalText1.substring(0, breakPoint), canvasWidth / 2, boxY + 175);
    ctx.fillText(finalText1.substring(breakPoint + 1), canvasWidth / 2, boxY + 190);
    ctx.fillText(finalText2, canvasWidth / 2, boxY + 205);
  } else {
    ctx.fillText(finalText1, canvasWidth / 2, boxY + 180);
    ctx.fillText(finalText2, canvasWidth / 2, boxY + 200);
  }
  
  // Draw score at the bottom (outside the box)
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`Score: ${formatScore(score)} | Best: ${formatScore(highScore)}`, canvasWidth / 2, boxY + boxHeight + 30);
  
  // Draw buttons
  const buttonY = boxY + boxHeight + 60;
  const buttonHeight = 32;
  const buttonPadding = 10;
  const buttonMargin = 10;
  
  // Play Again button
  const playAgainText = 'Play Again';
  const playAgainWidth = ctx.measureText(playAgainText).width + buttonPadding * 2;
  const playAgainX = canvasWidth / 2 - playAgainWidth / 2; // Center the button
  
  // Draw Play Again button (green with black border)
  ctx.fillStyle = '#8BC34A';
  ctx.strokeStyle = 'black';
  
  // Rounded rectangle for Play Again button
  ctx.beginPath();
  ctx.roundRect(playAgainX, buttonY, playAgainWidth, buttonHeight, 8);
  ctx.fill();
  ctx.stroke();
  
  // Play Again text
  ctx.fillStyle = 'black';
  ctx.fillText(playAgainText, playAgainX + playAgainWidth / 2, buttonY + buttonHeight / 2);
  
  // Store button positions for click detection
  // These values will be used by the game to detect clicks on buttons
  return {
    playAgainButton: {
      x: playAgainX,
      y: buttonY,
      width: playAgainWidth,
      height: buttonHeight
    }
  };
}

/**
 * Renders fallback game over text
 */
function renderFallbackGameOver(ctx) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('GAME OVER', GAME_SETTINGS.CANVAS_WIDTH / 2, 100);
  ctx.fillText('GAME OVER', GAME_SETTINGS.CANVAS_WIDTH / 2, 100);
}

/**
 * Renders the score board
 */
export function renderScoreboard(ctx, scoreboardImage) {
  const boardWidth = 200;
  const boardHeight = 150;
  const boardX = (GAME_SETTINGS.CANVAS_WIDTH - boardWidth) / 2;
  const boardY = 180;
  
  if (scoreboardImage && scoreboardImage.complete && scoreboardImage.naturalWidth !== 0) {
    try {
      ctx.drawImage(scoreboardImage, boardX, boardY);
    } catch (error) {
      console.warn('Error drawing scoreboard image:', error);
      renderFallbackScoreboard(ctx, boardX, boardY, boardWidth, boardHeight);
    }
  } else {
    // Fallback scoreboard
    renderFallbackScoreboard(ctx, boardX, boardY, boardWidth, boardHeight);
  }
}

/**
 * Renders fallback scoreboard
 */
function renderFallbackScoreboard(ctx, x, y, width, height) {
  ctx.fillStyle = '#dda15e';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#bc6c25';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, width, height);
}

/**
 * Renders the medal
 */
export function renderMedal(ctx, medalImage, medalType) {
  const medalSize = 40;
  
  if (medalImage && medalImage.complete && medalImage.naturalWidth !== 0) {
    try {
      ctx.drawImage(medalImage, GAME_SETTINGS.CANVAS_WIDTH / 2 - medalSize / 2, GAME_SETTINGS.CANVAS_HEIGHT / 2 - medalSize / 2, medalSize, medalSize);
    } catch (error) {
      console.warn(`Error drawing ${medalType} medal:`, error);
      renderFallbackMedal(ctx, GAME_SETTINGS.CANVAS_WIDTH / 2 - medalSize / 2, GAME_SETTINGS.CANVAS_HEIGHT / 2 - medalSize / 2, medalSize, medalType);
    }
  } else {
    // Fallback medal
    renderFallbackMedal(ctx, GAME_SETTINGS.CANVAS_WIDTH / 2 - medalSize / 2, GAME_SETTINGS.CANVAS_HEIGHT / 2 - medalSize / 2, medalSize, medalType);
  }
}

/**
 * Renders fallback medal
 */
function renderFallbackMedal(ctx, x, y, size, medalType) {
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  
  // Different colors based on medal type
  switch (medalType) {
    case 'bronze':
      ctx.fillStyle = '#cd7f32';
      break;
    case 'silver':
      ctx.fillStyle = '#c0c0c0';
      break;
    case 'gold':
      ctx.fillStyle = '#ffd700';
      break;
    case 'platinum':
      ctx.fillStyle = '#e5e4e2';
      break;
    default:
      ctx.fillStyle = '#ffffff';
  }
  
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Main render function that handles all game rendering based on game state
 */
export function renderGame(ctx, gameState, assets) {
  clearCanvas(ctx, GAME_SETTINGS.CANVAS_WIDTH, GAME_SETTINGS.CANVAS_HEIGHT);
  
  // Always render background, ground, and bird
  renderBackground(ctx, gameState.clouds);
  renderGround(ctx, gameState.groundOffset, assets?.ground);
  renderBird(ctx, gameState.bird, assets?.birdSprites);
  
  // Render pipes when playing or game over
  if (gameState.gameState === GAME_STATES.PLAYING || 
      gameState.gameState === GAME_STATES.GAME_OVER) {
    renderPipes(ctx, gameState.pipes, assets?.pipes);
  }
  
  // Flash effect
  renderFlash(ctx, gameState.flash);
  
  // Render UI based on game state
  switch (gameState.gameState) {
    case GAME_STATES.MENU:
      renderMenu(ctx, assets?.title, assets?.tapToStart);
      break;
      
    case GAME_STATES.READY:
      renderGetReady(ctx, assets?.getReady, assets?.instruction);
      break;
      
    case GAME_STATES.PLAYING:
      renderScore(ctx, gameState.score);
      break;
      
    case GAME_STATES.GAME_OVER:
      // Do nothing here - Game Over UI is handled by GameHUD component
      // We still render pipes above, and background/ground/bird before the switch
      break;
      
    default:
      break;
  }
}

/**
 * Preloads all game assets (images)
 */
export function preloadAssets() {
  return new Promise((resolve) => {
    const assets = {};
    let loadedCount = 0;
    let errorCount = 0;
    // Correctly define the total number of assets we expect to load
    const totalAssets = 7; // title(1) + getReady(1) + gameOver(1) + medals(4) = 7

    // Create a load tracker that handles both success and error cases
    const createLoadTracker = (image, name, assetKey, subKey = null, index = null) => {
      image.onload = () => {
        console.log(`Successfully loaded: ${name}`);
        loadedCount++;
        checkAllLoaded();
      };
      
      image.onerror = (err) => {
        console.warn(`Failed to load image: ${name}`, err);
        // Explicitly set the asset to null on error
        if (subKey) {
          if (index !== null) {
            if (assets[assetKey] && assets[assetKey][subKey]) {
              assets[assetKey][subKey][index] = null;
            }
          } else {
            if (assets[assetKey]) {
              assets[assetKey][subKey] = null;
            }
          }
        } else {
          assets[assetKey] = null;
        }
        errorCount++;
        checkAllLoaded();
      };
      
      // Set crossOrigin to anonymous for CORS support
      image.crossOrigin = "anonymous";
      
      return image;
    };
    
    // Check if all assets have been processed (either loaded or failed)
    const checkAllLoaded = () => {
      // Use the correct totalAssets count
      if (loadedCount + errorCount >= totalAssets) {
        console.log(`Assets loaded: ${loadedCount}/${totalAssets} (${errorCount} errors)`);
        resolve(assets);
      }
    };

    // Load ground - COMMENTED OUT
    // assets.ground = new Image();
    // createLoadTracker(assets.ground, 'ground', 'ground');
    // assets.ground.src = '/images/ground.png';
    assets.ground = null; // Explicitly set to null
    // No need to decrement totalAssets

    // Load bird sprites - COMMENTED OUT
    assets.birdSprites = { yellow: [], red: [], blue: [] };
    // for (let i = 0; i < 3; i++) { ... }
    assets.birdSprites.yellow = [null, null, null]; // Explicitly set to null array
    // No need to decrement totalAssets

    // Load pipe images - COMMENTED OUT
    assets.pipes = {};
    // assets.pipes.top = new Image();
    // assets.pipes.bottom = new Image();
    // createLoadTracker(assets.pipes.top, 'pipe-top', 'pipes', 'top');
    // createLoadTracker(assets.pipes.bottom, 'pipe-bottom', 'pipes', 'bottom');
    // assets.pipes.top.src = '/images/pipe-top.png';
    // assets.pipes.bottom.src = '/images/pipe-bottom.png';
    assets.pipes.top = null;
    assets.pipes.bottom = null;
    // No need to decrement totalAssets
    
    // Load UI elements (Keep these - total 7)
    assets.title = new Image();
    createLoadTracker(assets.title, 'title', 'title');
    assets.title.src = '/images/title.png'; // 1

    assets.getReady = new Image();
    createLoadTracker(assets.getReady, 'get-ready', 'getReady');
    assets.getReady.src = '/images/get-ready.png'; // 2

    assets.gameOver = new Image();
    createLoadTracker(assets.gameOver, 'game-over', 'gameOver');
    assets.gameOver.src = '/images/game-over.png'; // 3

    // Load medals (Keep these)
    assets.medals = {};
    assets.medals.bronze = new Image();
    assets.medals.silver = new Image();
    assets.medals.gold = new Image();
    assets.medals.platinum = new Image();
    createLoadTracker(assets.medals.bronze, 'medal-bronze', 'medals', 'bronze'); // 4
    createLoadTracker(assets.medals.silver, 'medal-silver', 'medals', 'silver'); // 5
    createLoadTracker(assets.medals.gold, 'medal-gold', 'medals', 'gold'); // 6
    createLoadTracker(assets.medals.platinum, 'medal-platinum', 'medals', 'platinum'); // 7
    assets.medals.bronze.src = '/images/medal-bronze.png';
    assets.medals.silver.src = '/images/medal-silver.png';
    assets.medals.gold.src = '/images/medal-gold.png';
    assets.medals.platinum.src = '/images/medal-platinum.png';

    // Set a timeout in case some assets are taking too long
    setTimeout(() => {
      // Use the final calculated totalAssets for the check
      if (loadedCount + errorCount < totalAssets) {
        console.warn(`Timeout: Only ${loadedCount}/${totalAssets} required assets loaded after 5 seconds`);
        resolve(assets); // Resolve anyway, the fallbacks should handle missing UI assets too
      }
    }, 5000);
  });
} 