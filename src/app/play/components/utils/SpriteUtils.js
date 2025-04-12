'use client';

/**
 * SpriteUtils.js - Handles game sprites, animations, and image resources
 */

// Sprite image paths
const SPRITE_PATHS = {
  BIRD: {
    YELLOW: [
      '/sprites/yellowbird-upflap.png',
      '/sprites/yellowbird-midflap.png',
      '/sprites/yellowbird-downflap.png'
    ],
    RED: [
      '/sprites/redbird-upflap.png',
      '/sprites/redbird-midflap.png',
      '/sprites/redbird-downflap.png'
    ],
    BLUE: [
      '/sprites/bluebird-upflap.png',
      '/sprites/bluebird-midflap.png',
      '/sprites/bluebird-downflap.png'
    ]
  },
  BACKGROUND: {
    DAY: '/sprites/background-day.png',
    NIGHT: '/sprites/background-night.png'
  },
  PIPE: {
    GREEN: {
      TOP: '/sprites/pipe-green-top.png',
      BOTTOM: '/sprites/pipe-green-bottom.png'
    },
    RED: {
      TOP: '/sprites/pipe-red-top.png',
      BOTTOM: '/sprites/pipe-red-bottom.png'
    }
  },
  GROUND: '/sprites/base.png',
  GAMEOVER: '/sprites/gameover.png',
  TITLE: '/sprites/message.png',
  NUMBERS: [
    '/sprites/0.png',
    '/sprites/1.png',
    '/sprites/2.png',
    '/sprites/3.png',
    '/sprites/4.png',
    '/sprites/5.png',
    '/sprites/6.png',
    '/sprites/7.png',
    '/sprites/8.png',
    '/sprites/9.png'
  ],
  MEDAL: {
    BRONZE: '/sprites/medal-bronze.png',
    SILVER: '/sprites/medal-silver.png',
    GOLD: '/sprites/medal-gold.png',
    PLATINUM: '/sprites/medal-platinum.png'
  },
  UI: {
    PLAY_BUTTON: '/sprites/play-button.png',
    REPLAY_BUTTON: '/sprites/replay-button.png',
    PAUSE_BUTTON: '/sprites/pause-button.png',
    SOUND_ON: '/sprites/sound-on.png',
    SOUND_OFF: '/sprites/sound-off.png',
    SETTINGS: '/sprites/settings.png',
    SCOREBOARD: '/sprites/scoreboard.png'
  },
  CLOUDS: [
    '/sprites/cloud1.png',
    '/sprites/cloud2.png',
    '/sprites/cloud3.png'
  ]
};

// Image cache for performance
const imageCache = {};

/**
 * Preloads images to ensure they're available when needed
 */
export function preloadImages() {
  // Flatten all sprite paths into a single array
  const allImages = [
    ...Object.values(SPRITE_PATHS.BIRD.YELLOW),
    ...Object.values(SPRITE_PATHS.BIRD.RED),
    ...Object.values(SPRITE_PATHS.BIRD.BLUE),
    ...Object.values(SPRITE_PATHS.BACKGROUND),
    ...Object.values(SPRITE_PATHS.PIPE.GREEN),
    ...Object.values(SPRITE_PATHS.PIPE.RED),
    SPRITE_PATHS.GROUND,
    SPRITE_PATHS.GAMEOVER,
    SPRITE_PATHS.TITLE,
    ...SPRITE_PATHS.NUMBERS,
    ...Object.values(SPRITE_PATHS.MEDAL),
    ...Object.values(SPRITE_PATHS.UI),
    ...SPRITE_PATHS.CLOUDS
  ];

  allImages.forEach(src => {
    if (src) loadImage(src);
  });
}

/**
 * Loads an image into the cache
 */
function loadImage(src) {
  // Only load on client side
  if (typeof window === 'undefined') return null;
  
  if (!imageCache[src]) {
    try {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
      
      // Return a promise that resolves when the image is loaded
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          reject(new Error(`Failed to load image: ${src}`));
        };
      });
    } catch (err) {
      console.error('Error creating image:', src, err);
      return null;
    }
  }
  
  return imageCache[src];
}

/**
 * Get a loaded image from cache or load it
 */
export function getImage(src) {
  // Only run on client side
  if (typeof window === 'undefined') return null;
  
  return imageCache[src] || loadImage(src);
}

/**
 * Get a bird sprite based on color and animation frame
 */
export function getBirdSprite(color = 'YELLOW', frame = 0) {
  const birdColor = SPRITE_PATHS.BIRD[color.toUpperCase()] || SPRITE_PATHS.BIRD.YELLOW;
  const index = Math.abs(frame % birdColor.length);
  return getImage(birdColor[index]);
}

/**
 * Get a background sprite (day or night)
 */
export function getBackgroundSprite(isNight = false) {
  const bgType = isNight ? 'NIGHT' : 'DAY';
  return getImage(SPRITE_PATHS.BACKGROUND[bgType]);
}

/**
 * Get pipe sprite based on color and position
 */
export function getPipeSprite(color = 'GREEN', isTop = false) {
  const pipeColor = SPRITE_PATHS.PIPE[color.toUpperCase()] || SPRITE_PATHS.PIPE.GREEN;
  const position = isTop ? 'TOP' : 'BOTTOM';
  return getImage(pipeColor[position]);
}

/**
 * Get ground sprite
 */
export function getGroundSprite() {
  return getImage(SPRITE_PATHS.GROUND);
}

/**
 * Get game over sprite
 */
export function getGameOverSprite() {
  return getImage(SPRITE_PATHS.GAMEOVER);
}

/**
 * Get title sprite
 */
export function getTitleSprite() {
  return getImage(SPRITE_PATHS.TITLE);
}

/**
 * Get digit sprite for score display
 */
export function getNumberSprite(digit) {
  const index = Math.min(Math.max(parseInt(digit, 10), 0), 9);
  return getImage(SPRITE_PATHS.NUMBERS[index]);
}

/**
 * Get medal sprite based on score threshold
 */
export function getMedalSprite(score) {
  let medalType = null;
  
  if (score >= 40) medalType = 'PLATINUM';
  else if (score >= 30) medalType = 'GOLD';
  else if (score >= 20) medalType = 'SILVER';
  else if (score >= 10) medalType = 'BRONZE';
  
  return medalType ? getImage(SPRITE_PATHS.MEDAL[medalType]) : null;
}

/**
 * Get UI element sprite
 */
export function getUISprite(elementName) {
  const element = SPRITE_PATHS.UI[elementName.toUpperCase()];
  return element ? getImage(element) : null;
}

/**
 * Get random cloud sprite
 */
export function getRandomCloudSprite() {
  const index = Math.floor(Math.random() * SPRITE_PATHS.CLOUDS.length);
  return getImage(SPRITE_PATHS.CLOUDS[index]);
}

/**
 * Draws sprite with animation frame
 */
export function drawAnimatedSprite(ctx, sprite, x, y, width, height, frameCount, frameIndex, frameDelay = 5) {
  if (!sprite) return;
  
  const frame = Math.floor(frameIndex / frameDelay) % frameCount;
  ctx.drawImage(sprite, x, y, width, height);
}

/**
 * Create a sprite animation sequence
 */
export function createSpriteAnimation(spritePaths, frameDelay = 5) {
  return {
    sprites: spritePaths.map(path => getImage(path)),
    frameDelay,
    currentFrame: 0,
    
    update() {
      this.currentFrame = (this.currentFrame + 1) % (this.sprites.length * this.frameDelay);
    },
    
    getCurrentSprite() {
      const index = Math.floor(this.currentFrame / this.frameDelay);
      return this.sprites[index];
    }
  };
}

// Export sprite paths for direct access
export { SPRITE_PATHS }; 