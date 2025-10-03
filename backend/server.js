const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE_PATH = path.join(DATA_DIR, 'users.json');

// --- INITIAL SERVER SETUP ---
// Ensures the data directory and a default users.json file exist on startup.
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(USERS_FILE_PATH)) {
    // If no users file exists, create one with a default structure.
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([{ "uid": "TEST-UID", "used": false }]));
    console.log("Created 'users.json' with a default entry.");
  }
} catch (error) {
  console.error("FATAL: Could not initialize data directory or file.", error);
  process.exit(1); // Exit if storage can't be set up.
}

// --- MIDDLEWARE ---
app.use(cors()); // Allows requests from the frontend.
app.use(express.json()); // Parses incoming JSON bodies.

// --- UTILITY FUNCTIONS ---
// Reads the user data from the JSON file.
const readUsers = () => {
  try {
    const fileData = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Could not read users file. Returning empty array as a fallback.", error);
    return [];
  }
};

// Writes the user data back to the JSON file.
const writeUsers = (users) => {
  try {
    // The 'null, 2' argument formats the JSON file to be human-readable.
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
    console.log(`SUCCESS: Wrote ${users.length} user objects to users.json.`);
  } catch (error)
  {
    console.error("FATAL: Could not write to users file:", error);
  }
};

// --- API ROUTES ---

// Endpoint to validate a UID at login.
app.post('/api/login', (req, res) => {
  const { uid } = req.body;
  console.log(`[LOGIN ATTEMPT] Received UID: "${uid}"`);

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required.' });
  }

  const users = readUsers();
  const user = users.find(u => u.uid === uid);

  // 1. Check if the UID is valid (exists in the file)
  if (!user) {
    console.log(`[LOGIN REJECTED] UID "${uid}" is not a valid participant.`);
    return res.status(404).json({ success: false, message: 'Invalid UID. Please check your credentials and try again.' });
  }

  // 2. Check if the UID has already been used
  if (user.used) {
    console.log(`[LOGIN REJECTED] UID "${uid}" has already been used.`);
    return res.status(409).json({ success: false, message: 'This UID has already been used. Each UID can access the test only once.' });
  }

  // 3. If valid and not used, allow login
  console.log(`[LOGIN SUCCESS] UID "${uid}" is valid and has not been used.`);
  return res.status(200).json({ success: true, message: 'UID is valid.' });
});

// Endpoint to mark a UID as 'used' once the test is finished or terminated.
app.post('/api/complete', (req, res) => {
  const { uid } = req.body;
  console.log(`[COMPLETE REQUEST] Received UID: "${uid}"`);

  if (!uid) {
    console.error('[COMPLETE FAILED] Request body did not contain a UID.');
    return res.status(400).json({ success: false, message: 'UID is required.' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.uid === uid);

  if (userIndex !== -1) {
    if (!users[userIndex].used) {
        users[userIndex].used = true;
        console.log(`[COMPLETE REQUEST] Marking UID "${uid}" as used.`);
        writeUsers(users); // Save the updated user list to the file.
        return res.status(200).json({ success: true, message: 'UID has been successfully recorded.' });
    } else {
        console.log(`[COMPLETE IGNORED] UID "${uid}" was already marked as used.`);
        return res.status(200).json({ success: true, message: 'UID was already recorded.' });
    }
  } else {
    // This case should ideally not be reached if the login system is working.
    console.error(`[COMPLETE FAILED] UID "${uid}" not found in the user list.`);
    return res.status(404).json({ success: false, message: 'UID not found.' });
  }
});

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

