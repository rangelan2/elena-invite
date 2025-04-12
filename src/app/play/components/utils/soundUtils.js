'use client';

/**
 * soundUtils.js - Handles game audio and sound effects
 */

// Sound paths
const SOUNDS = {
  JUMP: '/sounds/jump.mp3',
  SCORE: '/sounds/score.mp3',
  HIT: '/sounds/hit.mp3',
  DIE: '/sounds/die.mp3',
  WING: '/sounds/wing.mp3',
  BUTTON: '/sounds/button.mp3',
  BACKGROUND: '/sounds/background.mp3',
};

// Cache for loaded audio objects
const audioCache = {};

/**
 * Preloads all game sounds for better performance
 */
export function preloadSounds() {
  Object.values(SOUNDS).forEach(src => {
    loadSound(src);
  });
}

/**
 * Loads a sound into the cache
 */
function loadSound(src) {
  // Only load on client side
  if (typeof window === 'undefined') return null;
  
  if (!audioCache[src]) {
    try {
      const audio = new Audio(src);
      audio.load();
      audioCache[src] = audio;
    } catch (err) {
      console.error('Failed to load sound:', src, err);
      return null;
    }
  }
  
  return audioCache[src];
}

/**
 * Plays a sound effect once
 */
export function playSound(soundName, volume = 1.0) {
  // Skip if on server
  if (typeof window === 'undefined') return;
  
  const src = SOUNDS[soundName];
  if (!src) {
    console.warn(`Sound not found: ${soundName}`);
    return;
  }
  
  try {
    // Get from cache or load
    const sound = audioCache[src] || loadSound(src);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(err => {
        // Common issue: browsers block autoplay until user interaction
        console.warn('Failed to play sound:', err.message);
      });
    }
  } catch (e) {
    console.error('Error playing sound:', e);
  }
}

/**
 * Plays a looping background sound
 */
export function playBackgroundMusic(volume = 0.3) {
  // Skip if on server
  if (typeof window === 'undefined') return;
  
  const src = SOUNDS.BACKGROUND;
  let bgMusic = audioCache[src];
  
  if (!bgMusic) {
    bgMusic = loadSound(src);
    if (!bgMusic) return;
  }
  
  bgMusic.volume = volume;
  bgMusic.loop = true;
  
  bgMusic.play().catch(err => {
    console.warn('Failed to play background music:', err.message);
  });
  
  return bgMusic;
}

/**
 * Stops background music
 */
export function stopBackgroundMusic() {
  const bgMusic = audioCache[SOUNDS.BACKGROUND];
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

/**
 * Mute or unmute all game sounds
 */
export function setMuted(muted) {
  Object.values(audioCache).forEach(audio => {
    if (audio) {
      audio.muted = muted;
    }
  });
}

/**
 * Set volume for all sound effects
 */
export function setSoundEffectsVolume(volume) {
  Object.entries(audioCache).forEach(([src, audio]) => {
    if (audio && src !== SOUNDS.BACKGROUND) {
      audio.volume = volume;
    }
  });
}

/**
 * Set volume for background music only
 */
export function setMusicVolume(volume) {
  const bgMusic = audioCache[SOUNDS.BACKGROUND];
  if (bgMusic) {
    bgMusic.volume = volume;
  }
}

/**
 * Play jump sound for bird flapping
 */
export function playJumpSound() {
  playSound('JUMP', 0.5);
}

/**
 * Play score sound when passing through pipes
 */
export function playScoreSound() {
  playSound('SCORE', 0.7);
}

/**
 * Play hit sound when colliding with obstacles
 */
export function playHitSound() {
  playSound('HIT', 0.6);
}

/**
 * Play death sound for game over
 */
export function playDieSound() {
  playSound('DIE', 0.8);
}

/**
 * Play button click sound for UI interactions
 */
export function playButtonSound() {
  playSound('BUTTON', 0.4);
} 