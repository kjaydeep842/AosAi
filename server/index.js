import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// User Login / Auto-Registration
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUsername = username.trim();
  const existingUser = db.findUser(cleanUsername);
  const now = new Date().toLocaleString();

  if (existingUser) {
    // Verify password
    if (existingUser.password !== password) {
      return res.status(401).json({ error: 'Invalid password for this username' });
    }

    // Success login
    const updated = db.updateLogin(cleanUsername, now);
    return res.json({
      success: true,
      username: updated.username,
      loginCount: updated.loginCount,
      lastLogin: updated.lastLogin
    });
  } else {
    // Auto-create user
    const newUser = db.createUser(cleanUsername, password, now);
    return res.json({
      success: true,
      username: newUser.username,
      loginCount: 1,
      lastLogin: now,
      isNewUser: true
    });
  }
});

// Get all logged-in user statistics
app.get('/api/users', (req, res) => {
  const users = db.getAllUsers();
  res.json(users);
});

// Fetch chat logs for a specific user and agent
app.get('/api/chats/:username/:agentId', (req, res) => {
  const { username, agentId } = req.params;
  const messages = db.getChats(username, agentId);
  // Map fields to match client-side expect fields
  const clientMessages = messages.map(m => ({
    sender: m.sender,
    text: m.text,
    timestamp: m.timestamp,
    monologue: m.monologue
  }));
  res.json(clientMessages);
});

// Save a new chat message
app.post('/api/chats', (req, res) => {
  const { username, agentId, sender, text, timestamp, monologue } = req.body;
  if (!username || !agentId || !sender || !text) {
    return res.status(400).json({ error: 'Missing chat message details' });
  }

  const time = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  db.saveChat(username, agentId, sender, text, time, monologue || null);
  res.json({ success: true });
});

// Fetch sandbox coding prompt history for a user
app.get('/api/sandbox/:username', (req, res) => {
  const { username } = req.params;
  const history = db.getSandboxHistory(username);
  res.json(history);
});

// Save a new coding sandbox prompt entry
app.post('/api/sandbox', (req, res) => {
  const { username, prompt, timestamp } = req.body;
  if (!username || !prompt) {
    return res.status(400).json({ error: 'Missing prompt details' });
  }

  const time = timestamp || new Date().toLocaleString();
  db.saveSandboxPrompt(username, prompt, time);
  res.json({ success: true });
});

// Update user fields
app.post('/api/users/update', (req, res) => {
  const { username, updates } = req.body;
  if (!username || !updates) {
    return res.status(400).json({ error: 'Username and updates object are required' });
  }
  const result = db.updateUser(username, updates);
  if (result) {
    res.json({ success: true, user: result });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Delete user
app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const result = db.deleteUser(username);
  res.json({ success: result });
});

// Pricing endpoints
app.get('/api/pricing', (req, res) => {
  const pricing = db.getPricing();
  res.json(pricing);
});

app.post('/api/pricing', (req, res) => {
  const updated = db.savePricing(req.body);
  res.json({ success: true, pricing: updated });
});

// Models endpoints
app.get('/api/models', (req, res) => {
  const models = db.getModels();
  res.json(models);
});

app.post('/api/models', (req, res) => {
  const updated = db.saveModels(req.body);
  res.json({ success: true, models: updated });
});

app.listen(PORT, () => {
  console.log(`Express JSON Database Server running on port ${PORT}`);
});
