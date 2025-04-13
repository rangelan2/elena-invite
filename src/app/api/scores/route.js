import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis Client from environment variables
// (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = Redis.fromEnv();

const SCORES_KEY = 'flappyScores';
const MAX_SCORES = 100; // Keep top 100 scores

// Function to add Elena's score
const addElenaScore = (scores) => {
  const highestScore = scores.length > 0 ? scores[0].score : 0;
  return [
    {
      id: 'elena-top-score',
      name: 'Elena',
      score: highestScore + 1, // Always slightly higher
      timestamp: new Date().toISOString(), // Ensure ISO string format for consistency
      isElena: true // Add a flag to identify Elena's score
    },
    ...scores
  ];
};

// GET handler to retrieve top scores
export async function GET(request) {
  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }

    // Retrieve scores from Redis store
    let items = await redis.lrange(SCORES_KEY, 0, -1) || [];

    // Parse the score strings into objects
    let parsedScores = items.map(s => {
      try {
        // Check if s is a string before parsing
        if (typeof s === 'string') {
          return JSON.parse(s);
        } else if (typeof s === 'object' && s !== null) {
          // If it's already an object, return it directly
          return s;
        }
        // If it's neither string nor object, treat as invalid
        console.warn("Unexpected item type in Redis list during GET:", typeof s, s);
        return null;
      } catch (e) {
        console.error("Failed to parse score string in GET:", s, e);
        return null; // Handle potential parsing errors on strings
      }
    }).filter(s => s !== null && typeof s.score === 'number'); // Ensure valid score objects

    // Sort by score descending (now using parsed objects)
    parsedScores.sort((a, b) => b.score - a.score);

    // Add Elena's special score (pass parsed objects)
    const scoresWithElena = addElenaScore(parsedScores);

    // Limit the number of scores returned
    const topScores = scoresWithElena.slice(0, limit);

    return NextResponse.json(topScores);

  } catch (error) {
    console.error("Detailed error fetching scores:", error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

// POST handler to add a new score
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, score } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ error: 'Invalid name or score' }, { status: 400 });
    }

    const newScore = {
      id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      score: Math.floor(score), // Ensure score is an integer
      timestamp: new Date().toISOString(), // Use ISO string format
    };

    // Add the new score to the list in Redis (stringify first)
    await redis.lpush(SCORES_KEY, JSON.stringify(newScore));

    // Keep the list trimmed to MAX_SCORES
    // Retrieve all, sort, trim, and overwrite.
    let items = await redis.lrange(SCORES_KEY, 0, -1);
    let allScores = items.map(s => {
      try {
        // Check if s is a string before parsing
        if (typeof s === 'string') {
          return JSON.parse(s);
        } else if (typeof s === 'object' && s !== null) {
          // If it's already an object, return it directly
          return s;
        }
        // If it's neither string nor object, treat as invalid
        console.warn("Unexpected item type in Redis list:", typeof s, s);
        return null;
      } catch (e) {
        console.error("Failed to process score item:", s, e);
        return null; // Handle potential parsing errors on strings
      }
    }).filter(s => s !== null && typeof s.score === 'number'); // Ensure valid score objects

    allScores.sort((a, b) => b.score - a.score);
    const trimmedScores = allScores.slice(0, MAX_SCORES);

    // Use a pipeline to atomically delete and repopulate the list
    const pipe = redis.pipeline();
    pipe.del(SCORES_KEY);
    if (trimmedScores.length > 0) {
      // Ensure scores are stringified before pushing back
      const stringifiedScores = trimmedScores.map(score => JSON.stringify(score));
      // lpush pushes items one by one to the head, so push them in reverse order
      // of the sorted list to maintain the desired order in Redis.
      for (let i = stringifiedScores.length - 1; i >= 0; i--) {
        pipe.lpush(SCORES_KEY, stringifiedScores[i]);
      }
    }
    await pipe.exec();

    // Optionally, return the added score or just success status
    return NextResponse.json({ message: 'Score added successfully', scoreId: newScore.id }, { status: 201 });

  } catch (error) {
    console.error("Detailed error adding score:", error);
    // Handle potential rate limits or other Redis errors
     if (error.message.includes('RATE_LIMIT')) {
       return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
     }
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 });
  }
}

// DELETE handler to clear all scores (Use with caution!)
export async function DELETE(request) {
  try {
    await redis.del(SCORES_KEY);
    console.log(`KV list '${SCORES_KEY}' deleted.`);
    return NextResponse.json({ message: 'All scores cleared successfully' }, { status: 200 });
  } catch (error) {
    console.error("Detailed error clearing scores:", error);
    return NextResponse.json({ error: 'Failed to clear scores' }, { status: 500 });
  }
}

// Add OPTIONS handler for CORS preflight requests if needed (e.g., if client is on a different domain)
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust as needed for security
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 