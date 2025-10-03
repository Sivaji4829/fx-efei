const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = 3001;

// --- Database Setup (Updated with Modern Options) ---
// This will use the MONGODB_URI from your Vercel environment variables.
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable. Please set it in your Vercel project settings.');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let usedUidsCollection;

// This function connects to the database and sets up the collections.
async function connectToDb() {
  try {
    // Only connect if we haven't already established a connection.
    if (!db) {
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      
      db = client.db("escapeIsland"); // The database name
      usedUidsCollection = db.collection("used_uids"); // The collection name
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    // Re-throw the error so the API routes can handle it gracefully.
    throw error;
  }
}

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Route to validate a UID at login.
app.post('/api/login', async (req, res) => {
  try {
    await connectToDb(); // Ensure DB is connected
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required.' });
    }

    const existingUid = await usedUidsCollection.findOne({ uid: uid });
    if (existingUid) {
      return res.status(409).json({ success: false, message: 'This UID has already been used.' });
    }
    
    return res.status(200).json({ success: true, message: 'UID is valid.' });

  } catch (error) {
    console.error('MongoDB error during login:', error);
    return res.status(500).json({ success: false, message: 'A database server error occurred during login.' });
  }
});

// Route to record a UID once the test is finished or terminated.
app.post('/api/complete', async (req, res) => {
  try {
    await connectToDb(); // Ensure DB is connected
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required.' });
    }

    await usedUidsCollection.updateOne(
      { uid: uid },
      { $setOnInsert: { uid: uid, timestamp: new Date() } },
      { upsert: true }
    );
    
    return res.status(200).json({ success: true, message: 'UID has been successfully recorded.' });

  } catch (error) {
    console.error('MongoDB error during completion:', error);
    return res.status(500).json({ success: false, message: 'A database server error occurred during completion.' });
  }
});


// --- Server Start (for local development) ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server is running for local development on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel's serverless environment
module.exports = app;