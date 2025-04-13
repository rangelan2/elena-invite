/**
 * ScoreService - A service for managing high scores using a backend API
 */

// No longer using localStorage directly for global scores
// const isBrowser = typeof window !== 'undefined';

// Removed functions related to localStorage management and deviceId:
// getDeviceId, initializeScores, clearAllScores

// Keep dummyIds if they are still relevant for filtering specific old/test entries, 
// otherwise, they can be removed.
// const dummyIds = ['dummy1', 'dummy2', 'dummy3', 'dummy4', 'dummy5']; 

// --- API Interaction Functions ---

const API_BASE_URL = '/api/scores'; // Use relative path for API routes

/**
 * Add a new high score via the API (Internal function)
 * @param {string} name - Player name
 * @param {number} score - Player score
 * @returns {Promise<string|null>} - ID of the new score or null on failure
 */
async function _addHighScoreToApi(name, score) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error adding high score:", response.status, errorData);
      throw new Error(errorData.error || 'Failed to add high score');
    }

    const result = await response.json();
    return result.scoreId; // Return the ID from the API response
  
  } catch (error) {
    console.error("Error adding high score:", error);
    // Optionally re-throw or handle specific errors (e.g., rate limit)
    if (error.message.includes('Rate limit')) {
      // Handle rate limit feedback to the user if needed
    }
    return null;
  }
}

/**
 * Get top high scores from the API (Global Leaderboard)
 * @param {number} limitCount - Maximum number of scores to return
 * @returns {Promise<Array>} - Array of high score objects
 */
export async function getHighScores(limitCount = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}?limit=${limitCount}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error getting high scores:", response.status, errorData);
      throw new Error(errorData.error || 'Failed to get high scores');
    }

    const scores = await response.json();
    
    // Ensure timestamp is a Date object if needed by the frontend component
    // The API returns ISO strings, which might be sufficient
    return scores.map(score => ({
      ...score,
      // Keep timestamp as string or convert if necessary:
      // timestamp: new Date(score.timestamp) 
    }));

  } catch (error) {
    console.error("Error getting high scores:", error);
    return []; // Return empty array on error
  }
}

// --- Personal Score Management (Still using localStorage) ---
// If you want personal scores also stored server-side, these need changes too.
// For now, we keep them local.

const isBrowser = typeof window !== 'undefined'; // Needed for personal scores
const PERSONAL_SCORES_KEY = 'flappyPersonalScores';

// Initialize personal scores in localStorage
function initializePersonalScores() {
  if (!isBrowser) return;
  try {
    if (!localStorage.getItem(PERSONAL_SCORES_KEY)) {
      localStorage.setItem(PERSONAL_SCORES_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error initializing personal scores:", error);
  }
}

if (isBrowser) {
  initializePersonalScores();
}

/**
 * Add a personal score (only stores locally)
 * @param {number} score - The score achieved
 */
function addPersonalScore(score) {
  if (!isBrowser) return;
  try {
    const personalScores = JSON.parse(localStorage.getItem(PERSONAL_SCORES_KEY) || '[]');
    const newScoreEntry = {
      id: `personal_${Date.now()}`,
      score: score,
      timestamp: new Date().toISOString()
    };
    personalScores.push(newScoreEntry);
    personalScores.sort((a, b) => b.score - a.score);
    const topPersonal = personalScores.slice(0, 50); // Keep top 50 personal
    localStorage.setItem(PERSONAL_SCORES_KEY, JSON.stringify(topPersonal));
  } catch (error) {
    console.error("Error adding personal score:", error);
  }
}

// We need to redefine addHighScore slightly to incorporate this.

// Store the original API function
// Create the new wrapper function - this is the one we export
export async function addHighScore(name, score) {
  // First, add to the global leaderboard via API
  const scoreId = await _addHighScoreToApi(name, score); // Updated call here
  
  // If successful, also add the score to the local personal list
  if (scoreId && isBrowser) {
    addPersonalScore(score);
  }
  
  return scoreId;
}


/**
 * Get personal high scores (from localStorage)
 * @param {number} limitCount - Maximum number of scores to return
 * @returns {Array} - Array of personal high score objects
 */
export async function getPersonalHighScores(limitCount = 10) { // Make async for consistency if needed, though localStorage is sync
  if (!isBrowser) return [];
  try {
    const personalScores = JSON.parse(localStorage.getItem(PERSONAL_SCORES_KEY) || '[]');
    // Ensure they are sorted
    personalScores.sort((a, b) => b.score - a.score);
     // Add name and format similarly to global scores if needed by the list component
     // For now, they only have id, score, timestamp.
    return personalScores.slice(0, limitCount).map(score => ({ ...score, name: 'You' })); // Add 'You' as name
  } catch (error) {
    console.error("Error getting personal high scores:", error);
    return [];
  }
}

/**
 * Get the highest personal score (from localStorage)
 * @returns {number} - Highest score for the current device
 */
export function getHighestPersonalScore() { // Stays sync as it doesn't call API
  if (!isBrowser) return 0;
  try {
    const personalScores = JSON.parse(localStorage.getItem(PERSONAL_SCORES_KEY) || '[]');
    if (personalScores.length === 0) return 0;
    // Find the highest score
    return Math.max(...personalScores.map(s => s.score));
  } catch (error) {
    console.error("Error getting highest personal score:", error);
    return 0;
  }
}

// Clear All Scores - Now needs to decide if it clears API or just personal
// For now, let's make it only clear local personal scores.
export function clearPersonalScores() {
  if (!isBrowser) return;
  try {
    localStorage.setItem(PERSONAL_SCORES_KEY, JSON.stringify([]));
    console.log('Personal scores cleared');
  } catch (error) {
    console.error("Error clearing personal scores:", error);
  }
}

// If you need a function to clear the *global* leaderboard (use with caution!):
// export async function clearGlobalScores() {
//   try {
//     const response = await fetch(API_BASE_URL, { method: 'DELETE' }); // Need to implement DELETE in API route
//     if (!response.ok) throw new Error('Failed to clear global scores');
//     console.log('Global scores cleared via API');
//   } catch (error) {
//     console.error("Error clearing global scores:", error);
//   }
// } 