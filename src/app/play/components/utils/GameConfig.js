'use client';

/**
 * GameConfig.js
 * Contains all game configuration settings and default values
 */

export const DEFAULT_GAME_CONFIG = {
  // Canvas settings
  canvas: {
    width: 360,
    height: 640,
    backgroundColor: '#87CEEB', // Sky blue
  },
  
  // Game physics
  physics: {
    gravity: 0.5,
    jumpVelocity: -8,
    maxVelocity: 10,
    groundHeight: 100,
  },
  
  // Player settings
  player: {
    size: 30,
    startX: 80,
    startY: 300,
    animationSpeed: 8, // Frames until animation update
    rotationFactor: 0.15,
    minRotation: -0.5,
    maxRotation: Math.PI / 2,
  },
  
  // Obstacle settings
  obstacles: {
    width: 70,
    gap: 180,
    minY: 120,
    speed: 3,
    spawnInterval: 1500, // ms
    colors: {
      pipe: {
        main: '#75C043', // Green
        border: '#4D8A2A', // Darker green
        highlight: '#8ED660', // Lighter green
      }
    }
  },
  
  // Ground settings
  ground: {
    color: '#DEB887', // Burlywood (sandy)
    lineColor: '#8B4513', // SaddleBrown (darker)
    stripeWidth: 30,
  },
  
  // Game settings
  game: {
    initialDelay: 2000, // ms before game starts
    scoreSound: true,
    deathSound: true,
    debugMode: false,
  },
  
  // Visual settings
  colors: {
    text: '#FFFFFF', // White
    textShadow: '#000000', // Black
    background: ['#87CEEB', '#E0F7FA'], // Sky gradient
    pipe: {
      main: '#75C043', // Green
      border: '#4D8A2A', // Darker green
      highlight: '#8ED660', // Lighter green
    },
    ground: ['#DEB887', '#D2B48C'], // Ground gradient
  },
  
  // Font settings
  fontFamily: 'Arial, sans-serif',
  fontSize: {
    score: 32,
    title: 48,
    subtitle: 24,
    button: 20,
  },
  
  // Cloud animation settings
  clouds: {
    count: 6,
    minSpeed: 0.2,
    maxSpeed: 0.5,
    minY: 50,
    maxY: 200,
    minSize: 40,
    maxSize: 120,
  },
  
  // Announcement settings
  announcement: {
    show: true,
    title: 'Save the Date',
    subTitle: 'Elena & Anthony',
    date: 'February 15, 2025',
    fontSize: {
      title: 36,
      subTitle: 28,
      date: 24
    },
    color: {
      title: '#FF5252',
      subTitle: '#3F51B5',
      date: '#4CAF50',
      background: 'rgba(255, 255, 255, 0.8)'
    }
  },
  
  // Mobile specific settings
  mobile: {
    scaleFactor: 0.8,
    obstacles: {
      gap: 200, // Wider gap on mobile
      width: 60,
    },
    player: {
      size: 25,
    },
    fontSize: {
      score: 24,
      title: 32,
      subtitle: 18,
    }
  }
};

/**
 * Creates a customized game configuration by merging custom settings with defaults
 */
export function createGameConfig(customConfig = {}) {
  // Deep merge custom config with defaults
  return deepMerge(DEFAULT_GAME_CONFIG, customConfig);
}

/**
 * Helper function to deep merge objects
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Helper to check if value is an object
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Adjusts game configuration based on screen size and device
 */
export function getResponsiveConfig(config) {
  const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
  const isSmallScreen = window.innerWidth <= 500;
  
  let responsive = { ...config };
  
  if (isMobile) {
    // Apply mobile configuration
    responsive = deepMerge(responsive, {
      canvas: {
        width: Math.min(window.innerWidth * 0.95, 360),
        height: Math.min(window.innerHeight * 0.8, 640)
      },
      player: responsive.mobile.player,
      obstacles: responsive.mobile.obstacles,
      fontSize: responsive.mobile.fontSize,
      physics: {
        ...responsive.physics,
        gravity: responsive.physics.gravity * 0.9 // Slightly reduce gravity on mobile
      }
    });
    
    // Adjust obstacle gap for smaller screens
    if (isSmallScreen) {
      responsive.obstacles.gap *= 1.1; // Increase gap for easier play
      responsive.obstacles.speed *= 0.9; // Slow down obstacles slightly
    }
  }
  
  return responsive;
} 