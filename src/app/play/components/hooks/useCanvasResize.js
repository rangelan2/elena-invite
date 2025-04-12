'use client';

import { useCallback, useEffect } from 'react';

/**
 * Hook to handle canvas resizing and device-specific optimizations
 */
export function useCanvasResize(canvasRef, gameStateRef, isMobile) {
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
    const idealGap = containerHeight * 0.32; // 32% of screen height
    gameState.obstacleGap = Math.max(minGap, idealGap);
    
    // Adjust pipe width based on screen width
    const minWidth = 40; // Minimum width in pixels
    const idealWidth = containerWidth * 0.08; // 8% of screen width
    gameState.obstacleWidth = Math.max(minWidth, Math.min(60, idealWidth));
    
    // Adjust player physics based on screen size
    gameState.player.gravity = isMobile ? 0.4 : 0.5;
    gameState.player.jump = isMobile ? -7 : -8.5;
  }, [canvasRef, gameStateRef, isMobile]);

  // Add resize event listener
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  return resizeCanvas;
} 