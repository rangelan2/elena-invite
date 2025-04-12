import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

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

    // Retrieve scores from KV store (using lrange to get all elements, then sorting/slicing)
    // KV stores lists, we'll treat it like a sorted set by managing sorting ourselves.
    let scoreStrings = await kv.lrange(SCORES_KEY, 0, -1) || [];
    
    // Parse the score strings into objects
    let parsedScores = scoreStrings.map(s => {
      try {
        return JSON.parse(s);
      } catch (e) {
        console.error("Failed to parse score string in GET:", s, e);
        return null; // Handle potential parsing errors
      }
    }).filter(s => s !== null); // Filter out any nulls from parsing errors

    // Sort by score descending (now using parsed objects)
    parsedScores.sort((a, b) => b.score - a.score);

    // Add Elena's special score (pass parsed objects)
    const scoresWithElena = addElenaScore(parsedScores);

    // Limit the number of scores returned
    const topScores = scoresWithElena.slice(0, limit);

    return NextResponse.json(topScores);

  } catch (error) {
    console.error("Error fetching scores:", error);
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

    // Add the new score to the list in KV (stringify first)
    await kv.lpush(SCORES_KEY, JSON.stringify(newScore));

    // Keep the list trimmed to MAX_SCORES
    // Retrieve all, sort, trim, and overwrite. This is simpler for KV lists.
    let scoreStrings = await kv.lrange(SCORES_KEY, 0, -1);
    let allScores = scoreStrings.map(s => {
      try {
        return JSON.parse(s);
      } catch (e) {
        console.error("Failed to parse score string:", s, e);
        return null; // Handle potential parsing errors
      }
    }).filter(s => s !== null); // Filter out any nulls from parsing errors
    
    allScores.sort((a, b) => b.score - a.score);
    const trimmedScores = allScores.slice(0, MAX_SCORES);

    // To overwrite, we need to delete the key and then push the trimmed scores back.
    // This needs to be atomic if possible, but KV doesn't have direct atomic list replace.
    // We'll use a MULTI/EXEC transaction.
    const multi = kv.multi();
    multi.del(SCORES_KEY);
    if (trimmedScores.length > 0) {
      // lpush pushes items one by one, so push them in reverse order to maintain sort
      for (let i = trimmedScores.length - 1; i >= 0; i--) {
        // Stringify before pushing back
        multi.lpush(SCORES_KEY, JSON.stringify(trimmedScores[i]));
      }
    }
    await multi.exec();

    // Optionally, return the added score or just success status
    return NextResponse.json({ message: 'Score added successfully', scoreId: newScore.id }, { status: 201 });

  } catch (error) {
    console.error("Error adding score:", error);
    // Handle potential rate limits or other KV errors
     if (error.message.includes('RATE_LIMIT')) {
       return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
     }
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 });
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