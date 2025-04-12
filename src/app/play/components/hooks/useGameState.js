'use client';

import { useRef } from 'react';

/**
 * Hook to initialize and provide the core game state
 */
export function useGameState() {
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
      pipe: '#8B4513',
      pipeHighlight: '#A0522D',
      pipeShadow: '#654321',
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

  return gameStateRef;
} 