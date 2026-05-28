import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  Bot, Code, Terminal, LineChart, Play, RefreshCw, Settings, 
  Database, Sparkles, Cpu, Layers, Send, Plus, Trash, Eye, 
  Check, AlertCircle, Folder, FileCode, Settings2, Share2, 
  FileText, ChevronRight, Download, User, ListTodo, HelpCircle, 
  Activity, Compass, Shield, Zap, Search, AlertTriangle, 
  BookOpen, Code2, Globe, MessageSquare, Maximize2, Minimize2, Key, TerminalSquare, X, Menu, ExternalLink, ChevronDown, LogOut
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// MOCK DATA: Initial Default Agents
// ==========================================
const DEFAULT_AGENTS = [
  {
    id: 'devon-x',
    name: 'Devon-X Coding Agent',
    role: 'Autonomous Software Engineer',
    avatar: '💻',
    description: 'Specializes in full-stack architecture, writing clean JavaScript/HTML/CSS, debugging runtime errors, and optimizing code structures.',
    model: 'Gemini 2.5 Flash',
    temperature: 0.2,
    maxTokens: 4096,
    tools: { search: true, terminal: true, sandbox: true, imageGen: false },
    systemPrompt: `You are Devon-X, an elite autonomous software engineer agent. You analyze requirements, plan file structures, write modular clean code, and debug outputs using your coding sandbox. You always explain your technical design decisions before coding.`
  },
  {
    id: 'alphacap',
    name: 'AlphaCap Market Analyst',
    role: 'Quantitative Financial & Trend Expert',
    avatar: '📊',
    description: 'Scrapes financial databases, processes market trends, builds custom metrics, and renders detailed graphical reports on modern tech growth.',
    model: 'Gemini 2.5 Flash',
    temperature: 0.4,
    maxTokens: 3000,
    tools: { search: true, terminal: false, sandbox: false, imageGen: true },
    systemPrompt: `You are AlphaCap Analyst, an expert on technical market intelligence. You parse datasets, extract statistical patterns, and explain key performance indicators. You output your data in structured markdown lists and CSV/JSON fragments suitable for visual plotting.`
  },
  {
    id: 'swarm-mgr',
    name: 'SwarmCore Swarm Manager',
    role: 'Multi-Agent Delegation Coordinator',
    avatar: '🔄',
    description: 'Orchestrates complex workflows by partitioning tasks and routing them across specialist sub-agents (Architect, Coder, QA, and DevOps).',
    model: 'Gemini 2.5 Flash',
    temperature: 0.5,
    maxTokens: 4096,
    tools: { search: true, terminal: true, sandbox: true, imageGen: true },
    systemPrompt: `You are SwarmCore Manager, an executive orchestrator that breaks down ambitious software objectives into step-by-step sequences executed by your collaborative agent network.`
  }
];

// Fallback interactive app templates for code generation without API keys
const FALLBACK_TEMPLATES = {
  todo: [
    {
      name: 'index.html',
      language: 'html',
      content: `<div class="todo-app">
  <header>
    <h1>📋 TaskFlow Manager</h1>
    <p>Client-Side Storage • Priority Sorting</p>
  </header>
  
  <div class="input-section">
    <input type="text" id="task-input" placeholder="What needs to be done?">
    <select id="task-priority">
      <option value="low">Low</option>
      <option value="medium" selected>Medium</option>
      <option value="high">High</option>
    </select>
    <button id="add-btn">Add Task</button>
  </div>

  <div class="filter-controls">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="active">Active</button>
    <button class="filter-btn" data-filter="completed">Completed</button>
  </div>

  <ul id="task-list" class="task-list"></ul>

  <div class="footer-stats">
    <span id="items-left">0 tasks remaining</span>
    <button id="clear-completed" class="clear-btn">Clear Completed</button>
  </div>
</div>`
    },
    {
      name: 'styles.css',
      language: 'css',
      content: `body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.todo-app {
  width: 95%;
  max-width: 480px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
header h1 {
  margin: 0 0 6px;
  font-size: 24px;
  color: #a78bfa;
}
header p {
  margin: 0 0 20px;
  font-size: 13px;
  color: #64748b;
}
.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
#task-input {
  flex-grow: 1;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: white;
}
#task-priority {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  padding: 0 10px;
}
button {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #8b5cf6; }
.filter-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 12px;
}
.filter-btn {
  background: transparent;
  color: #94a3b8;
  padding: 6px 12px;
  font-size: 13px;
}
.filter-btn.active {
  background: rgba(139, 92, 246, 0.15);
  color: #c084fc;
}
.task-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  max-height: 240px;
  overflow-y: auto;
}
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255,255,255,0.03);
  border-radius: 8px;
  margin-bottom: 8px;
}
.task-item.completed {
  opacity: 0.5;
  text-decoration: line-through;
}
.task-title {
  font-size: 14px;
  margin-left: 8px;
}
.priority-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.priority-high { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.priority-medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.priority-low { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.footer-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
}
.clear-btn {
  background: transparent;
  color: #ef4444;
  font-size: 12px;
  padding: 4px 8px;
}`
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: `const input = document.getElementById('task-input');
const priority = document.getElementById('task-priority');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('task-list');
const itemsLeft = document.getElementById('items-left');
const clearCompleted = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('aos_tasks')) || [
  { id: 1, text: 'Deploy telemetry microservice swarm', priority: 'high', completed: false },
  { id: 2, text: 'Refactor chart canvas SVG grids', priority: 'medium', completed: true },
  { id: 3, text: 'Enable local storage caching', priority: 'low', completed: false }
];
let currentFilter = 'all';

function save() {
  localStorage.setItem('aos_tasks', JSON.stringify(tasks));
  render();
}

function render() {
  list.innerHTML = '';
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = \`task-item \${task.completed ? 'completed' : ''}\`;
    li.innerHTML = \`
      <div style="display:flex; align-items:center;">
        <input type="checkbox" \${task.completed ? 'checked' : ''} data-id="\${task.id}">
        <span class="task-title">\${task.text}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="priority-tag priority-\${task.priority}">\${task.priority}</span>
        <button class="delete-btn" data-id="\${task.id}" style="background:none; color:#ef4444; border:none; cursor:pointer; font-size:14px;">&times;</button>
      </div>
    \`;
    list.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = \`\${remaining} task\${remaining === 1 ? '' : 's'} remaining\`;
}

addBtn.addEventListener('click', () => {
  if (!input.value.trim()) return;
  tasks.push({
    id: Date.now(),
    text: input.value.trim(),
    priority: priority.value,
    completed: false
  });
  input.value = '';
  save();
});

list.addEventListener('click', (e) => {
  const id = parseInt(e.target.dataset.id);
  if (!id) return;
  
  if (e.target.type === 'checkbox') {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: e.target.checked } : t);
  } else if (e.target.classList.contains('delete-btn')) {
    tasks = tasks.filter(t => t.id !== id);
  }
  save();
});

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  save();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();`
    }
  ],
  calculator: [
    {
      name: 'index.html',
      language: 'html',
      content: `<div class="calc-app">
  <header>
    <h1>🧮 Sci-Calc Pro</h1>
    <p>Inline Computation Engine</p>
  </header>
  <div class="display">
    <div id="equation" class="equation"></div>
    <div id="screen" class="screen">0</div>
  </div>
  <div class="grid">
    <button class="key op" data-val="clear">C</button>
    <button class="key op" data-val="backspace">DEL</button>
    <button class="key op" data-val="percentage">%</button>
    <button class="key op" data-val="/">/</button>
    
    <button class="key" data-val="7">7</button>
    <button class="key" data-val="8">8</button>
    <button class="key" data-val="9">9</button>
    <button class="key op" data-val="*">*</button>
    
    <button class="key" data-val="4">4</button>
    <button class="key" data-val="5">5</button>
    <button class="key" data-val="6">6</button>
    <button class="key op" data-val="-">-</button>
    
    <button class="key" data-val="1">1</button>
    <button class="key" data-val="2">2</button>
    <button class="key" data-val="3">3</button>
    <button class="key op" data-val="+">+</button>
    
    <button class="key op" data-val="sqrt">√</button>
    <button class="key" data-val="0">0</button>
    <button class="key" data-val=".">.</button>
    <button class="key op eql" data-val="=">=</button>
  </div>
</div>`
    },
    {
      name: 'styles.css',
      language: 'css',
      content: `body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: radial-gradient(circle at center, #090d16 0%, #010204 100%);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.calc-app {
  width: 90%;
  max-width: 340px;
  background: #111827;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.6);
}
header h1 { font-size: 18px; margin: 0; color: #38bdf8; }
header p { font-size: 11px; margin: 4px 0 16px; color: #4b5563; }
.display {
  background: #030712;
  border-radius: 12px;
  padding: 16px;
  text-align: right;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.02);
}
.equation { font-size: 13px; color: #4b5563; min-height: 18px; font-family: monospace; }
.screen { font-size: 32px; font-weight: bold; overflow-x: auto; font-family: monospace; }
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
button {
  height: 56px;
  border-radius: 12px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  background: #1f2937;
  color: white;
  transition: all 0.1s ease;
}
button:hover { background: #374151; }
button.op { background: #1e1b4b; color: #818cf8; }
button.op:hover { background: #312e81; }
button.eql { background: #0284c7; color: white; }
button.eql:hover { background: #0ea5e9; }`
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: `const screen = document.getElementById('screen');
const eq = document.getElementById('equation');
const keys = document.querySelector('.grid');

let currentVal = '0';
let equationVal = '';

keys.addEventListener('click', (e) => {
  if (!e.target.matches('button')) return;
  const val = e.target.dataset.val;

  if (val === 'clear') {
    currentVal = '0';
    equationVal = '';
  } else if (val === 'backspace') {
    currentVal = currentVal.slice(0, -1) || '0';
  } else if (val === '=') {
    try {
      const result = new Function('return ' + currentVal)();
      eq.textContent = currentVal + ' =';
      currentVal = String(result);
    } catch(err) {
      currentVal = 'Error';
    }
  } else if (val === 'sqrt') {
    currentVal = String(Math.sqrt(parseFloat(currentVal)));
  } else {
    if (currentVal === '0' && val !== '.') {
      currentVal = val;
    } else {
      currentVal += val;
    }
  }
  screen.textContent = currentVal;
});`
    }
  ],
  weather: [
    {
      name: 'index.html',
      language: 'html',
      content: `<div class="weather-app">
  <header>
    <h1>🌤️ SkyCast Live</h1>
    <p>Dynamic Weather Monitoring Station</p>
  </header>
  <div class="search-box">
    <input type="text" id="city-input" value="San Francisco" placeholder="Enter target city...">
    <button id="search-btn">Search</button>
  </div>
  <div class="weather-display">
    <h2 id="city-name">San Francisco</h2>
    <div id="weather-icon" class="icon">☁️</div>
    <div id="temp" class="temp">64°F</div>
    <div id="desc" class="desc">Scattered Clouds</div>
  </div>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="title">Humidity</div>
      <div id="humid" class="val">54%</div>
    </div>
    <div class="metric-card">
      <div class="title">Wind Speed</div>
      <div id="wind" class="val">12 mph</div>
    </div>
    <div class="metric-card">
      <div class="title">Barometer</div>
      <div id="baro" class="val">1013 hPa</div>
    </div>
  </div>
</div>`
    },
    {
      name: 'styles.css',
      language: 'css',
      content: `body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: radial-gradient(circle at center, #022c22 0%, #020617 100%);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.weather-app {
  width: 95%;
  max-width: 400px;
  background: rgba(6, 78, 59, 0.4);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  text-align: center;
}
header h1 { font-size: 20px; margin: 0; color: #34d399; }
header p { font-size: 11px; margin: 4px 0 20px; color: #64748b; }
.search-box { display: flex; gap: 8px; margin-bottom: 20px; }
input {
  flex-grow: 1;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
}
button {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
.weather-display { margin-bottom: 24px; }
.icon { font-size: 64px; margin: 12px 0; }
.temp { font-size: 48px; font-weight: 800; font-family: monospace; }
.desc { font-size: 14px; color: #a7f3d0; margin-top: 4px; }
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.metric-card {
  background: rgba(0,0,0,0.2);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.03);
}
.metric-card .title { font-size: 10px; color: #64748b; margin-bottom: 4px; }
.metric-card .val { font-size: 13px; font-weight: bold; font-family: monospace; }`
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: `const input = document.getElementById('city-input');
const btn = document.getElementById('search-btn');
const cName = document.getElementById('city-name');
const icon = document.getElementById('weather-icon');
const temp = document.getElementById('temp');
const desc = document.getElementById('desc');
const humid = document.getElementById('humid');
const wind = document.getElementById('wind');
const baro = document.getElementById('baro');

const weatherData = {
  "san francisco": { temp: '64°F', desc: 'Overcast scattered fog', icon: '☁️', humid: '54%', wind: '14 mph', baro: '1013 hPa' },
  "new york": { temp: '72°F', desc: 'Sunny and clear', icon: '☀️', humid: '45%', wind: '8 mph', baro: '1016 hPa' },
  "tokyo": { temp: '68°F', desc: 'Rain showers', icon: '🌧️', humid: '80%', wind: '16 mph', baro: '1008 hPa' },
  "london": { temp: '55°F', desc: 'Light drizzle mist', icon: '🌫️', humid: '90%', wind: '10 mph', baro: '1011 hPa' }
};

function search() {
  const city = input.value.trim().toLowerCase();
  const data = weatherData[city] || {
    temp: Math.floor(Math.random() * 30 + 50) + '°F',
    desc: 'Mild conditions',
    icon: Math.random() > 0.5 ? '🌤️' : '☁️',
    humid: Math.floor(Math.random() * 40 + 40) + '%',
    wind: Math.floor(Math.random() * 15 + 5) + ' mph',
    baro: '1012 hPa'
  };

  cName.textContent = input.value;
  temp.textContent = data.temp;
  desc.textContent = data.desc;
  icon.textContent = data.icon;
  humid.textContent = data.humid;
  wind.textContent = data.wind;
  baro.textContent = data.baro;
}

btn.addEventListener('click', search);`
    }
  ],
  game: [
    {
      name: 'index.html',
      language: 'html',
      content: `<div class="game-app">
  <header>
    <h1>❌ Tic-Tac-Toe AI ⭕</h1>
    <p>Heuristic Board opponent</p>
  </header>
  <div id="turn-indicator" class="status-turn">Your Turn (X)</div>
  <div class="board">
    <div class="cell" data-idx="0"></div>
    <div class="cell" data-idx="1"></div>
    <div class="cell" data-idx="2"></div>
    <div class="cell" data-idx="3"></div>
    <div class="cell" data-idx="4"></div>
    <div class="cell" data-idx="5"></div>
    <div class="cell" data-idx="6"></div>
    <div class="cell" data-idx="7"></div>
    <div class="cell" data-idx="8"></div>
  </div>
  <div class="score">
    <span>Player: <strong id="player-score">0</strong></span>
    <span>AI: <strong id="ai-score">0</strong></span>
  </div>
  <button id="reset-board">Reset Grid</button>
</div>`
    },
    {
      name: 'styles.css',
      language: 'css',
      content: `body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.game-app {
  width: 90%;
  max-width: 320px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
header h1 { font-size: 20px; margin: 0; color: #a78bfa; }
header p { font-size: 11px; margin: 4px 0 16px; color: #64748b; }
.status-turn { font-size: 14px; margin-bottom: 16px; font-weight: bold; color: #818cf8; }
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.cell {
  height: 80px;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.1s;
}
.cell:hover { background: #1e293b; }
.cell.x { color: #ec4899; }
.cell.o { color: #38bdf8; }
.score { display: flex; justify-content: space-around; font-size: 12px; margin-bottom: 16px; color: #94a3b8; }
button {
  background: #6d28d9;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}`
    },
    {
      name: 'script.js',
      language: 'javascript',
      content: `const cells = document.querySelectorAll('.cell');
const status = document.getElementById('turn-indicator');
const resetBtn = document.getElementById('reset-board');
const pScore = document.getElementById('player-score');
const aScore = document.getElementById('ai-score');

let board = ['', '', '', '', '', '', '', '', ''];
let active = true;
let scores = { player: 0, ai: 0 };

const wins = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function checkWin(player) {
  return wins.some(comb => comb.every(idx => board[idx] === player));
}

function checkDraw() {
  return board.every(cell => cell !== '');
}

function aiMove() {
  if (!active) return;
  const emptyIdxs = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);
  if (emptyIdxs.length === 0) return;
  
  const pick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
  board[pick] = 'O';
  cells[pick].textContent = 'O';
  cells[pick].classList.add('o');
  
  if (checkWin('O')) {
    status.textContent = 'AI wins!';
    status.style.color = '#38bdf8';
    scores.ai++;
    aScore.textContent = scores.ai;
    active = false;
  } else if (checkDraw()) {
    status.textContent = 'Game is Draw';
    active = false;
  } else {
    status.textContent = 'Your Turn (X)';
    active = true;
  }
}

cells.forEach(cell => {
  cell.addEventListener('click', (e) => {
    const idx = parseInt(e.target.dataset.idx);
    if (board[idx] !== '' || !active) return;
    
    board[idx] = 'X';
    e.target.textContent = 'X';
    e.target.classList.add('x');
    
    if (checkWin('X')) {
      status.textContent = 'You win!';
      status.style.color = '#ec4899';
      scores.player++;
      pScore.textContent = scores.player;
      active = false;
    } else if (checkDraw()) {
      status.textContent = 'Game is Draw';
      active = false;
    } else {
      active = false;
      status.textContent = 'AI thinking...';
      setTimeout(aiMove, 600);
    }
  });
});

resetBtn.addEventListener('click', () => {
  board = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(c => {
    c.textContent = '';
    c.className = 'cell';
  });
  status.textContent = 'Your Turn (X)';
  status.style.color = '#818cf8';
  active = true;
});`
    }
  ]
};

// --- Client-side Database Emulation for Vercel / Static deployments ---
const getLocalDb = () => {
  const defaultData = {
    users: [
      { username: 'jaydeep', password: 'password123', loginCount: 2, lastLogin: '25/5/2026, 4:24:09 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '25/5/2026, 4:24:09 pm' },
      { username: 'shreyash', password: 'password123', loginCount: 1, lastLogin: '25/5/2026, 4:17:46 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '25/5/2026, 4:17:46 pm' },
      { username: 'admin', password: 'admin123', loginCount: 3, lastLogin: '27/5/2026, 5:41:48 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '27/5/2026, 5:41:48 pm' },
      { username: 'vivek', password: 'password123', loginCount: 1, lastLogin: new Date().toLocaleString(), tier: 'sandbox', billingCycle: 'monthly', problemsCount: 7, registeredAt: new Date().toLocaleString() }
    ],
    chats: [],
    sandboxHistory: []
  };
  try {
    const raw = localStorage.getItem('aos_local_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem('aos_local_db', JSON.stringify(defaultData));
    return defaultData;
  } catch (e) {
    return defaultData;
  }
};

const saveLocalDb = (data) => {
  try {
    localStorage.setItem('aos_local_db', JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

const localDbAPI = {
  login: async (username, password) => {
    const cleanUsername = username.trim();
    const now = new Date().toLocaleString();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.password !== password) {
            return { success: false, error: 'Invalid password for this username' };
          }
          const updatedLoginCount = (data.loginCount || data.login_count || 0) + 1;
          const { error: updateErr } = await supabase
            .from('users')
            .update({ loginCount: updatedLoginCount, lastLogin: now, last_login: now })
            .eq('username', cleanUsername);

          if (updateErr) throw updateErr;

          return { success: true, username: cleanUsername, loginCount: updatedLoginCount, lastLogin: now };
        } else {
          const { error: insertErr } = await supabase
            .from('users')
            .insert({
              username: cleanUsername,
              password,
              loginCount: 1,
              login_count: 1,
              lastLogin: now,
              last_login: now,
              registeredAt: now,
              tier: 'sandbox',
              billingCycle: 'monthly',
              problemsCount: 5
            });

          if (insertErr) throw insertErr;

          return { success: true, username: cleanUsername, loginCount: 1, lastLogin: now, isNewUser: true };
        }
      } catch (err) {
        console.error('Supabase login failed, using local storage:', err);
      }
    }

    const dbData = getLocalDb();
    const user = dbData.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

    if (user) {
      // For prototype: auto-update password to avoid caching issues and let them in
      user.password = password;
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = now;
      saveLocalDb(dbData);
      return { success: true, username: cleanUsername, loginCount: user.loginCount, lastLogin: now };
    } else {
      const newUser = { username: cleanUsername, password, loginCount: 1, lastLogin: now };
      dbData.users.push(newUser);
      saveLocalDb(dbData);
      return { success: true, username: cleanUsername, loginCount: 1, lastLogin: now, isNewUser: true };
    }
  },

  getUsers: async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          return data.map(u => ({
            username: u.username,
            password: u.password,
            login_count: u.loginCount || u.login_count || 1,
            last_login: u.lastLogin || u.last_login || new Date().toLocaleString(),
            tier: u.tier || 'sandbox',
            billingCycle: u.billingCycle || 'monthly',
            problemsCount: u.problemsCount !== undefined ? u.problemsCount : 5,
            registeredAt: u.registeredAt || u.lastLogin || new Date().toLocaleString()
          })).sort((a, b) => new Date(b.last_login) - new Date(a.last_login));
        }
      } catch (err) {
        console.error('Supabase getUsers failed:', err);
      }
    }

    const dbData = getLocalDb();
    const now = new Date().toLocaleString();
    return dbData.users
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

  updateUser: async (username, updates) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('username', username);
        if (error) throw error;
      } catch (err) {
        console.error('Supabase updateUser failed:', err);
      }
    }

    const dbData = getLocalDb();
    const user = dbData.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      Object.assign(user, updates);
      saveLocalDb(dbData);
      return user;
    }
    return null;
  },

  deleteUser: async (username) => {
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('username', username);
        await supabase.from('chats').delete().eq('username', username);
        await supabase.from('sandboxHistory').delete().eq('username', username);
        await supabase.from('userDatasets').delete().eq('username', username);
      } catch (err) {
        console.error('Supabase deleteUser failed:', err);
      }
    }

    const dbData = getLocalDb();
    dbData.users = dbData.users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    dbData.chats = dbData.chats.filter(c => c.username.toLowerCase() !== username.toLowerCase());
    dbData.sandboxHistory = dbData.sandboxHistory.filter(s => s.username.toLowerCase() !== username.toLowerCase());
    if (dbData.userDatasets) {
      dbData.userDatasets = dbData.userDatasets.filter(d => d.username.toLowerCase() !== username.toLowerCase());
    }
    saveLocalDb(dbData);
    return true;
  },

  getChats: async (username, agentId) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('username', username)
          .eq('agentId', agentId);
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getChats failed:', err);
      }
    }

    const dbData = getLocalDb();
    return dbData.chats.filter(
      c => c.username.toLowerCase() === username.toLowerCase() && c.agentId.toLowerCase() === agentId.toLowerCase()
    );
  },

  saveChat: async (username, agentId, sender, text, timestamp, monologue) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('chats')
          .insert({ username, agentId, sender, text, timestamp, monologue });
        if (error) throw error;
      } catch (err) {
        console.error('Supabase saveChat failed:', err);
      }
    }

    const dbData = getLocalDb();
    dbData.chats.push({ username, agentId, sender, text, timestamp, monologue });
    saveLocalDb(dbData);
  },

  getSandboxHistory: async (username) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('sandboxHistory')
          .select('*')
          .eq('username', username);
        if (error) throw error;
        if (data) {
          return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
      } catch (err) {
        console.error('Supabase getSandboxHistory failed:', err);
      }
    }

    const dbData = getLocalDb();
    return dbData.sandboxHistory
      .filter(s => s.username.toLowerCase() === username.toLowerCase())
      .reverse();
  },

  saveSandboxPrompt: async (username, prompt, timestamp) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('sandboxHistory')
          .insert({ username, prompt, timestamp });
        if (error) throw error;
      } catch (err) {
        console.error('Supabase saveSandboxPrompt failed:', err);
      }
    }

    const dbData = getLocalDb();
    dbData.sandboxHistory.push({ username, prompt, timestamp });
    saveLocalDb(dbData);
  },

  getUserDatasets: async (username) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('userDatasets')
          .select('*')
          .eq('username', username);
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getUserDatasets failed:', err);
      }
    }

    const dbData = getLocalDb();
    if (!dbData.userDatasets) return [];
    return dbData.userDatasets.filter(d => d.username.toLowerCase() === username.toLowerCase());
  },

  saveUserDataset: async (username, dataset) => {
    if (supabase) {
      try {
        // Fetch existing first to update/insert properly
        const { data, error: selectErr } = await supabase
          .from('userDatasets')
          .select('id')
          .eq('username', username)
          .eq('name', dataset.name)
          .maybeSingle();

        if (selectErr) throw selectErr;

        if (data) {
          const { error: updateErr } = await supabase
            .from('userDatasets')
            .update({ ...dataset, updatedAt: new Date().toLocaleString() })
            .eq('id', data.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('userDatasets')
            .insert({ username, ...dataset, createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString() });
          if (insertErr) throw insertErr;
        }
      } catch (err) {
        console.error('Supabase saveUserDataset failed:', err);
      }
    }

    const dbData = getLocalDb();
    if (!dbData.userDatasets) dbData.userDatasets = [];
    const idx = dbData.userDatasets.findIndex(
      d => d.username.toLowerCase() === username.toLowerCase() && d.name === dataset.name
    );
    if (idx !== -1) {
      dbData.userDatasets[idx] = { username, ...dataset, updatedAt: new Date().toLocaleString() };
    } else {
      dbData.userDatasets.push({ username, ...dataset, createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString() });
    }
    saveLocalDb(dbData);
  },

  deleteUserDataset: async (username, name) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('userDatasets')
          .delete()
          .eq('username', username)
          .eq('name', name);
        if (error) throw error;
      } catch (err) {
        console.error('Supabase deleteUserDataset failed:', err);
      }
    }

    const dbData = getLocalDb();
    if (!dbData.userDatasets) return;
    dbData.userDatasets = dbData.userDatasets.filter(
      d => !(d.username.toLowerCase() === username.toLowerCase() && d.name === name)
    );
    saveLocalDb(dbData);
  },
  getPayments: async (username) => {
    const dbData = getLocalDb();
    return dbData.payments ? (dbData.payments[username.toLowerCase()] || []) : [];
  },
  savePayment: async (username, paymentData) => {
    const dbData = getLocalDb();
    if (!dbData.payments) dbData.payments = {};
    const key = username.toLowerCase();
    if (!dbData.payments[key]) dbData.payments[key] = [];
    dbData.payments[key].push({
      id: paymentData.id,
      amount: paymentData.amount,
      planName: paymentData.planName,
      status: paymentData.status,
      date: new Date().toLocaleString()
    });
    saveLocalDb(dbData);
    return true;
  }
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('workspace'); // workspace, sandbox, analyst, swarm, marketplace, billing
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [landingPage, setLandingPage] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '');
    return path || 'home';
  });
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Pricing & ROI Calculator state
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [calcProblems, setCalcProblems] = useState(20);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  // Global animations effect
  useEffect(() => {
    // 1. Mouse Glow Tracker
    const handleMouseMove = (e) => {
      const glow = document.getElementById('mouse-glow-pointer');
      if (glow) {
        glow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 2. Scroll Reveal Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    // Delay to allow DOM to render dynamically routed pages
    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [landingPage]);
  
  // API Integration Configuration state - checks environment variables first
  const [apiProvider, setApiProvider] = useState(() => {
    const cached = localStorage.getItem('aos_api_provider');
    if (cached) return cached;
    if (import.meta.env.VITE_GEMINI_API_KEY) return 'gemini';
    if (import.meta.env.VITE_OPENAI_API_KEY) return 'openai';
    return 'fallback';
  });
  
  const [apiKey, setApiKey] = useState(() => {
    const cached = localStorage.getItem('aos_api_key');
    if (cached) return cached;
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    if (import.meta.env.VITE_OPENAI_API_KEY) return import.meta.env.VITE_OPENAI_API_KEY;
    return '';
  });

  const [customEndpoint, setCustomEndpoint] = useState(() => {
    return localStorage.getItem('aos_api_endpoint') || import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';
  });

  // Load custom agents from localStorage or defaults
  const [agents, setAgents] = useState(() => {
    const cached = localStorage.getItem('aos_custom_agents');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_AGENTS;
      }
    }
    return DEFAULT_AGENTS;
  });

  const [selectedAgentId, setSelectedAgentId] = useState('devon-x');
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Chat message states
  const [chats, setChats] = useState(() => {
    const initialChats = {
      'devon-x': [
        { sender: 'agent', text: 'Hello, I am Devon-X. If you have supplied an API Key in the Credentials panel (or inside a local .env file), I will make real LLM requests to generate and refine files in the sandbox. Otherwise, I will use high-fidelity template logic.', timestamp: '15:01', monologue: 'Connected. Waiting for prompt.' }
      ],
      'alphacap': [
        { sender: 'agent', text: 'AlphaCap Analyst online. Ingesting Q1 2026 indexes. I can run real analysis if configured, or use standard local matrix compilers.', timestamp: '15:02' }
      ],
      'swarm-mgr': [
        { sender: 'agent', text: 'SwarmCore is active. Input your swarm telemetry brief on the Swarm tab to trigger collaborative execution.', timestamp: '15:03' }
      ]
    };
    return initialChats;
  });
  
  const [currentInput, setCurrentInput] = useState('');
  const chatBottomRef = useRef(null);

  // Live Agent Creator Modal state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentAvatar, setNewAgentAvatar] = useState('🤖');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');
  const [newAgentModel, setNewAgentModel] = useState('Gemini 2.5 Flash');

  // CODE SANDBOX STATE
  const [sandboxFiles, setSandboxFiles] = useState(INITIAL_SANDBOX_FILES);
  const [activeFileName, setActiveFileName] = useState('index.html');
  const activeFile = sandboxFiles.find(f => f.name === activeFileName) || sandboxFiles[0];
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxLogs, setSandboxLogs] = useState([
    { type: 'system', text: 'Sandbox server initialized' },
    { type: 'info', text: 'Compile environment ready. Connect your API key for custom components.' }
  ]);
  const [isCodingInProgress, setIsCodingInProgress] = useState(false);
  const [codingProgress, setCodingProgress] = useState(0);
  const [codingStepDescription, setCodingStepDescription] = useState('');
  const [sandboxView, setSandboxView] = useState('editor'); // editor, preview
  const iframeRef = useRef(null);

  // DATA ANALYST STATE
  const [analystDataset, setAnalystDataset] = useState('aiHardware'); // aiHardware, agentMarket
  const [analystPrompt, setAnalystPrompt] = useState('');
  const [analystChartType, setAnalystChartType] = useState('line');
  const [analystOutput, setAnalystOutput] = useState({
    summary: 'Initial load computed. Custom enterprise hardware platforms show steady volume expansion.',
    insights: [
      'NVIDIA H100 shipments grew from 150K to 530K over the period.',
      'AMD MI300 shares surged late in the timeline.',
      'Cloud custom silicon chips grew rapidly.'
    ],
    chartData: [18.4, 22.0, 26.8, 31.2, 38.5, 44.2, 52.0, 59.6, 68.1, 76.4]
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // DYNAMIC DATA ANALYTICS STATE
  const [userDatasets, setUserDatasets] = useState([]); // list of user's saved datasets
  const [activeDatasetName, setActiveDatasetName] = useState(null); // which dataset is selected
  const [analystView, setAnalystView] = useState('list'); // 'list' | 'editor' | 'analysis'
  const [datasetEditorMode, setDatasetEditorMode] = useState('manual'); // 'manual' | 'upload'
  const [editorDataset, setEditorDataset] = useState({ name: '', headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', '']] });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiAnalystPrompt, setAiAnalystPrompt] = useState('');
  const [isUploadParsing, setIsUploadParsing] = useState(false);
  const fileInputRef = useRef(null);

  // SWARM STATE
  const [swarmPrompt, setSwarmPrompt] = useState('Build a clean real-time status API routing telemetry');
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmStep, setSwarmStep] = useState(0); // 0-6
  const [swarmLogs, setSwarmLogs] = useState([]);
  
  // SYSTEM STATE
  const [cpuUsage, setCpuUsage] = useState(19);
  const [memoryUsage, setMemoryUsage] = useState(4.1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // DYNAMIC PRICING CONFIGURATION STATE
  const [pricingConfig, setPricingConfig] = useState(() => {
    const saved = localStorage.getItem('aos_pricing_config');
    return saved ? JSON.parse(saved) : {
      monthlyDevSub: 1499,
      annualDevSub: 1199,
      monthlyProblemRate: 149,
      annualProblemRate: 99,
      traditionalHourCost: 1500,
      traditionalHoursPerProblem: 0.7
    };
  });

  // DYNAMIC MODELS LIST STATE
  const [availableModels, setAvailableModels] = useState(() => {
    const saved = localStorage.getItem('aos_available_models');
    return saved ? JSON.parse(saved) : [
      { id: 'gemini-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', status: 'Active' },
      { id: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', status: 'Active' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', status: 'Active' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', status: 'Active' },
      { id: 'llama3', name: 'Llama 3 (Local)', provider: 'ollama', status: 'Active' }
    ];
  });

  const updatePricingConfig = (newConfig) => {
    setPricingConfig(newConfig);
    localStorage.setItem('aos_pricing_config', JSON.stringify(newConfig));
  };

  const updateAvailableModels = (newModels) => {
    setAvailableModels(newModels);
    localStorage.setItem('aos_available_models', JSON.stringify(newModels));
  };

  // ADMIN PANEL SUB-TAB STATE
  const [adminSubTab, setAdminSubTab] = useState('customers');
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('gemini');

  // DATABASE / AUTHENTICATION INTEGRATION STATE
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('aos_logged_in_user') || '');
  const [userDirectory, setUserDirectory] = useState([]);
  const [sandboxHistory, setSandboxHistory] = useState([]);

  // Fetch billing history when tab is open
  useEffect(() => {
    if (activeTab === 'billing' && currentUser) {
      localDbAPI.getPayments(currentUser).then(setPaymentHistory);
    }
  }, [activeTab, currentUser]);

  // Fetch all users list for database stats
  const fetchUserDirectory = async () => {
    const local = await localDbAPI.getUsers();
    if (window.useLocalDbFallback) {
      setUserDirectory(local);
      return;
    }
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('API server returned error status');
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = new Map();
          local.forEach(u => map.set(u.username.toLowerCase(), u));
          data.forEach(u => map.set(u.username.toLowerCase(), u));
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.last_login || b.lastLogin) - new Date(a.last_login || a.lastLogin));
          setUserDirectory(merged);
        } else {
          setUserDirectory(local);
        }
      } else {
        window.useLocalDbFallback = true;
        setUserDirectory(local);
      }
    } catch (e) {
      console.warn('API error, falling back to client-side localStorage db', e);
      window.useLocalDbFallback = true;
      setUserDirectory(local);
    }
  };

  const handleUpdateUserTier = async (username, tier) => {
    if (!window.useLocalDbFallback) {
      try {
        const res = await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, updates: { tier } })
        });
        if (res.ok) {
          fetchUserDirectory();
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    await localDbAPI.updateUser(username, { tier });
    fetchUserDirectory();
  };

  const handleUpdateUserBillingCycle = async (username, billingCycle) => {
    if (!window.useLocalDbFallback) {
      try {
        const res = await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, updates: { billingCycle } })
        });
        if (res.ok) {
          fetchUserDirectory();
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    await localDbAPI.updateUser(username, { billingCycle });
    fetchUserDirectory();
  };

  const handleUpdateUserProblems = async (username, problemsCount) => {
    const val = parseInt(problemsCount);
    if (isNaN(val)) return;
    if (!window.useLocalDbFallback) {
      try {
        const res = await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, updates: { problemsCount: val } })
        });
        if (res.ok) {
          fetchUserDirectory();
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    await localDbAPI.updateUser(username, { problemsCount: val });
    fetchUserDirectory();
  };

  const handleDeleteUser = async (username) => {
    if (username.toLowerCase() === currentUser.toLowerCase()) {
      alert("Cannot delete the currently active admin session!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${username}"? All chat and sandbox data will be purged.`)) {
      return;
    }
    if (!window.useLocalDbFallback) {
      try {
        const res = await fetch(`/api/users/${username}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchUserDirectory();
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    await localDbAPI.deleteUser(username);
    fetchUserDirectory();
  };

  const handleImpersonateUser = (username) => {
    localStorage.setItem('aos_logged_in_user', username);
    setCurrentUser(username);
    setActiveTab('workspace');
  };

  // Fetch sandbox prompt logs from database
  const fetchSandboxHistory = async (user) => {
    if (!user) return;
    if (window.useLocalDbFallback) {
      setSandboxHistory(await localDbAPI.getSandboxHistory(user));
      return;
    }
    try {
      const res = await fetch(`/api/sandbox/${user}`);
      if (!res.ok) throw new Error('API server returned error status');
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSandboxHistory(data);
        }
      } else {
        window.useLocalDbFallback = true;
        setSandboxHistory(await localDbAPI.getSandboxHistory(user));
      }
    } catch (e) {
      window.useLocalDbFallback = true;
      setSandboxHistory(await localDbAPI.getSandboxHistory(user));
    }
  };

  // Fetch chat records for active agent
  const fetchChats = async (user, agentId) => {
    if (!user || !agentId) return;
    if (window.useLocalDbFallback) {
      const data = await localDbAPI.getChats(user, agentId);
      setChats(prev => ({
        ...prev,
        [agentId]: data.length > 0 ? data : getFallbackChats(agentId)
      }));
      return;
    }
    try {
      const res = await fetch(`/api/chats/${user}/${agentId}`);
      if (!res.ok) throw new Error('API server returned error status');
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setChats(prev => ({
            ...prev,
            [agentId]: data.length > 0 ? data : getFallbackChats(agentId)
          }));
        }
      } else {
        window.useLocalDbFallback = true;
        const data = await localDbAPI.getChats(user, agentId);
        setChats(prev => ({
          ...prev,
          [agentId]: data.length > 0 ? data : getFallbackChats(agentId)
        }));
      }
    } catch (e) {
      window.useLocalDbFallback = true;
      const data = await localDbAPI.getChats(user, agentId);
      setChats(prev => ({
        ...prev,
        [agentId]: data.length > 0 ? data : getFallbackChats(agentId)
      }));
    }
  };

  const getFallbackChats = (agentId) => {
    return agentId === 'devon-x' ? [{ sender: 'agent', text: 'Hello, I am Devon-X. If you have supplied an API Key in the Credentials panel (or inside a local .env file), I will make real LLM requests to generate and refine files in the sandbox. Otherwise, I will use high-fidelity template logic.', timestamp: '15:01', monologue: 'Connected. Waiting for prompt.' }] :
           agentId === 'alphacap' ? [{ sender: 'agent', text: 'AlphaCap Analyst online. Ingesting Q1 2026 indexes. I can run real analysis if configured, or use standard local matrix compilers.', timestamp: '15:02' }] :
           [{ sender: 'agent', text: 'SwarmCore is active. Input your swarm telemetry brief on the Swarm tab to trigger collaborative execution.', timestamp: '15:03' }];
  };

  useEffect(() => {
    const fetchPricingAndModels = async () => {
      try {
        const resPricing = await fetch('/api/pricing');
        const pricingData = await resPricing.json();
        if (pricingData && Object.keys(pricingData).length > 0) {
          setPricingConfig(pricingData);
        }

        const resModels = await fetch('/api/models');
        const modelsData = await resModels.json();
        if (modelsData && modelsData.length > 0) {
          setAvailableModels(modelsData);
        }
      } catch (err) {
        console.error('Failed to fetch pricing or models config from server db:', err);
      }
    };
    fetchPricingAndModels();
  }, []);

  // Synchronization triggers
  useEffect(() => {
    if (currentUser) {
      fetchChats(currentUser, selectedAgentId);
    }
  }, [currentUser, selectedAgentId]);

  useEffect(() => {
    if (currentUser) {
      fetchSandboxHistory(currentUser);
      fetchUserDirectory();
      const loadDatasets = async () => {
        setUserDatasets(await localDbAPI.getUserDatasets(currentUser));
      };
      loadDatasets();
      setActiveTab('workspace');
    }
  }, [currentUser]);

  // ── Dynamic Dataset Handlers ──────────────────────────────────────────
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadParsing(true);

    const reader = new FileReader();
    const isPDF = file.name.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      // PDF: read as text (works for text-based PDFs; proper PDF.js parse would need a worker)
      reader.onload = (ev) => {
        try {
          const text = ev.target.result;
          // Extract lines as rows, tab/comma-split into columns
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const rows = lines.map(l => l.split(/\t|,/).map(c => c.trim()));
          const maxCols = Math.max(...rows.map(r => r.length));
          const headers = Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`);
          setEditorDataset(prev => ({
            ...prev,
            name: file.name.replace(/\.[^/.]+$/, ''),
            headers,
            rows: rows.slice(0, 200)
          }));
          setDatasetEditorMode('manual');
          setAnalystView('editor');
        } catch (err) {
          alert('Could not parse PDF as text. Try a CSV or Excel file.');
        } finally {
          setIsUploadParsing(false);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel / CSV
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const headers = (jsonRows[0] || []).map(String);
          const rows = jsonRows.slice(1).map(r =>
            Array.from({ length: headers.length }, (_, i) => String(r[i] ?? ''))
          );
          setEditorDataset({
            name: file.name.replace(/\.[^/.]+$/, ''),
            headers,
            rows: rows.slice(0, 200)
          });
          setDatasetEditorMode('manual');
          setAnalystView('editor');
        } catch (err) {
          alert('Failed to parse file: ' + err.message);
        } finally {
          setIsUploadParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  }, []);

  const handleSaveDataset = async () => {
    if (!editorDataset.name.trim()) { alert('Please give this dataset a name.'); return; }
    const ds = { ...editorDataset, name: editorDataset.name.trim() };
    await localDbAPI.saveUserDataset(currentUser, ds);
    const updated = await localDbAPI.getUserDatasets(currentUser);
    setUserDatasets(updated);
    setActiveDatasetName(ds.name);
    setAnalystView('list');
  };

  const handleDeleteDataset = async (name) => {
    if (!window.confirm(`Delete dataset "${name}"?`)) return;
    await localDbAPI.deleteUserDataset(currentUser, name);
    setUserDatasets(await localDbAPI.getUserDatasets(currentUser));
    if (activeDatasetName === name) setActiveDatasetName(null);
    if (analystView === 'analysis') setAnalystView('list');
  };

  const handleAiAnalyzeDataset = async () => {
    const ds = userDatasets.find(d => d.name === activeDatasetName);
    if (!ds) return;
    setIsAnalyzing(true);
    setAnalystView('analysis');
    try {
      // Build a compact text table from the dataset
      const tableText = [ds.headers.join(' | '), ...ds.rows.slice(0, 50).map(r => r.join(' | '))].join('\n');
      const userQuery = aiAnalystPrompt.trim() || 'Analyze this dataset. Identify trends, outliers, and key insights.';

      if (apiProvider === 'fallback') {
        await new Promise(r => setTimeout(r, 1200));
        setAnalysisResult({
          summary: `Local template analysis of "${ds.name}": ${ds.rows.length} rows × ${ds.headers.length} columns. Configure a live API key in Credentials for real AI analysis.`,
          insights: [
            `Dataset has ${ds.rows.length} data entries.`,
            `Columns: ${ds.headers.join(', ')}.`,
            'Enable Gemini or OpenAI in Credentials tab for live AI-powered insights.'
          ],
          chartData: ds.rows.slice(0, 10).map((r) => {
            const nums = r.map(v => parseFloat(v)).filter(v => !isNaN(v));
            return nums.length > 0 ? nums[0] : 0;
          })
        });
      } else {
        const systemPrompt = `You are AlphaCap, an expert data analyst AI.
The user uploaded a dataset named "${ds.name}" with columns: ${ds.headers.join(', ')}.
Here is the data (max 50 rows shown):
${tableText}

User query: "${userQuery}"

Respond ONLY with a valid JSON object in this exact schema:
{
  "summary": "Comprehensive paragraph summarizing the dataset and answering the user query",
  "insights": ["Specific insight 1", "Specific insight 2", "Specific insight 3", "Specific insight 4"],
  "chartData": [number1, number2, ...] (extract the most meaningful numeric column values, max 15 points)
}`;
        const raw = await callLLM(systemPrompt, userQuery, true);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setAnalysisResult(parsed);
      }
    } catch (err) {
      setAnalysisResult({
        summary: `Analysis failed: ${err.message}`,
        insights: ['Please check your API key in Credentials.'],
        chartData: [0]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    const ds = userDatasets.find(d => d.name === activeDatasetName);
    if (!ds) return;
    const csv = [ds.headers, ...ds.rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${ds.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Sync settings and custom agents to localStorage
  useEffect(() => {
    localStorage.setItem('aos_api_provider', apiProvider);
    localStorage.setItem('aos_api_key', apiKey);
    localStorage.setItem('aos_api_endpoint', customEndpoint);
    localStorage.setItem('aos_custom_agents', JSON.stringify(agents));
  }, [apiProvider, apiKey, customEndpoint, agents]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 10) + 12);
      setMemoryUsage(parseFloat((Math.random() * 0.1 + 4.1).toFixed(2)));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedAgentId]);

  // Compile sandbox state into static HTML template
  const getIframeSrcDoc = () => {
    const html = sandboxFiles.find(f => f.name === 'index.html')?.content || '';
    const css = sandboxFiles.find(f => f.name === 'styles.css')?.content || '';
    const js = sandboxFiles.find(f => f.name === 'script.js')?.content || '';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            window.onerror = function(message, source, lineno) {
              window.parent.postMessage({ type: 'iframe-error', text: message + ' at line ' + lineno }, '*');
              return false;
            };
            console.log = function(...args) {
              window.parent.postMessage({ type: 'iframe-log', text: args.join(' ') }, '*');
            };
            try {
              ${js}
            } catch(e) {
              window.parent.postMessage({ type: 'iframe-error', text: e.message }, '*');
            }
          </script>
        </body>
      </html>
    `;
  };

  // Compile logs from active sandbox frame
  useEffect(() => {
    const handleIframeMessage = (e) => {
      if (e.data && e.data.type === 'iframe-log') {
        setSandboxLogs(prev => [...prev, { type: 'info', text: `Frame: ${e.data.text}` }]);
      } else if (e.data && e.data.type === 'iframe-error') {
        setSandboxLogs(prev => [...prev, { type: 'error', text: `Runtime Error: ${e.data.text}` }]);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  useEffect(() => {
    if (sandboxView === 'preview' && iframeRef.current) {
      iframeRef.current.srcdoc = getIframeSrcDoc();
    }
  }, [sandboxView, sandboxFiles]);

  // ==========================================
  // CORE API CALL ENGINE
  // ==========================================
  const callLLM = async (systemPrompt, userPrompt, jsonMode = false) => {
    if (apiProvider === 'fallback') {
      throw new Error('Using fallback mode. Please configure Gemini/OpenAI API parameters.');
    }

    if (!apiKey && apiProvider !== 'ollama') {
      throw new Error(`API key is required for ${apiProvider.toUpperCase()}. Please configure it in the Credentials tab.`);
    }

    if (apiProvider === 'gemini') {
      const model = selectedAgent.id === 'alphacap' ? 'gemini-1.5-pro' : 'gemini-2.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser request:\n${userPrompt}` }]
            }
          ],
          generationConfig: jsonMode ? { 
            responseMimeType: 'application/json' 
          } : {}
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gemini API Error');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    if (apiProvider === 'openai') {
      const model = selectedAgent.id === 'alphacap' ? 'gpt-4o' : 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: jsonMode ? { type: 'json_object' } : undefined
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'OpenAI API Error');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (apiProvider === 'ollama') {
      const response = await fetch(`${customEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false,
          format: jsonMode ? 'json' : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Ollama connection failed. Verify local daemon status.');
      }

      const data = await response.json();
      return data.message.content;
    }

    throw new Error('Unsupported provider.');
  };

  // ==========================================
  // CREATING AGENTS HANDLER
  // ==========================================
  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newAgentObj = {
      id: newId,
      name: newAgentName.trim(),
      role: newAgentRole.trim(),
      avatar: newAgentAvatar,
      description: newAgentDesc.trim() || 'Custom instantiated AI agent.',
      model: newAgentModel,
      temperature: 0.5,
      maxTokens: 2048,
      tools: { search: true, terminal: false, sandbox: true, imageGen: false },
      systemPrompt: newAgentPrompt.trim() || `You are ${newAgentName.trim()}, a helpful custom assistant.`
    };

    setAgents(prev => [...prev, newAgentObj]);
    setSelectedAgentId(newId);

    setChats(prev => ({
      ...prev,
      [newId]: [
        { 
          sender: 'agent', 
          text: `Greetings! I am ${newAgentName.trim()}, online. I am configured with model: ${newAgentModel}. How can I assist you in this workspace?`, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          monologue: `Instantiated custom node: ${newId}. System Prompt loaded.`
        }
      ]
    }));

    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentAvatar('🤖');
    setNewAgentDesc('');
    setNewAgentPrompt('');
    setIsCreatorOpen(false);
  };

  const handleDeleteAgent = (agentId, e) => {
    e.stopPropagation();
    if (DEFAULT_AGENTS.some(a => a.id === agentId)) {
      alert("Cannot delete system default agents.");
      return;
    }
    
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (selectedAgentId === agentId) {
      setSelectedAgentId('devon-x');
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      sender: 'user',
      text: currentInput,
      timestamp: time
    };

    const agentKey = selectedAgent.id;
    setChats(prev => ({
      ...prev,
      [agentKey]: [...(prev[agentKey] || []), userMsg]
    }));

    const promptText = currentInput;
    setCurrentInput('');

    // Save user chat message to database
    if (window.useLocalDbFallback) {
      await localDbAPI.saveChat(currentUser, agentKey, 'user', promptText, time);
    } else {
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          agentId: agentKey,
          sender: 'user',
          text: promptText,
          timestamp: time
        })
      }).catch(async err => {
        console.warn('POST chats failed, saving locally', err);
        await localDbAPI.saveChat(currentUser, agentKey, 'user', promptText, time);
      });
    }

    const tempAgentMsg = {
      sender: 'agent',
      text: 'Analyzing instructions and planning response...',
      timestamp: '...',
      monologue: 'Thinking...'
    };

    setChats(prev => ({
      ...prev,
      [agentKey]: [...prev[agentKey], tempAgentMsg]
    }));

    try {
      let replyText = '';
      let monologue = '';

      if (apiProvider === 'fallback') {
        await new Promise(r => setTimeout(r, 1200));
        replyText = `I am running in local template mode. To write live code, select 'Gemini API' or 'Ollama' in the Credentials tab and supply an API key. For testing, you can instruct me to build a "Todo app", "calculator", "weather", or "game" inside the Sandbox.`;
        monologue = 'Local fallback selected. Direct LLM connection is inactive.';
      } else {
        const responseText = await callLLM(selectedAgent.systemPrompt, promptText);
        replyText = responseText;
        monologue = `Response compiled using ${apiProvider.toUpperCase()} model integration.`;
      }

      const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChats(prev => {
        const currentList = prev[agentKey].slice(0, -1);
        return {
          ...prev,
          [agentKey]: [
            ...currentList,
            {
              sender: 'agent',
              text: replyText,
              timestamp: agentTime,
              monologue: monologue
            }
          ]
        };
      });

      // Save agent reply to database
      if (window.useLocalDbFallback) {
        await localDbAPI.saveChat(currentUser, agentKey, 'agent', replyText, agentTime, monologue);
      } else {
        fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser,
            agentId: agentKey,
            sender: 'agent',
            text: replyText,
            timestamp: agentTime,
            monologue: monologue
          })
        }).catch(async err => {
          console.warn('POST chats failed, saving locally', err);
          await localDbAPI.saveChat(currentUser, agentKey, 'agent', replyText, agentTime, monologue);
        });
      }

    } catch (err) {
      const errorTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChats(prev => {
        const currentList = prev[agentKey].slice(0, -1);
        return {
          ...prev,
          [agentKey]: [
            ...currentList,
            {
              sender: 'agent',
              text: `Error connecting to API provider: ${err.message}`,
              timestamp: 'ERROR',
              monologue: 'Connection Exception triggered.'
            }
          ]
        };
      });

      // Save agent error message to database
      if (window.useLocalDbFallback) {
        await localDbAPI.saveChat(currentUser, agentKey, 'agent', `Error connecting to API provider: ${err.message}`, errorTime, 'Connection Exception triggered.');
      } else {
        fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser,
            agentId: agentKey,
            sender: 'agent',
            text: `Error connecting to API provider: ${err.message}`,
            timestamp: errorTime,
            monologue: 'Connection Exception triggered.'
          })
        }).catch(async err => {
          console.warn('POST chats failed, saving locally', err);
          await localDbAPI.saveChat(currentUser, agentKey, 'agent', `Error connecting to API provider: ${err.message}`, errorTime, 'Connection Exception triggered.');
        });
      }
    }
  };

  const handleGenerateCode = async () => {
    if (!sandboxPrompt.trim()) return;

    // Save prompt generation log to database history
    if (window.useLocalDbFallback) {
      await localDbAPI.saveSandboxPrompt(currentUser, sandboxPrompt, new Date().toLocaleString());
      fetchSandboxHistory(currentUser);
    } else {
      fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          prompt: sandboxPrompt
        })
      }).then(() => fetchSandboxHistory(currentUser))
        .catch(async err => {
          console.warn('POST sandbox prompt failed, saving locally', err);
          await localDbAPI.saveSandboxPrompt(currentUser, sandboxPrompt, new Date().toLocaleString());
          fetchSandboxHistory(currentUser);
        });
    }
    
    
    setIsCodingInProgress(true);
    setCodingProgress(10);
    setCodingStepDescription('Parsing user requirements...');
    setSandboxLogs(prev => [...prev, { type: 'system', text: `Initiated code sandbox update for prompt: "${sandboxPrompt}"` }]);

    try {
      let updatedFiles = [];
      let explanation = '';

      if (apiProvider === 'fallback') {
        await new Promise(r => setTimeout(r, 1500));
        setCodingProgress(50);
        setCodingStepDescription('Matching templates...');
        
        const query = sandboxPrompt.toLowerCase();
        let matchedKey = 'todo';
        if (query.includes('weather') || query.includes('forecast')) matchedKey = 'weather';
        else if (query.includes('calc') || query.includes('math')) matchedKey = 'calculator';
        else if (query.includes('game') || query.includes('tic') || query.includes('toe')) matchedKey = 'game';
        
        await new Promise(r => setTimeout(r, 1500));
        setCodingProgress(90);
        setCodingStepDescription('Injecting client-side app package...');
        
        updatedFiles = FALLBACK_TEMPLATES[matchedKey];
        explanation = `Successfully compiled pre-cached code assets for: ${matchedKey.toUpperCase()} application.`;
      } else {
        const systemPrompt = `You are Devon-X, an autonomous software architect. 
Given the current code files in the sandbox:
- index.html
- styles.css
- script.js

Modify the code files based on the user's instructions to create a fully working interactive frontend app.
You must output a valid JSON object matching this schema. Return ONLY JSON:
{
  "explanation": "Summarize what you did",
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "styles.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}`;
        const userPrompt = `Current files:\n\n${sandboxFiles.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n')}\n\nUser request: ${sandboxPrompt}`;
        
        setCodingProgress(40);
        setCodingStepDescription('Requesting LLM code compilation...');
        const responseText = await callLLM(systemPrompt, userPrompt, true);
        
        setCodingProgress(80);
        setCodingStepDescription('Parsing code output structure...');
        
        const sanitized = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(sanitized);
        
        updatedFiles = parsed.files;
        explanation = parsed.explanation || 'Refactored sandbox directory.';
      }

      setSandboxFiles(updatedFiles);
      setSandboxLogs(prev => [
        ...prev, 
        { type: 'info', text: `Update complete: ${explanation}` },
        { type: 'system', text: 'HMR update successful. Preview refreshed.' }
      ]);
      setCodingProgress(100);
      setTimeout(() => {
        setIsCodingInProgress(false);
        setSandboxPrompt('');
        setSandboxView('preview');
      }, 800);

    } catch (err) {
      setSandboxLogs(prev => [...prev, { type: 'error', text: `Code generation failed: ${err.message}` }]);
      setIsCodingInProgress(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!analystPrompt.trim()) return;

    setIsAnalyzing(true);
    try {
      if (apiProvider === 'fallback') {
        await new Promise(r => setTimeout(r, 1200));
        if (analystDataset === 'aiHardware') {
          setAnalystOutput({
            summary: `Cached local analysis for: "${analystPrompt}". Showing revenue index trends. For live data mining, configure an API key.`,
            insights: [
              'Data shows steady hardware demand.',
              'Revenue indices projected to scale.'
            ],
            chartData: [18.4, 22.0, 26.8, 31.2, 38.5, 44.2, 52.0, 59.6, 68.1, 76.4]
          });
        } else {
          setAnalystOutput({
            summary: `Cached Local Sector analysis for: "${analystPrompt}"`,
            insights: ['Finance and E-commerce lead the deployment sectors.'],
            chartData: [48.2, 31.0, 24.5, 12.8, 9.4, 7.1]
          });
        }
      } else {
        const systemPrompt = `You are AlphaCap Analyst. Process the following dataset and query.
Dataset: ${JSON.stringify(SAMPLE_DATASETS[analystDataset])}

Output a valid JSON object matching this schema. Return ONLY JSON:
{
  "summary": "Detailed paragraph analyzing the trend",
  "insights": ["Insight point 1", "Insight point 2", "Insight point 3"],
  "chartData": [number1, number2, number3, ...]
}`;
        const responseText = await callLLM(systemPrompt, analystPrompt, true);
        const sanitized = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(sanitized);
        setAnalystOutput(parsed);
      }
    } catch (err) {
      setSandboxLogs(prev => [...prev, { type: 'error', text: `Analytics failed: ${err.message}` }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDispatchSwarm = () => {
    if (!swarmPrompt.trim()) return;

    setIsSwarmRunning(true);
    setSwarmStep(1);
    setSwarmLogs([{ time: '15:20:00', node: 'Orchestrator', type: 'info', text: `Initiating agent pipeline: "${swarmPrompt}"` }]);

    setTimeout(() => {
      setSwarmStep(2);
      setSwarmLogs(prev => [
        ...prev, 
        { time: '15:20:02', node: 'Orchestrator', type: 'success', text: 'Task split completed.' },
        { time: '15:20:03', node: 'Architect', type: 'action', text: 'Creating YAML system requirements and module routing maps.' }
      ]);
    }, 1500);

    setTimeout(() => {
      setSwarmStep(3);
      setSwarmLogs(prev => [
        ...prev,
        { time: '15:20:05', node: 'Architect', type: 'success', text: 'System boundaries established.' },
        { time: '15:20:06', node: 'Developer', type: 'action', text: 'Compiling API methods, schema models, and interface parameters.' }
      ]);
    }, 3500);

    setTimeout(() => {
      setSwarmStep(4);
      setSwarmLogs(prev => [
        ...prev,
        { time: '15:20:09', node: 'Developer', type: 'success', text: 'API routes and repository logic written.' },
        { time: '15:20:10', node: 'QA Expert', type: 'action', text: 'Executing test automation suite...' }
      ]);
    }, 6000);

    setTimeout(() => {
      setSwarmStep(5);
      setSwarmLogs(prev => [
        ...prev,
        { time: '15:20:12', node: 'QA Expert', type: 'success', text: 'Assertions passed. Code quality audit score: A+' },
        { time: '15:20:13', node: 'DevOps', type: 'action', text: 'Building Docker container and checking network ports.' }
      ]);
    }, 8500);

    setTimeout(() => {
      setSwarmStep(6);
      setSwarmLogs(prev => [
        ...prev,
        { time: '15:20:15', node: 'DevOps', type: 'success', text: 'Service online. Port binding complete.' },
        { time: '15:20:16', node: 'Orchestrator', type: 'system', text: 'Swarm telemetry task successfully compiled.' }
      ]);
      setIsSwarmRunning(false);
    }, 11000);
  };

  const handleRazorpayPayment = async (amount, planName) => {
    if (!currentUser) {
      alert("Please sign in first to complete your purchase.");
      setLandingPage('home');
      setTimeout(() => document.getElementById('login-box')?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: 'rzp_test_SujqCYjJH8d5WS',
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'AosAI Platform',
          description: planName,
          handler: async function (response) {
            const paymentId = response.razorpay_payment_id;
            
            // Save to internal mock DB
            await localDbAPI.savePayment(currentUser, {
              id: paymentId,
              amount: amount,
              planName: planName,
              status: 'Success'
            });
            alert(`Payment successful! Invoice PDF will now download. ID: ${paymentId}`);

            // Generate Colorful PDF Invoice
            const doc = new jsPDF();
            doc.setFillColor(139, 92, 246);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('AosAI Platform', 14, 25);
            doc.setFontSize(12);
            doc.text('Payment Invoice', 170, 25);
            
            doc.setTextColor(50, 50, 50);
            doc.text(`Invoice ID: ${paymentId}`, 14, 50);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 60);
            doc.text(`Customer: ${currentUser}`, 14, 70);
            
            doc.autoTable({
              startY: 85,
              head: [['Description', 'Amount (INR)']],
              body: [[planName, `Rs. ${amount.toFixed(2)}`]],
              theme: 'grid',
              headStyles: { fillColor: [139, 92, 246] }
            });
            
            doc.setFontSize(14);
            doc.text(`Total Paid: Rs. ${amount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text('Thank you for choosing AosAI!', 14, doc.lastAutoTable.finalY + 40);
            doc.save(`AosAI_Invoice_${paymentId}.pdf`);
            
            resolve(true);
          },
          prefill: {
            name: currentUser,
            email: `${currentUser}@aosai.com`,
          },
          theme: {
            color: '#8b5cf6'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          alert(`Payment failed: ${response.error.description}`);
          resolve(false);
        });
        rzp.open();
      };
      script.onerror = () => {
        alert('Failed to load Razorpay SDK. Please check your connection.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const renderProfilePage = () => {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)', width: '100%', height: '100%', overflowY: 'auto' }} className="animate-fade">
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>My Profile</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your account settings and personal information.</p>
        
        <div className="glow-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
              {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '24px', color: 'white' }}>{currentUser}</h3>
              <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Active Account</span>
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Username</label>
              <input type="text" className="input-field" value={currentUser} readOnly style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Role</label>
              <input type="text" className="input-field" value={currentUser.toLowerCase() === 'admin' ? 'Superadmin' : 'Standard User'} readOnly style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Account ID</label>
              <input type="text" className="input-field" value={`AOS-${Math.abs((currentUser || '').split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).toUpperCase()}`} readOnly style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => alert('Profile updated!')}>Save Changes</button>
            <button className="btn-secondary" style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => {
              localStorage.removeItem('aos_logged_in_user');
              setCurrentUser('');
            }}>Log Out</button>
          </div>
        </div>
      </div>
    );
  };

  const renderUserDashboard = () => {
    const latestPlan = paymentHistory.length > 0 ? paymentHistory[0].planName : 'Sandbox Free';
    
    return (
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)', width: '100%', height: '100%', overflowY: 'auto' }} className="animate-fade">
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>My Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Welcome back, {currentUser || 'Guest'}! Here is your current account overview.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="var(--primary)" /> Current Plan
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{latestPlan}</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--success)' }}>Active</p>
          </div>
          
          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--secondary)" /> Monthly Requests
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>12 / 100</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Tasks executed</p>
          </div>

          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={16} color="var(--warning)" /> Pending Requests
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>0</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>All tasks completed</p>
          </div>

          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="var(--error)" /> Next Payment Due
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'white' }}>N/A</p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>No recurring plan active</p>
          </div>
        </div>

        <div className="glow-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'white' }}>Recent Account Activity</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You have no pending system notifications. Please check the "Billing & Invoices" tab for transaction history.</p>
        </div>
      </div>
    );
  };

  const renderBillingPage = () => {
    return (
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)', width: '100%' }} className="animate-fade">
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>Billing & Invoices</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>View your past transactions and download invoices.</p>
        
        {paymentHistory.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No payment history found.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Invoice ID</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Plan</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Amount (INR)</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px', color: 'white' }}>{p.date}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--primary)', fontFamily: 'monospace' }}>{p.id}</td>
                    <td style={{ padding: '16px 20px', color: 'white' }}>{p.planName}</td>
                    <td style={{ padding: '16px 20px', color: 'white', fontWeight: '600' }}>₹{p.amount.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '12px', fontWeight: 'bold' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.setFontSize(22);
                          doc.setTextColor(139, 92, 246);
                          doc.text('AosAI - OFFICIAL INVOICE', 20, 30);
                          doc.setFontSize(12);
                          doc.setTextColor(0, 0, 0);
                          doc.text(`Date: ${p.date}`, 20, 50);
                          doc.text(`Invoice ID: ${p.id}`, 20, 60);
                          doc.text(`Customer: ${currentUser || 'Guest'}`, 20, 70);
                          
                          autoTable(doc, {
                            startY: 90,
                            head: [['Description', 'Amount', 'Status']],
                            body: [
                              [p.planName, `INR ${p.amount.toFixed(2)}`, p.status]
                            ],
                            theme: 'grid',
                            headStyles: { fillColor: [139, 92, 246] }
                          });
                          
                          doc.setFontSize(10);
                          doc.setTextColor(100, 100, 100);
                          doc.text('Thank you for choosing AosAI!', 20, doc.lastAutoTable.finalY + 20);
                          
                          // Use the native jsPDF save method which handles browser quirks internally
                          doc.save(`Invoice_${p.id}.pdf`);
                        }}
                        style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderPricingPage = (isInsideApp = false) => {
    const isAnnual = billingCycle === 'annual';
    const devMonthlyPrice = isAnnual ? pricingConfig.annualDevSub : pricingConfig.monthlyDevSub;
    const problemCost = isAnnual ? pricingConfig.annualProblemRate : pricingConfig.monthlyProblemRate;
    
    const computedDevSub = devMonthlyPrice;
    const computedProblemTotal = (calcProblems * problemCost).toFixed(2);
    const traditionalDevCost = (calcProblems * (pricingConfig.traditionalHourCost * pricingConfig.traditionalHoursPerProblem)).toFixed(2);
    const problemSavings = (parseFloat(traditionalDevCost) - parseFloat(computedProblemTotal)).toFixed(2);
    const savingsPercent = Math.round(((parseFloat(traditionalDevCost) - parseFloat(computedProblemTotal)) / parseFloat(traditionalDevCost)) * 100);

    return (
      <div style={{ 
        padding: isInsideApp ? '32px' : '60px 24px', 
        maxWidth: '1100px', 
        margin: '0 auto',
        height: isInsideApp ? '100%' : 'auto',
        overflowY: isInsideApp ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }} className="animate-fade">
        
        {/* Pricing Header */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: isInsideApp ? '24px' : '36px', fontWeight: '800' }} className="text-gradient">
            Flexible Pricing for Autonomous AI Engineering
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '15px', color: 'var(--text-muted)' }}>
            Choose the flat-rate workspace subscription or leverage our revolutionary pay-per-problem model.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{ 
            display: 'inline-flex', 
            background: 'rgba(255, 255, 255, 0.03)', 
            padding: '4px', 
            borderRadius: '20px', 
            border: '1px solid var(--border-color)',
            marginBottom: '10px'
          }}>
            <button 
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                background: billingCycle === 'monthly' ? 'var(--primary)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              Monthly Billing
            </button>
            <button 
              type="button"
              onClick={() => setBillingCycle('annual')}
              style={{
                background: billingCycle === 'annual' ? 'var(--primary)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Annual Billing <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '8px' }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          
          {/* Card 1: Free Sandbox */}
          <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'white' }}>Sandbox Playground</h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)' }}>Perfect for testing local templates and features.</p>
            <div style={{ margin: '0 0 24px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>₹0</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}> / forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Local interactive template apps</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Standard user session & audit log</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Single-agent local dialog history</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}><X size={14} color="var(--error)" /> No live LLM custom API connection</li>
            </ul>
            <button type="button" className="btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }} disabled>
              Current Default Tier
            </button>
          </div>

          {/* Card 2: Developer Pro */}
          <div className="glow-card glow-card-active" style={{ padding: '30px', display: 'flex', flexDirection: 'column', border: '1px solid var(--primary)', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-12px', 
              right: '24px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: 'bold', 
              padding: '4px 10px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)' 
            }}>
              POPULAR
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'white' }}>Developer Subscription</h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)' }}>Best for power developers needing persistent API keys.</p>
            <div style={{ margin: '0 0 24px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>₹{devMonthlyPrice}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}> / month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Live Gemini & OpenAI integration pipelines</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Unlimited custom agent creations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Core sandbox editor & compilation outputs</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Data Analyst & Excel imports upload tool</li>
            </ul>
            <button 
              type="button"
              className="btn-primary" 
              style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
              onClick={() => handleRazorpayPayment(devMonthlyPrice, 'Developer Subscription')}
            >
              Upgrade Workspace
            </button>
          </div>

          {/* Card 3: Pay-Per-Problem */}
          <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Pay-Per-Problem <Zap size={16} color="var(--secondary)" fill="var(--secondary)" />
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)' }}>Revolutionary on-demand plan for bug-fixing.</p>
            <div style={{ margin: '0 0 24px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>₹{problemCost.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}> / solved task</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Pay ONLY when sandboxed compilation succeeds</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Free auto-rollback and testing retry operations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Unlimited debugging logs & agent execution duration</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="var(--success)" /> Full Swarm coordinator task delegations</li>
            </ul>
            <button 
              type="button"
              className="btn-primary" 
              style={{ 
                marginTop: 'auto', 
                width: '100%', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--secondary) 0%, #0891b2 100%)',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
              onClick={() => handleRazorpayPayment(problemCost, 'Pay-Per-Problem Initial Deposit')}
            >
              Activate Pay-Per-Problem
            </button>
          </div>
        </div>

        {/* Savings Calculator Card */}
        <div className="glow-card" style={{ padding: '30px', background: 'rgba(20, 24, 38, 0.4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 350px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} color="var(--secondary)" />
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Pay-Per-Problem ROI Estimator</h4>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Traditional engineering tasks can take hours and cost hundreds of dollars. Toggle the slider to see how much you save using Devon-X's autonomous, outcome-based problem pricing model.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                  <span>Problems/Bugs solved per month:</span>
                  <span style={{ color: 'var(--secondary)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>{calcProblems} tasks</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={calcProblems} 
                  onChange={(e) => setCalcProblems(parseInt(e.target.value))}
                  style={{ 
                    width: '100%', 
                    accentColor: 'var(--secondary)',
                    background: 'rgba(255,255,255,0.1)',
                    height: '6px',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Flat Subscription Plan:</span>
                <span style={{ fontWeight: 'bold', textAlign: 'right' }}>₹{computedDevSub} / mo</span>

                <span style={{ color: 'var(--text-muted)' }}>On-Demand Problems cost:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--secondary)', textAlign: 'right' }}>₹{computedProblemTotal} / mo</span>

                <span style={{ color: 'var(--text-muted)' }}>Traditional Human Dev cost:</span>
                <span style={{ textDecoration: 'line-through', textAlign: 'right' }}>₹{traditionalDevCost} / mo</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Monthly Sandbox Savings:</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }} className="text-gradient-pink">
                    ₹{problemSavings}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Platform efficiency advantage:</span>
                  <span style={{ fontSize: '12px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {savingsPercent}% Lower Cost
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminPanel = () => {
    // 1. Calculate active statistics
    const totalUsers = userDirectory.length;
    const totalLogins = userDirectory.reduce((sum, u) => sum + (u.login_count || 0), 0);
    
    // Revenue calculations using pricingConfig
    const projectedRevenue = userDirectory.reduce((sum, u) => {
      if (u.tier === 'developer') {
        return sum + (u.billingCycle === 'annual' ? pricingConfig.annualDevSub : pricingConfig.monthlyDevSub);
      } else if (u.tier === 'problem') {
        const rate = u.billingCycle === 'annual' ? pricingConfig.annualProblemRate : pricingConfig.monthlyProblemRate;
        return sum + (u.problemsCount || 0) * rate;
      }
      return sum;
    }, 0);

    const totalProblemsSolved = userDirectory.reduce((sum, u) => sum + (u.problemsCount || 0), 0);
    
    const tierCounts = userDirectory.reduce((acc, u) => {
      acc[u.tier] = (acc[u.tier] || 0) + 1;
      return acc;
    }, { sandbox: 0, developer: 0, problem: 0 });

    return (
      <div style={{
        padding: '24px',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }} className="text-gradient">
              Platform Administration Console
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Monitor system state, billing revenues, and manage user directories.
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(236, 72, 153, 0.1)',
            color: 'var(--accent)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}>
            <Shield size={12} /> Master Admin Session
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <div className="glow-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Customers</span>
            <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0' }} className="text-gradient">
              {totalUsers}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>Registered system accounts</p>
          </div>

          <div className="glow-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Projected Monthly Revenue</span>
            <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0', color: 'var(--success)' }}>
              ${projectedRevenue.toFixed(2)}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>Active subscriptions + problems billing</p>
          </div>

          <div className="glow-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Problems Solved (All Time)</span>
            <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0', color: 'var(--secondary)' }}>
              {totalProblemsSolved} tasks
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>Compiled unit test successes</p>
          </div>

          <div className="glow-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>User Audits Logins</span>
            <div style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0' }}>
              {totalLogins}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>Total dashboard visits logged</p>
          </div>
        </div>

        {/* Admin Navigation Sub-tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          gap: '24px',
          paddingBottom: '2px',
          marginBottom: '8px'
        }}>
          <button 
            type="button"
            onClick={() => setAdminSubTab('customers')} 
            style={{
              background: 'none',
              border: 'none',
              borderBottom: adminSubTab === 'customers' ? '2px solid var(--primary)' : '2px solid transparent',
              color: adminSubTab === 'customers' ? 'white' : 'var(--text-muted)',
              padding: '8px 4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <User size={14} /> Customer Directory
          </button>
          <button 
            type="button"
            onClick={() => setAdminSubTab('pricing')} 
            style={{
              background: 'none',
              border: 'none',
              borderBottom: adminSubTab === 'pricing' ? '2px solid var(--primary)' : '2px solid transparent',
              color: adminSubTab === 'pricing' ? 'white' : 'var(--text-muted)',
              padding: '8px 4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Zap size={14} /> Pricing & Subscriptions
          </button>
          <button 
            type="button"
            onClick={() => setAdminSubTab('models')} 
            style={{
              background: 'none',
              border: 'none',
              borderBottom: adminSubTab === 'models' ? '2px solid var(--primary)' : '2px solid transparent',
              color: adminSubTab === 'models' ? 'white' : 'var(--text-muted)',
              padding: '8px 4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Cpu size={14} /> LLM Model Profiles
          </button>
        </div>

        {/* SUB-TAB 1: CUSTOMERS */}
        {adminSubTab === 'customers' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            alignItems: 'start'
          }} className="analyst-layout">
            {/* Customer list card */}
            <div className="glow-card" style={{ padding: '24px', minWidth: 0 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--primary)" /> Manage Platform Customers
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>User Details</th>
                      <th style={{ padding: '10px 8px' }}>Active Subscription Tier</th>
                      <th style={{ padding: '10px 8px' }}>Billing Cycle</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Tasks</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDirectory.map((usr) => (
                      <tr key={usr.username} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{usr.username}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dark)' }}>Registered: {usr.registeredAt || 'Unknown'}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Logins: {usr.login_count || 1} • Last seen: {usr.last_login}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <select 
                            value={usr.tier} 
                            onChange={(e) => handleUpdateUserTier(usr.username, e.target.value)}
                            className="input-field"
                            style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.3)', width: '130px' }}
                          >
                            <option value="sandbox">Sandbox (Free)</option>
                            <option value="developer">Developer Sub</option>
                            <option value="problem">Pay-Per-Problem</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <select 
                            value={usr.billingCycle} 
                            onChange={(e) => handleUpdateUserBillingCycle(usr.username, e.target.value)}
                            className="input-field"
                            style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.3)', width: '100px' }}
                          >
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual (-20%)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <input 
                            type="number"
                            value={usr.problemsCount || 0}
                            onChange={(e) => handleUpdateUserProblems(usr.username, e.target.value)}
                            className="input-field"
                            style={{ 
                              padding: '4px', 
                              fontSize: '11px', 
                              background: 'rgba(0,0,0,0.3)', 
                              width: '50px', 
                              textAlign: 'center',
                              fontFamily: 'var(--font-mono)'
                            }}
                            min="0"
                            max="999"
                          />
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              type="button"
                              onClick={() => handleImpersonateUser(usr.username)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Impersonate user session"
                            >
                              <Compass size={10} /> Switch
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteUser(usr.username)}
                              className="btn-secondary"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '10px', 
                                color: 'var(--error)', 
                                borderColor: 'rgba(239, 68, 68, 0.2)' 
                              }}
                              title="Purge user account"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {userDirectory.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No customers recorded in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Master Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glow-card" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={15} color="var(--secondary)" /> Sandbox Resource Controls
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Containers:</span>
                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{totalUsers * 2} VM instances</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Engine Allocation:</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Optimal (1.2 Gb/VM)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Subscriptions:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{tierCounts.developer} dev accounts</span>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      alert("Rebuilding active sandbox instances... All container caches purged successfully!");
                    }}
                    className="btn-secondary" 
                    style={{ width: '100%', padding: '10px', fontSize: '11px', marginTop: '8px' }}
                  >
                    Purge & Rebuild Sandbox Engines
                  </button>
                </div>
              </div>

              <div className="glow-card" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={15} color="var(--success)" /> Master Swarm Actions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Swarm Plan status:</span>
                    <span style={{ color: isSwarmRunning ? 'var(--success)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                      {isSwarmRunning ? 'ACTIVE FLOWS' : 'STANDBY'}
                    </span>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      if (isSwarmRunning) {
                        setIsSwarmRunning(false);
                        setSwarmStep(0);
                        setSwarmLogs(['[Master Admin Override] All active swarm coordinator workflows killed.']);
                        alert("Global Swarm executors terminated.");
                      } else {
                        alert("No active swarm instances running globally.");
                      }
                    }}
                    className="btn-secondary" 
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      fontSize: '11px', 
                      color: 'var(--error)', 
                      borderColor: 'rgba(239, 68, 68, 0.2)' 
                    }}
                  >
                    Kill All Active Swarms
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: PRICING CONFIG */}
        {adminSubTab === 'pricing' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            alignItems: 'start'
          }} className="analyst-layout animate-fade">
            {/* Rates Modifier */}
            <div className="glow-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="var(--primary)" /> Billing Rate Modifiers
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = {
                  monthlyDevSub: parseFloat(e.target.monthlyDevSub.value),
                  annualDevSub: parseFloat(e.target.annualDevSub.value),
                  monthlyProblemRate: parseFloat(e.target.monthlyProblemRate.value),
                  annualProblemRate: parseFloat(e.target.annualProblemRate.value),
                  traditionalHourCost: parseFloat(e.target.traditionalHourCost.value),
                  traditionalHoursPerProblem: parseFloat(e.target.traditionalHoursPerProblem.value)
                };
                updatePricingConfig(updated);
                alert("Platform pricing configurations updated and published successfully!");
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Developer Monthly Sub (₹)
                    </label>
                    <input 
                      type="number" 
                      name="monthlyDevSub" 
                      defaultValue={pricingConfig.monthlyDevSub} 
                      step="0.01"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Developer Annual Sub (₹)
                    </label>
                    <input 
                      type="number" 
                      name="annualDevSub" 
                      defaultValue={pricingConfig.annualDevSub} 
                      step="0.01"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Pay-Per-Problem Monthly (₹/Task)
                    </label>
                    <input 
                      type="number" 
                      name="monthlyProblemRate" 
                      defaultValue={pricingConfig.monthlyProblemRate} 
                      step="0.01"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Pay-Per-Problem Annual (₹/Task)
                    </label>
                    <input 
                      type="number" 
                      name="annualProblemRate" 
                      defaultValue={pricingConfig.annualProblemRate} 
                      step="0.01"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Traditional Dev Rate (₹/Hr)
                    </label>
                    <input 
                      type="number" 
                      name="traditionalHourCost" 
                      defaultValue={pricingConfig.traditionalHourCost} 
                      step="0.5"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Traditional Hours Per Problem
                    </label>
                    <input 
                      type="number" 
                      name="traditionalHoursPerProblem" 
                      defaultValue={pricingConfig.traditionalHoursPerProblem} 
                      step="0.01"
                      className="input-field" 
                      style={{ width: '100%' }} 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                  Save & Publish Rates
                </button>
              </form>
            </div>

            {/* Live Estimator Preview Card */}
            <div className="glow-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'white' }}>
                Live Subscription Estimator Sandbox
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                This is a real-time preview of how users will see the ROI Estimator calculations based on current admin settings.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>10 Problems Solved (Monthly rate):</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>₹{(10 * pricingConfig.monthlyProblemRate).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>10 Problems Solved (Annual rate):</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>₹{(10 * pricingConfig.annualProblemRate).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Traditional Human cost (10 tasks):</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--error)' }}>
                    ₹{(10 * pricingConfig.traditionalHourCost * pricingConfig.traditionalHoursPerProblem).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Monthly Savings using AosAI:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                    +₹{((10 * pricingConfig.traditionalHourCost * pricingConfig.traditionalHoursPerProblem) - (10 * pricingConfig.monthlyProblemRate)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: MODELS CONFIG */}
        {adminSubTab === 'models' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr',
            gap: '24px',
            alignItems: 'start'
          }} className="analyst-layout animate-fade">
            {/* Models Table */}
            <div className="glow-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--primary)" /> Configured LLM Models directory
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>Model Name</th>
                      <th style={{ padding: '10px 8px' }}>Provider</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableModels.map((model) => (
                      <tr key={model.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'white' }}>
                          {model.name}
                        </td>
                        <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                          {model.provider}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = availableModels.map(m => m.id === model.id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m);
                              updateAvailableModels(updated);
                            }}
                            className={model.status === 'Active' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '2px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', minWidth: '65px', justifyContent: 'center' }}
                          >
                            {model.status}
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = availableModels.filter(m => m.id !== model.id);
                              updateAvailableModels(updated);
                            }}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Model Panel */}
            <div className="glow-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'white' }}>
                Register New LLM Profile
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newModelName.trim()) {
                  alert("Please supply a valid Model Name.");
                  return;
                }
                const newModel = {
                  id: newModelName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  name: newModelName.trim(),
                  provider: newModelProvider,
                  status: 'Active'
                };
                
                // Avoid duplicates
                if (availableModels.some(m => m.id === newModel.id)) {
                  alert("A model with this profile identity already exists.");
                  return;
                }

                updateAvailableModels([...availableModels, newModel]);
                setNewModelName('');
                alert("New LLM model successfully registered system-wide!");
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Model Identifier Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gemini 2.0 Pro Experimental"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="input-field" 
                    style={{ width: '100%' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    LLM Engine Provider
                  </label>
                  <select 
                    value={newModelProvider}
                    onChange={(e) => setNewModelProvider(e.target.value)}
                    className="input-field" 
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <option value="gemini">Google Gemini AI</option>
                    <option value="openai">OpenAI GPT-4 / o1</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="ollama">Ollama (Local Host)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                  Register Model Profile
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-main)',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Custom Glowing Cursor Tracker */}
        <div id="mouse-glow-pointer" className="mouse-glow"></div>

        {/* Antigravity floating particles background overlay */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {[...Array(15)].map((_, i) => {
            const size = Math.random() * 90 + 30;
            const delay = Math.random() * -30;
            const duration = Math.random() * 20 + 15;
            const left = Math.random() * 100;
            const driftX = Math.random() * 120 - 60;
            return (
              <div 
                key={i} 
                className="antigravity-particle"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animation: `antigravity-rise ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  '--drift-x': `${driftX}px`
                }} 
              />
            );
          })}
        </div>

        {/* Decorative Grid and Ambient Lights */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1000px',
          backgroundImage: 'radial-gradient(at 50% 30%, rgba(139, 92, 246, 0.12) 0px, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Global Nav Bar */}
        <header className="global-header header-glow-border">
          <div className="header-brand antigravity-float">
            <img
              src="/aosai-logo.png"
              alt="AosAI Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                objectFit: 'cover',
                boxShadow: '0 0 14px rgba(139,92,246,0.5)'
              }}
            />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }} className="text-gradient">AosAI Agent Hub</h1>
          </div>
          
          <div className="header-nav-desktop">
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('home'); }}>Home</a>
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('about'); }}>About Us</a>
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('solutions'); }}>Solutions</a>
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('enterprise'); }}>Enterprise</a>
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('api'); }}>API Docs</a>
            <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); setLandingPage('pricing'); }}>Pricing</a>
            <a href="#login-box" className="btn-cyber-header" onClick={(e) => { e.preventDefault(); setLandingPage('home'); setTimeout(() => document.getElementById('login-box')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sign In</a>
          </div>

          <button className="header-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {mobileMenuOpen && (
            <div className="header-nav-mobile">
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('home'); }}>Home</a>
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('about'); }}>About Us</a>
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('solutions'); }}>Solutions</a>
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('enterprise'); }}>Enterprise</a>
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('api'); }}>API Docs</a>
              <a href="#" className="header-mobile-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('pricing'); }}>Pricing</a>
              <a href="#login-box" className="btn-cyber-header" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setLandingPage('home'); setTimeout(() => document.getElementById('login-box')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sign In</a>
            </div>
          )}
        </header>

        <div style={{ flex: '1 0 auto' }}>
        {landingPage === 'home' && (<>
        {/* Hero Section */}
        <div className="reveal-scale" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Hero text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="antigravity-float">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(139, 92, 246, 0.1)', 
              color: 'var(--primary)', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              border: '1px solid rgba(139, 92, 246, 0.2)',
              width: 'fit-content'
            }}>
              <Sparkles size={12} /> Next-Gen AI Agent Platform
            </div>
            <h2 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.2', margin: 0 }} className="text-gradient">
              Orchestrate Autonomous Multi-Agent Workflows
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              Connect Devon-X, AlphaCap, and Swarm Core agents to compile sandbox environments, execute quantitative trend data, and coordinate multi-specialist tasks seamlessly.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
              <div className="glow-card" style={{ padding: '16px', flex: '1 1 180px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={14} color="var(--primary)" /> Devon-X Coder
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Autonomous sandbox software execution engine.</p>
              </div>
              <div className="glow-card" style={{ padding: '16px', flex: '1 1 180px', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} color="var(--secondary)" /> SwarmCore Manager
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Multi-agent coordinator & task delegation sequence.</p>
              </div>
            </div>
          </div>

          {/* Login box */}
          <div id="login-box" style={{ display: 'flex', justifyContent: 'center' }} className="antigravity-float">
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const usernameInput = e.target.username.value;
                const passwordInput = e.target.password.value;
                if (!usernameInput || !passwordInput) return;

                // 1. Attempt backend server login first
                if (!window.useLocalDbFallback) {
                  try {
                    const res = await fetch('/api/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: usernameInput, password: passwordInput })
                    });
                    const contentType = res.headers.get('content-type');
                    if (res.ok && contentType && contentType.includes('application/json')) {
                      const data = await res.json();
                      if (data.success) {
                        localStorage.setItem('aos_logged_in_user', data.username);
                        setCurrentUser(data.username);
                        return;
                      } else {
                        alert(data.error || 'Login failed');
                        return;
                      }
                    } else {
                      console.warn('API returned non-JSON response. Switching to local storage DB emulator.');
                      window.useLocalDbFallback = true;
                    }
                  } catch (err) {
                    console.warn('Network error, switching to local storage DB emulator.', err);
                    window.useLocalDbFallback = true;
                  }
                }

                // 2. Client-side local DB fallback
                const res = await localDbAPI.login(usernameInput, passwordInput);
                if (res.success) {
                  localStorage.setItem('aos_logged_in_user', res.username);
                  setCurrentUser(res.username);
                } else {
                  alert(res.error || 'Login failed');
                }
              }}
              className="glow-card" 
              style={{ 
                padding: '40px', 
                width: '100%', 
                maxWidth: '420px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                background: 'var(--bg-sidebar)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <img
                  src="/aosai-logo.png"
                  alt="AosAI"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    boxShadow: '0 0 24px rgba(139,92,246,0.5)',
                    marginBottom: '14px'
                  }}
                />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }} className="text-gradient">Access Agent Workspace</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Secure Developer & SWARM Gateway</p>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>USER IDENTIFIER</label>
                <input 
                  name="username"
                  type="text" 
                  placeholder="Enter username"
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>ACCESS PASSCODE</label>
                <input 
                  name="password"
                  type="password" 
                  placeholder="Enter password"
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
                <p style={{ margin: '6px 0 0', fontSize: '10px', color: 'var(--text-dark)' }}>* New users will be auto-registered with the password supplied.</p>
              </div>

              <button type="submit" className="btn-cyber-submit" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}>
                <Zap size={16} fill="white" /> Access Agent Workspace
              </button>
            </form>
          </div>
        </div>

        {/* Features Showcase Section */}
        <section id="features-showcase" style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0' }}>Comprehensive Multi-Agent Suite</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
              Explore the advanced suite of autonomous modules integrated right out of the box to power your development, analysis, and execution tasks.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(139,92,246,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="var(--primary)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>1. Agent Workspace</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Live dialog with customizable AI agents. Configure LLM providers, model properties, system parameters, and track real-time agent output tokens.
              </p>
            </div>

            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(6,182,212,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code size={18} color="var(--secondary)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>2. Coding Sandbox</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Full interactive browser compilation playground. Create/edit file trees, run unit tests, compile local app templates, and view terminal logs.
              </p>
            </div>

            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(236,72,153,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart size={18} color="var(--accent)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>3. Data Analytics</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Upload datasets (CSV, Excel), view tabular records, persistence directories, and rendering comparative charts (Line, Bar, Doughnut).
              </p>
            </div>

            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={18} color="var(--success)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>4. Agent Swarm</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Visual multi-agent delegation sequence. Run Orchestrator, DevOps, Planner, Coder, and Reviewer loops in synchrony with live console pulses.
              </p>
            </div>

            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={18} color="var(--warning)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>5. LLM Credentials Portal</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Secure localized client database to input, test, and save provider API keys for live model execution pipelines (Gemini/OpenAI).
              </p>
            </div>

            <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="var(--error)" />
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', color: 'white' }}>6. Session Audit Logs</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Persistent authorization logs tracking session start times, login counts, and user directories synced to local Express database.
              </p>
            </div>
          </div>
        </section>

        {/* System Workflow Section */}
        <section id="system-workflow" style={{
          padding: '80px 24px',
          background: 'rgba(14, 17, 26, 0.4)',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0' }}>How AosAI Coordinates Work</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
                From credential linking to sandbox code compiler execution, here is how the agent ecosystem synchronizes tasks.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              justifyContent: 'center'
            }}>
              <div className="glow-card" style={{ padding: '24px', flex: '1 1 250px', maxWidth: '280px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>01</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'white' }}>Link Credentials</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Input OpenAI/Gemini API keys locally or use default fallback simulator templates.</p>
              </div>

              <div className="glow-card" style={{ padding: '24px', flex: '1 1 250px', maxWidth: '280px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '12px' }}>02</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'white' }}>Select Agent Core</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Configure Devon-X, Analyst, or Swarm model settings to define task targets.</p>
              </div>

              <div className="glow-card" style={{ padding: '24px', flex: '1 1 250px', maxWidth: '280px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)', marginBottom: '12px' }}>03</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'white' }}>Sandbox Compile</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Run agent operations inside the safe sandbox virtual file editor tree environment.</p>
              </div>

              <div className="glow-card" style={{ padding: '24px', flex: '1 1 250px', maxWidth: '280px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)', marginBottom: '12px' }}>04</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'white' }}>Sync & Sync DB</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Auto-persist chat dialogues and audit compilation records back to Express server.</p>
              </div>
            </div>
          </div>
        </section>
        {/* AI Integration Models Section */}
        <section id="ai-models-section" style={{
          padding: '80px 24px',
          background: 'var(--bg-main)',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0' }}>AI Models & Frameworks Integration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
                Seamlessly interact with cutting-edge Large Language Models natively embedded into our suite for maximum performance.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,112,243,0.1)', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={28} color="var(--primary)" />
                </div>
                <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Gemini 2.5 Flash / Pro</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Experience highly efficient multi-modal inference and reasoning. Optimized for massive context windows and real-time outputs.</p>
              </div>
              <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(121,40,202,0.1)', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={28} color="var(--secondary)" />
                </div>
                <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>GPT-4 Omni Ecosystem</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Connect your OpenAI API keys for top-tier complex algorithmic tasks, code generation, and deep semantic data evaluation.</p>
              </div>
              <div className="glow-card" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,0,128,0.1)', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={28} color="var(--accent)" />
                </div>
                <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Swarm AI Orchestration</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Deploy hierarchical AI agent networks where agents communicate dynamically to achieve complex goals effectively.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section on Home Page */}
        <div id="pricing-section" style={{
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(14, 17, 26, 0.4)',
          position: 'relative',
          zIndex: 10
        }}>
          {renderPricingPage(false)}
        </div>
        
        {/* Payment Partners */}
        <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-dark)', fontSize: '14px', marginBottom: '16px', fontWeight: 'bold' }}>SECURE PAYMENTS POWERED BY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3395FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Shield size={24} /> Razorpay
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#635BFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Zap size={24} /> Stripe
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#003087', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Globe size={24} /> PayPal
            </div>
          </div>
        </div>
        </>)}

        {/* New Pages Content */}
        {landingPage === 'login' && (
          <div className="reveal-scale" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: '40px 24px' }}>
            <div id="login-box-standalone" className="glow-card" style={{ padding: '50px 40px', maxWidth: '420px', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--bg-main)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
                  <User size={32} color="var(--primary)" />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '28px', color: 'white', fontWeight: '800' }}>Welcome Back</h3>
                <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>Enter your workspace identifier to continue</p>
              </div>
              
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const usernameInput = e.target.username.value;
                  const passwordInput = e.target.password.value;
                  if (!usernameInput || !passwordInput) return;

                  // 1. Attempt backend server login first
                  if (!window.useLocalDbFallback) {
                    try {
                      const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: usernameInput, password: passwordInput })
                      });
                      const contentType = res.headers.get('content-type');
                      if (res.ok && contentType && contentType.includes('application/json')) {
                        const data = await res.json();
                        if (data.success) {
                          localStorage.setItem('aos_logged_in_user', data.username);
                          setCurrentUser(data.username);
                          return;
                        } else {
                          alert(data.error || 'Login failed');
                          return;
                        }
                      } else {
                        console.warn('API returned non-JSON response. Switching to local storage DB emulator.');
                        window.useLocalDbFallback = true;
                      }
                    } catch (err) {
                      console.warn('Network error, switching to local storage DB emulator.', err);
                      window.useLocalDbFallback = true;
                    }
                  }

                  // 2. Client-side local DB fallback
                  const res = await localDbAPI.login(usernameInput, passwordInput);
                  if (res.success) {
                    localStorage.setItem('aos_logged_in_user', res.username);
                    setCurrentUser(res.username);
                  } else {
                    alert('Login Failed: ' + res.error);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Username / Access Key</label>
                  <input type="text" name="username" className="input-field" placeholder="e.g. admin or devteam" required style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Password / Session Token</label>
                  <input type="password" name="password" className="input-field" placeholder="Enter password" required style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Authenticate Session <ChevronRight size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {landingPage === 'about' && (
          <div className="reveal-scale" style={{ padding: '120px 24px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '24px', fontWeight: '800' }}>About AosAI</h2>
            <div className="glow-card reveal-left" style={{ padding: '40px', marginTop: '40px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'white' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
                At AosAI, we envision a future where complex development workflows are seamlessly augmented by autonomous intelligence. We are an innovative AI research and deployment company dedicated to empowering developers, analysts, and enterprises with state-of-the-art multi-agent systems.
              </p>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'white' }}>What We Do</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.8' }}>
                Our core platform, the Agent Hub, democratizes advanced AI workflows by integrating top-tier LLMs (like Gemini Pro and GPT-4 Omni) directly into a unified ecosystem. Whether it's the Devon-X Coder debugging production code, AlphaCap analyzing market datasets, or SwarmCore orchestrating entire microservice deployments, we build the infrastructure that turns natural language into executed reality.
              </p>
            </div>
          </div>
        )}
        {landingPage === 'solutions' && (
          <div className="reveal" style={{ padding: '120px 24px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '40px', fontWeight: '800' }}>AI Solutions & Use Cases</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="glow-card reveal-left" style={{ padding: '30px' }}>
                <div style={{ background: 'rgba(139,92,246,0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <RefreshCw size={24} color="var(--primary)" />
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '20px' }}>Enterprise Automation</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Automate internal data pipelines, market research, and customer support with SwarmCore. Connect your CRM and databases directly to our autonomous agents.</p>
              </div>
              <div className="glow-card reveal-scale" style={{ padding: '30px' }}>
                <div style={{ background: 'rgba(217,70,239,0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Code size={24} color="var(--secondary)" />
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '20px' }}>Code Generation</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Accelerate development cycles using Devon-X. Give it a feature request, and it will architect, code, test, and debug the entire implementation inside our secure sandbox.</p>
              </div>
              <div className="glow-card reveal-right" style={{ padding: '30px' }}>
                <div style={{ background: 'rgba(14,165,233,0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <LineChart size={24} color="var(--accent)" />
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '20px' }}>Data Analytics</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Generate graphical reports and extract insights from complex CSV/Excel datasets automatically using the AlphaCap analyst agent.</p>
              </div>
            </div>
          </div>
        )}
        {landingPage === 'enterprise' && (
          <div className="reveal-scale" style={{ padding: '120px 24px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '24px', fontWeight: '800' }}>Enterprise Partnerships</h2>
            <div className="glow-card reveal" style={{ padding: '40px', marginTop: '30px', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'white' }}>Scale with Confidence</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.8', marginBottom: '20px' }}>
                Deploy AosAI on your private cloud infrastructure (AWS, Azure, GCP) or on-premise. We offer SOC2 compliant environments, SSO integration (SAML/OIDC), and RBAC capabilities out of the box.
              </p>
              <ul style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '2', paddingLeft: '20px', marginBottom: '30px' }}>
                <li>Dedicated Account Management & SLA Guarantees (99.99% Uptime)</li>
                <li>Custom LLM Fine-Tuning on your proprietary codebase</li>
                <li>Advanced Swarm Orchestration limits and dedicated compute nodes</li>
                <li>Comprehensive audit logs and telemetry data export</li>
              </ul>
              <button className="btn-cyber-submit" style={{ padding: '16px 32px', fontSize: '16px' }}>Contact Enterprise Sales</button>
            </div>
          </div>
        )}
        {landingPage === 'api' && (
          <div className="reveal-scale" style={{ padding: '120px 24px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '800' }}>API Documentation</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '18px' }}>Integrate AosAI programmatically via our REST endpoints.</p>
            
            <div className="glow-card reveal-left" style={{ padding: '30px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>POST</span>
                <code style={{ fontSize: '16px', color: 'white' }}>/v1/agents/swarm/execute</code>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Initiate a multi-agent workflow programmatically. Returns a streaming response by default.</p>
              
              <h4 style={{ color: 'white', marginBottom: '12px' }}>Request Body</h4>
              <pre className="code-block" style={{ color: '#e2e8f0', background: '#03050a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
{`{
  "agent": "devon-x",
  "prompt": "Build a React navbar component with responsive hamburger menu.",
  "stream": true,
  "temperature": 0.4,
  "max_tokens": 2048
}`}
              </pre>
            </div>
            
            <div className="glow-card reveal-right" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ background: '#0ea5e9', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>GET</span>
                <code style={{ fontSize: '16px', color: 'white' }}>/v1/workspaces/status</code>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Check the status of an active sandbox compilation.</p>
            </div>
          </div>
        )}
        {landingPage === 'pricing' && (
          <div className="reveal-scale" style={{ padding: '80px 0', minHeight: '60vh' }}>
            {renderPricingPage(false)}
          </div>
        )}
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '60px 24px 40px',
          background: 'var(--bg-sidebar)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <img src="/aosai-logo.png" alt="AosAI" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }} className="text-gradient">AosAI</h3>
              </div>
              <p style={{ color: 'var(--text-dark)', fontSize: '13px', lineHeight: '1.6' }}>Building the future of autonomous multi-agent developer workflows.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>Product</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('home'); document.getElementById('features-showcase')?.scrollIntoView(); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Features</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('solutions'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Solutions</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('enterprise'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Enterprise</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('home'); document.getElementById('pricing-section')?.scrollIntoView(); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Pricing</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>Company</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('about'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>About Us</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Careers</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Blog</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Contact</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>Legal</h4>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setLandingPage('api'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>API Docs</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-dark)', fontSize: '12px', margin: 0 }}>© 2026 AosAI Platform Hub. All rights reserved. Powered by Devon-X Autonomous Systems.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(prev => !prev)} aria-label="Toggle Navigation">
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/aosai-logo.png"
            alt="AosAI"
            style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', boxShadow: '0 0 8px rgba(139,92,246,0.4)' }}
          />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }} className="text-gradient">AosAI</h2>
        </div>
        <div style={{ width: '20px' }} />
      </header>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* ==========================================
          LEFT SIDEBAR (Global Controls)
          ========================================== */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        
        {/* Branding Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/aosai-logo.png"
              alt="AosAI"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 0 16px rgba(139,92,246,0.55)',
                flexShrink: 0
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">AosAI</h2>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>User: <span style={{ color: 'var(--secondary)' }}>{currentUser}</span></p>
            </div>
          </div>
        </div>

        {/* Global LLM Provider Banner */}
        <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Key size={12} color={apiProvider === 'fallback' ? 'var(--warning)' : 'var(--success)'} />
            <span>Active Engine: </span>
            <strong style={{ color: 'white', textTransform: 'uppercase' }}>{apiProvider}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ padding: '16px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => setActiveTab('user-dashboard')} style={navBtnStyle(activeTab === 'user-dashboard')}>
            <Activity size={16} />
            <span>My Dashboard</span>
          </button>

          <button onClick={() => setActiveTab('workspace')} style={navBtnStyle(activeTab === 'workspace')}>
            <Bot size={16} />
            <span>Agent Workspace</span>
          </button>
          
          <button onClick={() => setActiveTab('sandbox')} style={navBtnStyle(activeTab === 'sandbox')}>
            <Code size={16} />
            <span>Coding Sandbox</span>
          </button>
          
          <button onClick={() => setActiveTab('analyst')} style={navBtnStyle(activeTab === 'analyst')}>
            <LineChart size={16} />
            <span>Data Analytics</span>
          </button>

          <button onClick={() => setActiveTab('swarm')} style={navBtnStyle(activeTab === 'swarm')}>
            <RefreshCw size={16} className={isSwarmRunning ? 'spin-slow' : ''} style={isSwarmRunning ? { animation: 'spin-slow 6s linear infinite' } : {}} />
            <span>Agent Swarm</span>
          </button>

          <button onClick={() => setActiveTab('pricing')} style={navBtnStyle(activeTab === 'pricing')}>
            <Zap size={16} />
            <span>Pricing Plans</span>
          </button>

          <button onClick={() => setActiveTab('billing')} style={navBtnStyle(activeTab === 'billing')}>
            <FileText size={16} />
            <span>Billing & Invoices</span>
          </button>

          <button onClick={() => setActiveTab('marketplace')} style={navBtnStyle(activeTab === 'marketplace')}>
            <Settings size={16} />
            <span>LLM Credentials</span>
          </button>

          {currentUser.toLowerCase() === 'admin' && (
            <button onClick={() => setActiveTab('users')} style={navBtnStyle(activeTab === 'users')}>
              <User size={16} />
              <span>Login History</span>
            </button>
          )}


        </nav>

        {/* System Monitoring Pulse */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(0,0,0,0.15)',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Cpu size={12} color="var(--primary)" /> Sandbox CPU
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{cpuUsage}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${cpuUsage}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s ease' }} />
          </div>
        </div>
      </aside>

      <main className="main-viewport">
        {/* Global User Header */}
        <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', flexShrink: 0, position: 'relative' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentUser || 'Guest'}</span>
            <ChevronDown size={14} style={{ marginLeft: '4px', transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '64px',
              right: '32px',
              width: '200px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => {
                  setActiveTab('profile');
                  setIsProfileDropdownOpen(false);
                }}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '14px' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} /> My Profile
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('aos_logged_in_user');
                  setCurrentUser('');
                  setIsProfileDropdownOpen(false);
                }} 
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
        
        {/* Content Tabs Render */}
        <div style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          
          {/* TAB 1: WORKSPACE / AGENT CHAT */}
          {activeTab === 'workspace' && (
            <div className="workspace-layout animate-fade">
              
              {/* Agent interaction chat panel */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--border-color)' }}>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{selectedAgent.avatar}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{selectedAgent.name}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{selectedAgent.role} • <span style={{ color: 'var(--secondary)' }}>{apiProvider.toUpperCase()} Mode</span></p>
                    </div>
                  </div>
                </div>

                {/* Messages scroll content */}
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {chats[selectedAgent.id]?.map((msg, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {msg.monologue && (
                        <details style={{ width: '100%', marginBottom: '6px' }} open>
                          <summary style={{
                            fontSize: '11px', 
                            color: 'var(--secondary)', 
                            cursor: 'pointer', 
                            padding: '4px 8px', 
                            background: 'rgba(6, 182, 212, 0.05)',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Cpu size={10} /> Thought Monologue
                          </summary>
                          <div className="agent-monologue" style={{ marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            {msg.monologue}
                          </div>
                        </details>
                      )}
                      
                      <div className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-agent'}`}>
                        <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '11px', opacity: 0.6 }}>
                          {msg.sender === 'user' ? 'You' : selectedAgent.name} • {msg.timestamp}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Form Input */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={`Message ${selectedAgent.name}...`}
                      className="input-field"
                      style={{ flexGrow: 1 }}
                    />
                    <button type="submit" className="btn-primary">
                      <Send size={15} /> Send
                    </button>
                  </form>
                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-dark)' }}>
                    To enable live LLM replies, configure API keys in a local .env or the Credentials tab.
                  </p>
                </div>
              </div>

              {/* Sidebar Agent Selector */}
              <div className="agents-sidebar-panel">
                <div style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>ACTIVE AGENTS</span>
                  <button 
                    onClick={() => setIsCreatorOpen(true)}
                    className="btn-primary" 
                    style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                  >
                    <Plus size={12} /> Create Agent
                  </button>
                </div>

                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flexGrow: 1 }}>
                  {agents.map(a => {
                    const isSystem = DEFAULT_AGENTS.some(sys => sys.id === a.id);
                    return (
                      <div 
                        key={a.id}
                        onClick={() => setSelectedAgentId(a.id)}
                        className={`glow-card ${selectedAgentId === a.id ? 'glow-card-active' : ''}`}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          position: 'relative',
                          background: selectedAgentId === a.id ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: selectedAgentId === a.id ? '1px solid var(--primary)' : '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '20px' }}>{a.avatar}</span>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</h4>
                            <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: 'bold' }}>{a.role}</span>
                          </div>
                          {!isSystem && (
                            <button 
                              onClick={(e) => handleDeleteAgent(a.id, e)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '2px' }}
                              title="Delete Agent"
                            >
                              <Trash size={12} />
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                          {a.description.slice(0, 60)}...
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="sandbox-layout animate-fade">
              <div className="sandbox-files-panel">
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                  <Folder size={14} color="var(--primary)" />
                  <span>WORKSPACE FILES</span>
                </div>
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1 }}>
                  {sandboxFiles.map(file => (
                    <button 
                      key={file.name}
                      onClick={() => {
                        setActiveFileName(file.name);
                        setSandboxView('editor');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        background: activeFileName === file.name && sandboxView === 'editor' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        border: 'none',
                        color: activeFileName === file.name && sandboxView === 'editor' ? 'white' : 'var(--text-muted)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <FileCode size={14} color={file.name.endsWith('.html') ? '#e34f26' : file.name.endsWith('.css') ? '#1572b6' : '#f0db4f'} />
                      <span>{file.name}</span>
                    </button>
                  ))}
                  
                  <div style={{ margin: '16px 8px 4px', fontSize: '11px', color: 'var(--text-dark)', fontWeight: 'bold' }}>SANDBOX VIEW</div>
                  <button
                    onClick={() => setSandboxView('preview')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      background: sandboxView === 'preview' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                      border: 'none',
                      color: sandboxView === 'preview' ? 'white' : 'var(--text-muted)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    <Eye size={14} color="var(--secondary)" />
                    <span>Run Preview</span>
                  </button>

                  {sandboxHistory.length > 0 && (
                    <>
                      <div style={{ margin: '20px 8px 4px', fontSize: '11px', color: 'var(--text-dark)', fontWeight: 'bold', textTransform: 'uppercase' }}>PROMPT HISTORY</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', padding: '0 4px' }}>
                        {sandboxHistory.slice(0, 5).map((entry, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSandboxPrompt(entry.prompt)}
                            style={{
                              textAlign: 'left',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '6px 8px',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s'
                            }}
                            title={entry.prompt}
                          >
                            🕒 {entry.prompt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="sandbox-editor-panel">
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d14' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--secondary)' }}>
                    {sandboxView === 'editor' ? `Editing: src/${activeFile.name}` : 'Sandbox Live Output'}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setSandboxView(sandboxView === 'editor' ? 'preview' : 'editor')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {sandboxView === 'editor' ? <Eye size={14} /> : <Code size={14} />}
                      <span>{sandboxView === 'editor' ? 'Show Live Preview' : 'Show Code Editor'}</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSandboxLogs(prev => [...prev, { type: 'system', text: 'Executing build compiler...' }]);
                        setSandboxView('preview');
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Play size={12} fill="white" /> Run Sandbox
                    </button>
                  </div>
                </div>

                <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                  {sandboxView === 'editor' ? (
                    <div style={{ display: 'flex', height: '100%', fontFamily: 'var(--font-mono)' }}>
                      <div style={{
                        padding: '16px 8px',
                        background: '#04060b',
                        color: 'var(--text-dark)',
                        textAlign: 'right',
                        userSelect: 'none',
                        fontSize: '13px',
                        lineHeight: '20px',
                        borderRight: '1px solid rgba(255,255,255,0.03)',
                        width: '40px'
                      }}>
                        {activeFile.content.split('\n').map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      
                      <textarea
                        value={activeFile.content}
                        onChange={(e) => {
                          const updatedContent = e.target.value;
                          setSandboxFiles(prev => prev.map(f => f.name === activeFile.name ? { ...f, content: updatedContent } : f));
                        }}
                        style={{
                          flexGrow: 1,
                          height: '100%',
                          background: 'transparent',
                          color: '#e2e8f0',
                          border: 'none',
                          padding: '16px',
                          fontFamily: 'inherit',
                          fontSize: '13px',
                          lineHeight: '20px',
                          resize: 'none',
                          outline: 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      title="Sandbox Frame"
                      style={{ width: '100%', height: '100%', border: 'none', background: '#020617' }}
                    />
                  )}

                  {isCodingInProgress && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(5, 7, 12, 0.9)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}>
                      <div style={{ width: '300px', textAlign: 'center' }}>
                        <Bot size={40} className="spin-slow" style={{ animation: 'spin-slow 4s linear infinite', color: 'var(--primary)', marginBottom: '12px' }} />
                        <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Devon-X Coding compilation...</h4>
                        <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{codingStepDescription}</p>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${codingProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ height: '140px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: '#020407' }}>
                  <div style={{ padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>SANDBOX TERMINAL OUTPUT</span>
                    <button onClick={() => setSandboxLogs([])} style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}>Clear</button>
                  </div>
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {sandboxLogs.map((log, index) => (
                      <div key={index} style={{ color: log.type === 'error' ? 'var(--error)' : 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-dark)', marginRight: '8px' }}>&gt;</span>
                        {log.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#06090e' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text"
                      value={sandboxPrompt}
                      onChange={(e) => setSandboxPrompt(e.target.value)}
                      placeholder="Prompt Devon-X agent to modify the app code (e.g. 'Build a scientific calculator' or 'Write a weather application')"
                      className="input-field"
                      style={{ flexGrow: 1 }}
                      disabled={isCodingInProgress}
                    />
                    <button 
                      onClick={handleGenerateCode}
                      className="btn-primary"
                      disabled={isCodingInProgress || !sandboxPrompt.trim()}
                    >
                      <Sparkles size={14} /> Write Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA ANALYST */}
          {activeTab === 'analyst' && (
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }} className="animate-fade">
              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

              {/* ── LEFT SIDEBAR: Dataset Library ── */}
              <div style={{ width: '260px', minWidth: '220px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: '12px', overflowY: 'auto' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px' }} className="text-gradient">Data Analytics</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>User: <span style={{ color: 'var(--secondary)' }}>{currentUser}</span></p>
                </div>

                {/* Upload / New buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ flex: 1, fontSize: '11px', padding: '8px 6px', justifyContent: 'center', gap: '4px' }}
                    onClick={() => { setEditorDataset({ name: '', headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', '']] }); setAnalystView('editor'); setDatasetEditorMode('manual'); }}>
                    <Plus size={12} /> New
                  </button>
                  <button className="btn-secondary" style={{ flex: 1, fontSize: '11px', padding: '8px 6px', justifyContent: 'center', gap: '4px' }}
                    disabled={isUploadParsing} onClick={() => fileInputRef.current?.click()}>
                    {isUploadParsing ? <RefreshCw size={12} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Download size={12} />}
                    Upload
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dark)' }}>Supports .xlsx, .csv, .pdf</p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>MY DATASETS ({userDatasets.length})</p>
                  {userDatasets.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-dark)', lineHeight: '1.5' }}>No datasets yet. Upload a file or create one manually.</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {userDatasets.map(ds => (
                      <div key={ds.name} onClick={() => { setActiveDatasetName(ds.name); setAnalystView('list'); }}
                        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${activeDatasetName === ds.name ? 'rgba(139,92,246,0.5)' : 'var(--border-color)'}`, background: activeDatasetName === ds.name ? 'rgba(139,92,246,0.08)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ds.name}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dark)' }}>{ds.rows?.length} rows · {ds.headers?.length} cols</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDataset(ds.name); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── MAIN AREA ── */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>

                {/* LIST VIEW: show selected dataset + analysis trigger */}
                {analystView === 'list' && (
                  <div>
                    {!activeDatasetName ? (
                      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <Database size={48} color="var(--text-dark)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: 'var(--text-muted)' }}>Select or create a dataset to begin</h3>
                        <p style={{ color: 'var(--text-dark)', fontSize: '13px' }}>Upload an Excel/CSV/PDF file or manually enter data in the table editor.</p>
                      </div>
                    ) : (() => {
                      const ds = userDatasets.find(d => d.name === activeDatasetName);
                      if (!ds) return null;
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <h2 style={{ margin: 0, fontSize: '18px' }}>{ds.name}</h2>
                              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-dark)' }}>{ds.rows.length} rows · {ds.headers.length} columns · Updated {ds.updatedAt}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn-secondary" style={{ fontSize: '12px' }} onClick={handleExportCSV}><Download size={13} /> Export CSV</button>
                              <button className="btn-secondary" style={{ fontSize: '12px' }}
                                onClick={() => { setEditorDataset({ name: ds.name, headers: [...ds.headers], rows: ds.rows.map(r => [...r]) }); setAnalystView('editor'); }}>
                                <Code size={13} /> Edit Data
                              </button>
                            </div>
                          </div>

                          {/* Data table preview */}
                          <div className="glow-card" style={{ padding: '16px', marginBottom: '20px', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '400px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  {ds.headers.map((h, i) => <th key={i} style={{ padding: '8px 12px', color: 'var(--text-muted)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {ds.rows.slice(0, 20).map((row, ri) => (
                                  <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    {row.map((cell, ci) => <td key={ci} style={{ padding: '7px 12px', color: ci === 0 ? 'white' : 'var(--text-muted)' }}>{cell}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {ds.rows.length > 20 && <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-dark)' }}>Showing 20 of {ds.rows.length} rows.</p>}
                          </div>

                          {/* AI Analysis Panel */}
                          <div className="glow-card" style={{ padding: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={14} color="var(--primary)" /> AI Analysis</h4>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                              <input type="text" className="input-field" style={{ flexGrow: 1 }}
                                value={aiAnalystPrompt} onChange={e => setAiAnalystPrompt(e.target.value)}
                                placeholder="Ask the AI anything about this data (e.g. 'Show revenue trend', 'Find top performers')" />
                              <button className="btn-primary" onClick={handleAiAnalyzeDataset} disabled={isAnalyzing}>
                                {isAnalyzing ? <RefreshCw size={14} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <LineChart size={14} />}
                                Analyze
                              </button>
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dark)' }}>
                              {apiProvider === 'fallback' ? '⚠ Using template mode. Configure Gemini/OpenAI in Credentials for live AI insights.' : `✓ Using ${apiProvider.toUpperCase()} for live AI analysis.`}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* EDITOR VIEW: manual table entry */}
                {analystView === 'editor' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <h2 style={{ margin: 0, fontSize: '18px' }}>{editorDataset.name || 'New Dataset'}</h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ fontSize: '12px' }} onClick={() => setAnalystView('list')}><X size={13} /> Cancel</button>
                        <button className="btn-primary" style={{ fontSize: '12px' }} onClick={handleSaveDataset}><Check size={13} /> Save Dataset</button>
                      </div>
                    </div>

                    <div className="glow-card" style={{ padding: '20px', marginBottom: '16px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>DATASET NAME</label>
                      <input type="text" className="input-field" style={{ width: '100%' }} placeholder="e.g. Sales Q1 2026"
                        value={editorDataset.name} onChange={e => setEditorDataset(prev => ({ ...prev, name: e.target.value }))} />
                    </div>

                    {/* Column controls */}
                    <div className="glow-card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Columns: {editorDataset.headers.length}</span>
                      <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }}
                        onClick={() => setEditorDataset(prev => ({ ...prev, headers: [...prev.headers, `Column ${prev.headers.length + 1}`], rows: prev.rows.map(r => [...r, '']) }))}>
                        <Plus size={11} /> Add Column
                      </button>
                      <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px' }}
                        onClick={() => setEditorDataset(prev => ({ ...prev, rows: [...prev.rows, Array(prev.headers.length).fill('')] }))}>
                        <Plus size={11} /> Add Row
                      </button>
                      {editorDataset.headers.length > 1 && (
                        <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--error)' }}
                          onClick={() => setEditorDataset(prev => ({ ...prev, headers: prev.headers.slice(0, -1), rows: prev.rows.map(r => r.slice(0, -1)) }))}>
                          <Trash size={11} /> Remove Last Col
                        </button>
                      )}
                    </div>

                    {/* Editable table */}
                    <div className="glow-card" style={{ padding: '16px', overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', fontSize: '12px', width: '100%', minWidth: `${editorDataset.headers.length * 140}px` }}>
                        <thead>
                          <tr>
                            {editorDataset.headers.map((h, ci) => (
                              <th key={ci} style={{ padding: '4px', borderBottom: '1px solid var(--border-color)' }}>
                                <input type="text" value={h} onChange={e => setEditorDataset(prev => { const headers = [...prev.headers]; headers[ci] = e.target.value; return { ...prev, headers }; })}
                                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '4px', color: 'var(--primary)', padding: '5px 8px', width: '100%', fontWeight: '700', fontSize: '12px' }} />
                              </th>
                            ))}
                            <th style={{ width: '32px' }} />
                          </tr>
                        </thead>
                        <tbody>
                          {editorDataset.rows.map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              {row.map((cell, ci) => (
                                <td key={ci} style={{ padding: '3px' }}>
                                  <input type="text" value={cell} onChange={e => setEditorDataset(prev => { const rows = prev.rows.map(r => [...r]); rows[ri][ci] = e.target.value; return { ...prev, rows }; })}
                                    style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '4px', color: 'white', padding: '5px 8px', width: '100%', fontSize: '12px', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'} />
                                </td>
                              ))}
                              <td style={{ padding: '3px' }}>
                                <button onClick={() => setEditorDataset(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== ri) }))}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', padding: '4px' }}>
                                  <X size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ANALYSIS VIEW: AI output */}
                {analystView === 'analysis' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, fontSize: '18px' }}>AI Analysis: {activeDatasetName}</h2>
                      <button className="btn-secondary" style={{ fontSize: '12px' }} onClick={() => setAnalystView('list')}><X size={13} /> Back to Data</button>
                    </div>

                    {isAnalyzing ? (
                      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <RefreshCw size={40} color="var(--primary)" style={{ animation: 'spin-slow 1s linear infinite', marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>AlphaCap is analyzing your data…</p>
                      </div>
                    ) : analysisResult && (
                      <div>
                        {/* Chart */}
                        <div className="glow-card" style={{ padding: '24px', marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 20px', fontSize: '14px' }}>Data Visualization</h4>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button onClick={() => setAnalystChartType('line')} className={`btn-secondary ${analystChartType === 'line' ? 'glow-card-active' : ''}`} style={{ fontSize: '12px', padding: '6px 12px' }}>Line Plot</button>
                            <button onClick={() => setAnalystChartType('bar')} className={`btn-secondary ${analystChartType === 'bar' ? 'glow-card-active' : ''}`} style={{ fontSize: '12px', padding: '6px 12px' }}>Bar Graph</button>
                          </div>
                          <svg viewBox="0 0 520 200" style={{ width: '100%', height: '220px', overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 40} x2="520" y2={i * 40} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                            {analystChartType === 'line' ? (
                              <>
                                <path d={`M ${analysisResult.chartData.map((v, i) => { const mx = Math.max(...analysisResult.chartData) || 1; return `${(i/(analysisResult.chartData.length-1||1))*500+10},${180-(v/mx)*150}`; }).join(' L ')}`}
                                  fill="none" stroke="var(--secondary)" strokeWidth="2.5" />
                                {analysisResult.chartData.map((v, i) => { const mx = Math.max(...analysisResult.chartData) || 1; const x = (i/(analysisResult.chartData.length-1||1))*500+10; const y = 180-(v/mx)*150; return <circle key={i} cx={x} cy={y} r="5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />; })}
                              </>
                            ) : (
                              analysisResult.chartData.map((v, i) => {
                                const mx = Math.max(...analysisResult.chartData) || 1;
                                const bw = Math.min(40, 480/analysisResult.chartData.length - 6);
                                const x = 10 + (i * (480/analysisResult.chartData.length)) + (480/analysisResult.chartData.length - bw)/2;
                                const h = (v/mx)*150;
                                return <rect key={i} x={x} y={180-h} width={bw} height={h} rx="3" fill="url(#barGrad)" />;
                              })
                            )}
                            <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--secondary)" /></linearGradient></defs>
                          </svg>
                        </div>

                        {/* Insights */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="glow-card" style={{ padding: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} color="var(--primary)" /> AI Summary</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7' }}>{analysisResult.summary}</p>
                          </div>
                          <div className="glow-card" style={{ padding: '20px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>Key Insights</h4>
                            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {analysisResult.insights.map((ins, i) => (
                                <li key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{ins}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Re-analyze */}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                          <input type="text" className="input-field" style={{ flexGrow: 1 }}
                            value={aiAnalystPrompt} onChange={e => setAiAnalystPrompt(e.target.value)}
                            placeholder="Ask a follow-up question about the data…" />
                          <button className="btn-primary" onClick={handleAiAnalyzeDataset} disabled={isAnalyzing}>
                            <Sparkles size={14} /> Re-Analyze
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SWARM */}
          {activeTab === 'swarm' && (
            <div className="swarm-layout animate-fade">
              <div className="swarm-sidebar">
                <h3 style={{ margin: '0 0 8px', fontSize: '15px' }} className="text-gradient">Multi-Agent Swarm</h3>
                <textarea 
                  value={swarmPrompt}
                  onChange={(e) => setSwarmPrompt(e.target.value)}
                  style={{ width: '100%', height: '110px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}
                  disabled={isSwarmRunning}
                />
                <button onClick={handleDispatchSwarm} className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }} disabled={isSwarmRunning}>
                  <span>Dispatch Swarm</span>
                </button>
              </div>

              <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto' }}>
                <div className="glow-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <div className="swarm-flow">
                    <div style={nodeCardStyle(swarmStep === 1, swarmStep > 1)} className="swarm-node">👑 Orchestrator</div>
                    <ChevronRight className="swarm-arrow" />
                    <div style={nodeCardStyle(swarmStep === 2, swarmStep > 2)} className="swarm-node">📐 Architect</div>
                    <ChevronRight className="swarm-arrow" />
                    <div style={nodeCardStyle(swarmStep === 3, swarmStep > 3)} className="swarm-node">💻 Developer</div>
                    <ChevronRight className="swarm-arrow" />
                    <div style={nodeCardStyle(swarmStep === 4, swarmStep > 4)} className="swarm-node">🧪 QA Expert</div>
                    <ChevronRight className="swarm-arrow" />
                    <div style={nodeCardStyle(swarmStep === 5, swarmStep > 5)} className="swarm-node">🚀 DevOps</div>
                  </div>
                </div>

                <div className="glow-card" style={{ padding: '24px', background: '#020407' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {swarmLogs.map((log, idx) => (
                      <div key={idx} style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--secondary)' }}>
                        <strong>[{log.node}]</strong>: {log.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LLM CREDENTIALS CONFIG */}
          {activeTab === 'marketplace' && (
            <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }} className="animate-fade">
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>AI Model Credentials Settings</h2>
                <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>Configure connection tokens. Changes are saved instantly to the local browser context.</p>

                <div className="glow-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>LLM ENGINE PROVIDER</label>
                    <select 
                      value={apiProvider}
                      onChange={(e) => setApiProvider(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px' }}
                    >
                      <option value="fallback">Local Template Engine (No API Key Required)</option>
                      <option value="gemini">Gemini API (Flash 2.5 / Pro 1.5)</option>
                      <option value="openai">OpenAI API (gpt-4o-mini / gpt-4o)</option>
                      <option value="ollama">Ollama (Local Llama 3 endpoint)</option>
                    </select>
                  </div>

                  {apiProvider !== 'fallback' && apiProvider !== 'ollama' && (
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>API KEY CREDENTIAL</label>
                      <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${apiProvider.toUpperCase()} API Key`}
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {apiProvider === 'ollama' && (
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>OLLAMA LOCAL ENDPOINT</label>
                      <input 
                        type="text"
                        value={customEndpoint}
                        onChange={(e) => setCustomEndpoint(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.15)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '4px' }}>
                      <Activity size={14} />
                      <span>Workspace Mode Status</span>
                    </div>
                    {apiProvider === 'fallback' ? (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Currently utilizing **Local Template Coder**. Typing "Todo List", "Calculator", "Weather Dashboard", or "Game" in the Sandbox will generate fully-functional working apps client-side.
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Connected to **Real LLM Pipeline**. Coding Sandbox requests will invoke **{apiProvider.toUpperCase()}** to output actual structural changes directly!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USER DIRECTORY / LOGIN HISTORY */}
          {activeTab === 'users' && currentUser.toLowerCase() === 'admin' && (
            <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }} className="animate-fade">
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>User Session & Login Directory</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Real-time login auditing and access frequency logs.</p>
                  </div>
                  <button onClick={fetchUserDirectory} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    <RefreshCw size={14} /> Refresh Directory
                  </button>
                </div>

                <div className="glow-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: 'white' }}>Audit Log ({userDirectory.length} active profiles)</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Username</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Login Count</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Last Access Time</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Authentication Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDirectory.map((usr, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '600', color: usr.username === currentUser ? 'var(--secondary)' : 'white' }}>
                            {usr.username} {usr.username === currentUser && ' (You)'}
                          </td>
                          <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '10px', color: 'var(--primary)' }}>
                              {usr.login_count} logins
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{usr.last_login}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: 'var(--success)',
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <Check size={10} /> Active Database Entry
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: 'white' }}>Total Platform Sessions</h4>
                  <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)' }} className="text-gradient">
                    {userDirectory.reduce((sum, u) => sum + (u.login_count || 0), 0)}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-dark)' }}>Aggregated logins recorded in local JSON database.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRICING PLANS */}
          {activeTab === 'pricing' && renderPricingPage(true)}
          {activeTab === 'billing' && renderBillingPage()}
          {activeTab === 'user-dashboard' && renderUserDashboard()}
          {activeTab === 'profile' && renderProfilePage()}

        </div>
      </main>

      {/* ==========================================
          MODAL: LIVE AGENT CREATOR
          ========================================== */}
      {isCreatorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,7,12,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30
        }}>
          <form 
            onSubmit={handleCreateAgent}
            className="glow-card" 
            style={{ 
              padding: '30px', 
              width: '90%', 
              maxWidth: '520px', 
              background: 'var(--bg-sidebar)', 
              border: '1px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }} className="text-gradient">Create Live AI Agent</h3>
              <button 
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Avatar Emoji</label>
                <input 
                  type="text" 
                  value={newAgentAvatar}
                  onChange={(e) => setNewAgentAvatar(e.target.value)}
                  maxLength={2}
                  className="input-field"
                  style={{ width: '100%', textAlign: 'center', fontSize: '24px', padding: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Agent Name</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. PyCoder-X"
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Professional Role</label>
              <input 
                type="text" 
                value={newAgentRole}
                onChange={(e) => setNewAgentRole(e.target.value)}
                placeholder="e.g. Python Scripting Specialist"
                className="input-field"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Short Description</label>
              <input 
                type="text" 
                value={newAgentDesc}
                onChange={(e) => setNewAgentDesc(e.target.value)}
                placeholder="e.g. Automates data operations and compiles algorithms in sandbox."
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Default Model</label>
              <select 
                value={newAgentModel} 
                onChange={(e) => setNewAgentModel(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px' }}
              >
                {availableModels.filter(m => m.status === 'Active').map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>System Prompt Instructions</label>
              <textarea 
                value={newAgentPrompt}
                onChange={(e) => setNewAgentPrompt(e.target.value)}
                placeholder="Instruct the agent on how to behave, what tone to use, and how to execute tasks..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setIsCreatorOpen(false)} 
                className="btn-secondary" 
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '8px 16px' }}
              >
                Instantiate Live Agent
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CSS STYLINGS
// ==========================================
const navBtnStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px 16px',
  background: isActive ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)' : 'transparent',
  border: 'none',
  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
  color: isActive ? 'white' : 'var(--text-muted)',
  borderRadius: '0 8px 8px 0',
  cursor: 'pointer',
  textAlign: 'left',
  fontWeight: isActive ? '600' : '500',
  fontSize: '14px',
  transition: 'all 0.2s ease'
});

const nodeCardStyle = (isActive, isCompleted) => ({
  padding: '10px 14px',
  background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
  border: isActive ? '1px solid var(--primary)' : isCompleted ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  opacity: isActive || isCompleted ? 1 : 0.4,
  fontSize: '12px',
  fontWeight: 'bold',
  transition: 'all 0.5s ease'
});

const INITIAL_SANDBOX_FILES = [
  {
    name: 'index.html',
    language: 'html',
    content: `<div class="welcome-box">
  <h1>AosAI Local Coding Sandbox</h1>
  <p>Modify files using Devon-X or pick templates.</p>
  <div style="font-size: 40px; margin: 16px 0;">💻</div>
  <p style="color: #64748b; font-size: 13px;">Currently loaded: Initial Welcome Screen</p>
</div>`
  },
  {
    name: 'styles.css',
    language: 'css',
    content: `body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #020617;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.welcome-box {
  text-align: center;
  padding: 30px;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  max-width: 400px;
}
h1 { font-size: 22px; color: #a78bfa; margin: 0 0 8px; }
p { font-size: 14px; margin: 0; color: #94a3b8; }`
  },
  {
    name: 'script.js',
    language: 'javascript',
    content: `console.log("Welcome Screen rendered successfully.");`
  }
];

const SAMPLE_DATASETS = {
  aiHardware: {
    title: 'AI Chipset Shipments & Revenue (2023 - 2026)',
    headers: ['Year/Quarter', 'NVIDIA H100 (Units K)', 'AMD MI300 (Units K)', 'Total Rev ($B)'],
    rows: [
      ['2023-Q4', '150', '20', '18.4'],
      ['2024-Q1', '180', '35', '22.0'],
      ['2024-Q2', '210', '48', '26.8'],
      ['2024-Q3', '240', '65', '31.2'],
      ['2024-Q4', '290', '90', '38.5'],
      ['2025-Q1', '330', '110', '44.2'],
      ['2025-Q2', '380', '135', '52.0'],
      ['2025-Q3', '420', '160', '59.6'],
      ['2025-Q4', '480', '190', '68.1'],
      ['2026-Q1', '530', '220', '76.4']
    ]
  },
  agentMarket: {
    title: 'Enterprise AI Agent Deployments (%)',
    headers: ['Sector', 'Customer Support', 'Software Dev', 'Data Pipeline'],
    rows: [
      ['Finance', '45%', '15%', '15%'],
      ['Healthcare', '30%', '8%', '50%'],
      ['Tech & SaaS', '20%', '42%', '20%'],
      ['E-Commerce', '55%', '12%', '13%'],
      ['Logistics', '15%', '5%', '70%']
    ]
  }
};
