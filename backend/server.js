const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3001;

// --- Database Setup ---
// This creates a standard Redis client. It will use the REDIS_URL from your
// environment variables when deployed on Vercel.
const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', err => console.log('Redis Client Error', err));

// Connect to the database as soon as the server starts.
redisClient.connect();

// A Redis Set is used to store the unique UIDs.
const USED_UIDS_KEY = 'used-uids';


// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Route to validate a UID at login.
app.post('/api/login', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required.' });
  }

  try {
    // Check if the UID is a member of our 'used-uids' set in the database.
    const isMember = await redisClient.sIsMember(USED_UIDS_KEY, uid);
    if (isMember) {
      return res.status(409).json({ success: false, message: 'This UID has already been used.' });
    }
    
    return res.status(200).json({ success: true, message: 'UID is valid.' });

  } catch (error) {
    console.error('Redis error during login:', error);
    return res.status(500).json({ success: false, message: 'A database error occurred.' });
  }
});

// Route to record a UID once the test is finished or terminated.
app.post('/api/complete', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required.' });
  }

  try {
    // 'sAdd' adds the UID to the 'used-uids' set. If it's already there, it does nothing.
    await redisClient.sAdd(USED_UIDS_KEY, uid);
    return res.status(200).json({ success: true, message: 'UID has been successfully recorded.' });
  } catch (error) {
    console.error('Redis error during completion:', error);
    return res.status(500).json({ success: false, message: 'A database error occurred.' });
  }
});


// --- Server Start ---
// This is used for local development. Vercel will run this file as a serverless function.
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

