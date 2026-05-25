import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Code, Terminal, LineChart, Play, RefreshCw, Settings, 
  Database, Sparkles, Cpu, Layers, Send, Plus, Trash, Eye, 
  Check, AlertCircle, Folder, FileCode, Settings2, Share2, 
  FileText, ChevronRight, Download, User, ListTodo, HelpCircle, 
  Activity, Compass, Shield, Zap, Search, AlertTriangle, 
  BookOpen, Code2, Globe, MessageSquare, Maximize2, Minimize2, Key, TerminalSquare, X, Menu
} from 'lucide-react';

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

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('workspace'); // workspace, sandbox, analyst, swarm, marketplace
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);
  
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

  // SWARM STATE
  const [swarmPrompt, setSwarmPrompt] = useState('Build a clean real-time status API routing telemetry');
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmStep, setSwarmStep] = useState(0); // 0-6
  const [swarmLogs, setSwarmLogs] = useState([]);
  
  // SYSTEM STATE
  const [cpuUsage, setCpuUsage] = useState(19);
  const [memoryUsage, setMemoryUsage] = useState(4.1);

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

    const userMsg = {
      sender: 'user',
      text: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const agentKey = selectedAgent.id;
    setChats(prev => ({
      ...prev,
      [agentKey]: [...(prev[agentKey] || []), userMsg]
    }));

    const promptText = currentInput;
    setCurrentInput('');

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

      setChats(prev => {
        const currentList = prev[agentKey].slice(0, -1);
        return {
          ...prev,
          [agentKey]: [
            ...currentList,
            {
              sender: 'agent',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              monologue: monologue
            }
          ]
        };
      });

    } catch (err) {
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
    }
  };

  const handleGenerateCode = async () => {
    if (!sandboxPrompt.trim()) return;

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

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(prev => !prev)} aria-label="Toggle Navigation">
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--primary)" />
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
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--primary-glow)'
            }}>
              <Layers size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }} className="text-gradient">AosAI</h2>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dark)', fontWeight: '600', textTransform: 'uppercase' }}>Production Agent Hub</p>
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

          <button onClick={() => setActiveTab('marketplace')} style={navBtnStyle(activeTab === 'marketplace')}>
            <Settings size={16} />
            <span>LLM Credentials</span>
          </button>
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
        
        {/* Content Tabs Render */}
        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
          
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
            <div className="analyst-layout animate-fade">
              <div className="analyst-sidebar">
                <h3 style={{ margin: '0 0 12px', fontSize: '15px' }} className="text-gradient">Data Analyst Module</h3>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>SELECT ACTIVE DATASET</label>
                  <select 
                    value={analystDataset} 
                    onChange={(e) => setAnalystDataset(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', outline: 'none' }}
                  >
                    <option value="aiHardware">AI Chip Shipments & Rev</option>
                    <option value="agentMarket">AI Agent deployments by sector</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>CHART TYPE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setAnalystChartType('line')} className={`btn-secondary ${analystChartType === 'line' ? 'glow-card-active' : ''}`} style={{ flex: 1, padding: '8px', fontSize: '12px' }}>Line Plot</button>
                    <button onClick={() => setAnalystChartType('bar')} className={`btn-secondary ${analystChartType === 'bar' ? 'glow-card-active' : ''}`} style={{ flex: 1, padding: '8px', fontSize: '12px' }}>Bar Graph</button>
                  </div>
                </div>
              </div>

              <div className="analyst-main">
                <div className="glow-card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>Dataset Matrix: {SAMPLE_DATASETS[analystDataset].title}</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        {SAMPLE_DATASETS[analystDataset].headers.map((head, idx) => (
                          <th key={idx} style={{ padding: '8px', color: 'var(--text-muted)' }}>{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_DATASETS[analystDataset].rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '8px', color: cIdx === 0 ? 'white' : 'var(--text-muted)' }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input 
                    type="text"
                    value={analystPrompt}
                    onChange={(e) => setAnalystPrompt(e.target.value)}
                    placeholder="Ask analyst agent to process the table (e.g. 'Project total 2026 revenue curve')"
                    className="input-field"
                    style={{ flexGrow: 1 }}
                    disabled={isAnalyzing}
                  />
                  <button onClick={handleRunAnalysis} className="btn-primary" disabled={isAnalyzing || !analystPrompt.trim()}>
                    {isAnalyzing ? <RefreshCw size={14} className="spin-slow" style={{ animation: 'spin-slow 3s linear infinite' }} /> : <LineChart size={14} />}
                    <span>Compile Graph</span>
                  </button>
                </div>

                <div className="analyst-grid">
                  <div className="glow-card" style={{ padding: '24px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 20px', fontSize: '14px' }}>SVG Visual Output</h4>
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', height: '220px' }}>
                      {isAnalyzing ? (
                        <div style={{ width: '100%', textAlign: 'center' }}><RefreshCw className="spin-slow" style={{ animation: 'spin-slow 2s linear infinite' }} /></div>
                      ) : (
                        <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <path 
                            d={`M ${analystOutput.chartData.map((val, idx) => {
                              const x = (idx / (analystOutput.chartData.length - 1)) * 500;
                              const y = 180 - (val / Math.max(...analystOutput.chartData)) * 140;
                              return `${x},${y}`;
                            }).join(' L ')}`}
                            fill="none"
                            stroke="var(--secondary)"
                            strokeWidth="3"
                          />
                          {analystOutput.chartData.map((val, idx) => {
                            const x = (idx / (analystOutput.chartData.length - 1)) * 500;
                            const y = 180 - (val / Math.max(...analystOutput.chartData)) * 140;
                            return <circle key={idx} cx={x} cy={y} r="5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />;
                          })}
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="glow-card" style={{ padding: '24px' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '14px' }}>AlphaCap Agent Insights</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                      {analystOutput.summary}
                    </p>
                    <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {analystOutput.insights.map((ins, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{ins}</li>)}
                    </ul>
                  </div>
                </div>
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
                <option>Gemini 2.5 Flash</option>
                <option>Gemini 2.5 Pro</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Llama 3.1 8B</option>
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
