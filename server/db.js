import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbFilePath = join(__dirname, 'db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(
    dbFilePath,
    JSON.stringify({ users: [], chats: [], sandboxHistory: [] }, null, 2),
    'utf-8'
  );
}

// Thread-safe read/write operations
function readDb() {
  try {
    const content = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read db file:', error);
    return { users: [], chats: [], sandboxHistory: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write db file:', error);
    return false;
  }
}

export const db = {
  // --- USERS ---
  findUser: (username) => {
    const data = readDb();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  createUser: (username, password, lastLogin) => {
    const data = readDb();
    const newUser = {
      username: username.trim(),
      password,
      loginCount: 1,
      lastLogin,
      tier: 'sandbox',
      billingCycle: 'monthly',
      problemsCount: Math.floor(Math.random() * 10) + 1,
      registeredAt: lastLogin
    };
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },

  updateLogin: (username, lastLogin) => {
    const data = readDb();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = lastLogin;
      if (!user.tier) user.tier = 'sandbox';
      if (!user.billingCycle) user.billingCycle = 'monthly';
      if (user.problemsCount === undefined) user.problemsCount = Math.floor(Math.random() * 10) + 1;
      if (!user.registeredAt) user.registeredAt = lastLogin;
      writeDb(data);
      return user;
    }
    return null;
  },

  updateUser: (username, updates) => {
    const data = readDb();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      Object.assign(user, updates);
      writeDb(data);
      return user;
    }
    return null;
  },

  deleteUser: (username) => {
    const data = readDb();
    data.users = data.users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    data.chats = data.chats.filter(c => c.username.toLowerCase() !== username.toLowerCase());
    data.sandboxHistory = data.sandboxHistory.filter(s => s.username.toLowerCase() !== username.toLowerCase());
    writeDb(data);
    return true;
  },

  getAllUsers: () => {
    const data = readDb();
    const now = new Date().toLocaleString();
    return [...data.users]
      .map(u => ({
        username: u.username,
        password: u.password,
        login_count: u.loginCount || 1,
        last_login: u.lastLogin || now,
        tier: u.tier || 'sandbox',
        billingCycle: u.billingCycle || 'monthly',
        problemsCount: u.problemsCount !== undefined ? u.problemsCount : Math.floor(Math.random() * 10) + 1,
        registeredAt: u.registeredAt || u.lastLogin || now
      }))
      .sort((a, b) => new Date(b.last_login) - new Date(a.last_login));
  },

  // --- CHATS ---
  getChats: (username, agentId) => {
    const data = readDb();
    return data.chats.filter(
      c => c.username.toLowerCase() === username.toLowerCase() && c.agentId.toLowerCase() === agentId.toLowerCase()
    );
  },

  saveChat: (username, agentId, sender, text, timestamp, monologue) => {
    const data = readDb();
    const newChat = {
      username,
      agentId,
      sender,
      text,
      timestamp,
      monologue
    };
    data.chats.push(newChat);
    writeDb(data);
    return newChat;
  },

  // --- SANDBOX HISTORY ---
  getSandboxHistory: (username) => {
    const data = readDb();
    return data.sandboxHistory
      .filter(s => s.username.toLowerCase() === username.toLowerCase())
      .reverse(); // Newest first
  },

  saveSandboxPrompt: (username, prompt, timestamp) => {
    const data = readDb();
    const newEntry = {
      username,
      prompt,
      timestamp
    };
    data.sandboxHistory.push(newEntry);
    writeDb(data);
    return newEntry;
  },

  // --- PRICING ---
  getPricing: () => {
    const data = readDb();
    return data.pricing || null;
  },

  savePricing: (pricing) => {
    const data = readDb();
    data.pricing = pricing;
    writeDb(data);
    return pricing;
  },

  // --- MODELS ---
  getModels: () => {
    const data = readDb();
    return data.models || null;
  },

  saveModels: (models) => {
    const data = readDb();
    data.models = models;
    writeDb(data);
    return models;
  }
};
