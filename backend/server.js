const express = require('express');
const cors = require('cors');
const { createClient } = require('@vercel/kv');

const app = express();
const PORT = 3001;

// --- Database Setup ---
// This creates a client that will automatically use your Vercel KV credentials
// when deployed.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

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
    const isMember = await kv.sismember(USED_UIDS_KEY, uid);
    if (isMember) {
      return res.status(409).json({ success: false, message: 'This UID has already been used.' });
    }
    
    // If you are using a pre-approved list, you would check against that here first.
    // For now, we just confirm it's not in the used list.
    return res.status(200).json({ success: true, message: 'UID is valid.' });

  } catch (error) {
    console.error('KV Database error during login:', error);
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
    // 'sadd' adds the UID to the 'used-uids' set. If it's already there, it does nothing.
    await kv.sadd(USED_UIDS_KEY, uid);
    return res.status(200).json({ success: true, message: 'UID has been successfully recorded.' });
  } catch (error) {
    console.error('KV Database error during completion:', error);
    return res.status(500).json({ success: false, message: 'A database error occurred.' });
  }
});


// --- Server Start ---
// This is used for local development. Vercel will run this file as a serverless function.
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});