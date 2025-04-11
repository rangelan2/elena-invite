/**
 * ScoreService - A service for managing high scores using localStorage
 * This simulates a "global" leaderboard by adding some device identification
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// IDs of dummy scores that need to be filtered out
const dummyIds = ['dummy1', 'dummy2', 'dummy3', 'dummy4', 'dummy5'];

// Generate a semi-unique device ID to simulate different users
function getDeviceId() {
  if (!isBrowser) return 'server';
  
  // Try to get existing device ID
  let deviceId = localStorage.getItem('flappyDeviceId');
  
  if (!deviceId) {
    // Generate a simple unique ID based on timestamp and random value
    deviceId = `device_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem('flappyDeviceId', deviceId);
  }
  
  return deviceId;
}

// Initialize scores in localStorage if they don't exist yet
function initializeScores() {
  if (!isBrowser) return;
  
  try {
    const existingScores = localStorage.getItem('flappyGlobalScores');
    
    if (!existingScores) {
      // Initialize with an empty array
      localStorage.setItem('flappyGlobalScores', JSON.stringify([]));
    } else {
      // Filter out any dummy scores that might still be in localStorage
      const scores = JSON.parse(existingScores);
      const filteredScores = scores.filter(score => !dummyIds.includes(score.id));
      
      // Save back only real scores
      if (scores.length !== filteredScores.length) {
        localStorage.setItem('flappyGlobalScores', JSON.stringify(filteredScores));
        console.log('Removed pre-populated dummy scores');
      }
    }
  } catch (error) {
    console.error("Error initializing scores:", error);
    // If there's an error, reset scores to empty array
    localStorage.setItem('flappyGlobalScores', JSON.stringify([]));
  }
}

// Call initialization on module load, but only if in browser
if (isBrowser) {
  initializeScores();
}

/**
 * Add a new high score to the leaderboard
 * @param {string} name - Player name
 * @param {number} score - Player score
 * @returns {string} - ID of the new score
 */
export async function addHighScore(name, score) {
  if (!isBrowser) return null;
  
  try {
    // Get existing scores
    const existingScores = JSON.parse(localStorage.getItem('flappyGlobalScores') || '[]');
    
    // Filter out any dummy scores that might still be in localStorage
    const filteredScores = existingScores.filter(score => !dummyIds.includes(score.id));
    
    // Generate a unique ID
    const scoreId = `score_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Add new score with device ID to simulate different users
    const deviceId = getDeviceId();
    const newScore = {
      id: scoreId,
      name: name.trim(),
      score: score,
      timestamp: new Date(),
      deviceId: deviceId
    };
    
    // Add to scores and sort
    filteredScores.push(newScore);
    filteredScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 100 scores to prevent localStorage from getting too full
    const topScores = filteredScores.slice(0, 100);
    
    // Save back to localStorage
    localStorage.setItem('flappyGlobalScores', JSON.stringify(topScores));
    
    return scoreId;
  } catch (error) {
    console.error("Error adding high score:", error);
    return null;
  }
}

/**
 * Get top high scores from the leaderboard
 * @param {number} limitCount - Maximum number of scores to return
 * @returns {Array} - Array of high score objects
 */
export async function getHighScores(limitCount = 10) {
  if (!isBrowser) return [];
  
  try {
    // Get scores from localStorage
    const rawScores = JSON.parse(localStorage.getItem('flappyGlobalScores') || '[]');
    
    // Filter out any dummy scores that might still be in localStorage
    const scores = rawScores.filter(score => !dummyIds.includes(score.id));
    
    // If we needed to filter some out, save the filtered version back
    if (scores.length !== rawScores.length) {
      localStorage.setItem('flappyGlobalScores', JSON.stringify(scores));
    }
    
    // Sort by score in descending order
    scores.sort((a, b) => b.score - a.score);
    
    // Calculate highest score
    const highestScore = scores.length > 0 ? scores[0].score : 0;
    
    // Always add Elena to the top with a score higher than anyone else
    const elenaScore = {
      id: 'elena-top-score',
      name: 'Elena',
      score: highestScore + 1,
      timestamp: new Date(),
      deviceId: 'elena-special-id'
    };
    
    // Add Elena to the top of the scores
    const scoresWithElena = [elenaScore, ...scores];
    
    // Return only the requested number of scores
    return scoresWithElena.slice(0, limitCount);
  } catch (error) {
    console.error("Error getting high scores:", error);
    return [];
  }
}

/**
 * Get personal high scores for the current device
 * @param {number} limitCount - Maximum number of scores to return
 * @returns {Array} - Array of personal high score objects
 */
export async function getPersonalHighScores(limitCount = 5) {
  if (!isBrowser) return [];
  
  try {
    // Get all scores
    const rawScores = JSON.parse(localStorage.getItem('flappyGlobalScores') || '[]');
    
    // Filter out any dummy scores that might still be in localStorage
    const allScores = rawScores.filter(score => !dummyIds.includes(score.id));
    
    // If we needed to filter some out, save the filtered version back
    if (allScores.length !== rawScores.length) {
      localStorage.setItem('flappyGlobalScores', JSON.stringify(allScores));
    }
    
    const deviceId = getDeviceId();
    
    // Filter for scores from this device
    const personalScores = allScores.filter(score => score.deviceId === deviceId);
    
    // Sort by score in descending order
    personalScores.sort((a, b) => b.score - a.score);
    
    // Return only the requested number of scores
    return personalScores.slice(0, limitCount);
  } catch (error) {
    console.error("Error getting personal high scores:", error);
    return [];
  }
}

/**
 * Get the highest personal score
 * @returns {number} - Highest score for the current device
 */
export function getHighestPersonalScore() {
  if (!isBrowser) return 0;
  
  try {
    // Get all scores
    const rawScores = JSON.parse(localStorage.getItem('flappyGlobalScores') || '[]');
    
    // Filter out any dummy scores that might still be in localStorage
    const allScores = rawScores.filter(score => !dummyIds.includes(score.id));
    
    // If we needed to filter some out, save the filtered version back
    if (allScores.length !== rawScores.length) {
      localStorage.setItem('flappyGlobalScores', JSON.stringify(allScores));
    }
    
    const deviceId = getDeviceId();
    
    // Filter for scores from this device
    const personalScores = allScores.filter(score => score.deviceId === deviceId);
    
    // If no personal scores, return 0
    if (personalScores.length === 0) return 0;
    
    // Find the highest score among personal scores
    const highestPersonalScore = Math.max(...personalScores.map(s => s.score));
    
    // No need to return Elena's special score for personal high score
    return highestPersonalScore;
  } catch (error) {
    console.error("Error getting highest personal score:", error);
    return 0;
  }
}

/**
 * Clear all high scores (for testing/debug)
 */
export function clearAllScores() {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem('flappyGlobalScores', JSON.stringify([]));
    console.log('All scores cleared');
  } catch (error) {
    console.error("Error clearing scores:", error);
  }
} 