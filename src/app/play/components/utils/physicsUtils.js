'use client';

/**
 * physicsUtils.js - Handles game physics including collision detection, gravity effects,
 * and movement calculations
 */

/**
 * Checks if two rectangles are colliding
 */
export function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Checks if a point is inside a rectangle
 */
export function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Checks if a circle is colliding with a rectangle
 * Useful for more precise bird collision detection
 */
export function circleRectCollision(circle, rect) {
  // Find the closest point to the circle within the rectangle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  
  // Calculate the distance between the circle's center and the closest point
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  
  // If the distance is less than the circle's radius, there is a collision
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  return distanceSquared <= circle.radius * circle.radius;
}

/**
 * Applies gravity to a velocity value
 */
export function applyGravity(velocity, gravity, deltaTime) {
  return velocity + gravity * deltaTime;
}

/**
 * Applies jump impulse to velocity
 */
export function applyJump(velocity, jumpForce) {
  return -jumpForce; // Negative because y-axis is inverted in canvas
}

/**
 * Calculates new position based on velocity
 */
export function updatePosition(position, velocity, deltaTime) {
  return position + velocity * deltaTime;
}

/**
 * Physics constants
 */
export const PHYSICS = {
  GRAVITY: 0.4,
  JUMP_FORCE: 7.5,
  BIRD_TERMINAL_VELOCITY: 12,
  PIPE_SPEED: 2.5,
  GROUND_SPEED: 2.5
};

/**
 * Checks if bird collides with pipes
 */
export function checkBirdPipeCollision(birdBox, pipes) {
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
      height: 600 - (pipe.gapY + pipe.gapHeight) // Assuming canvas height is 600
    };
    
    if (checkCollision(birdBox, topPipeRect) || checkCollision(birdBox, bottomPipeRect)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if bird collides with ground
 */
export function checkBirdGroundCollision(birdBox, groundY) {
  return birdBox.y + birdBox.height >= groundY;
}

/**
 * Checks if bird passes a pipe (for scoring)
 */
export function checkPipePassed(birdX, pipeX, pipeWidth, isPassed) {
  // Bird passes the pipe when its x position is greater than pipe x + pipe width
  // and the pipe hasn't been counted yet (isPassed is false)
  return birdX > pipeX + pipeWidth && !isPassed;
}

/**
 * Creates a new pipe with random gap position
 */
export function createPipe(canvasWidth, gapHeight, minGapY, maxGapY) {
  const gapY = Math.floor(Math.random() * (maxGapY - minGapY) + minGapY);
  
  return {
    x: canvasWidth,
    gapY,
    gapHeight,
    width: 52, // Standard pipe width
    passed: false
  };
}

/**
 * Updates all pipe positions
 */
export function updatePipes(pipes, speed, deltaTime) {
  return pipes.map(pipe => ({
    ...pipe,
    x: pipe.x - speed * deltaTime
  }));
}

/**
 * Remove pipes that have gone off screen
 */
export function cleanupPipes(pipes, removeX) {
  return pipes.filter(pipe => pipe.x + pipe.width > removeX);
}

/**
 * Calculate score based on passed pipes
 */
export function calculateScore(pipes) {
  return pipes.filter(pipe => pipe.passed).length;
}

/**
 * A simple easing function for smooth animations
 */
export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Get rotation angle for bird based on velocity
 */
export function getBirdRotation(velocity) {
  const maxRotation = Math.PI / 4; // 45 degrees
  const normVelocity = Math.min(Math.max(velocity / PHYSICS.BIRD_TERMINAL_VELOCITY, -1), 1);
  
  // Map velocity to rotation (-45 to +45 degrees)
  return normVelocity * maxRotation;
}

/**
 * Constrains a value between minimum and maximum
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
} 