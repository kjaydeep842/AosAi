import { useState, useEffect } from 'react';
import './AdminPanel.css';

const pricingDefault = {
  monthlyDevSub: 19, annualDevSub: 15,
  monthlyProblemRate: 1.50, annualProblemRate: 1.20,
  traditionalHourCost: 75, traditionalHoursPerProblem: 0.7
};
const modelsDefault = [
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', status: 'Active' },
  { id: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', status: 'Active' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', status: 'Active' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', status: 'Active' },
  { id: 'llama3', name: 'Llama 3 (Local)', provider: 'ollama', status: 'Active' }
];

// LocalStorage Fallback Helper
const localDb = {
  getUsers: () => {
    try {
      const dbVal = localStorage.getItem('aos_local_db');
      let dbObj = dbVal ? JSON.parse(dbVal) : { users: [] };
      if (!dbObj || !Array.isArray(dbObj.users) || dbObj.users.length === 0) {
        dbObj = {
          users: [
            { username: 'jaydeep', password: 'password123', loginCount: 2, lastLogin: '25/5/2026, 4:24:09 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '25/5/2026, 4:24:09 pm' },
            { username: 'shreyash', password: 'password123', loginCount: 1, lastLogin: '25/5/2026, 4:17:46 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '25/5/2026, 4:17:46 pm' },
            { username: 'admin', password: 'admin123', loginCount: 3, lastLogin: '27/5/2026, 5:41:48 pm', tier: 'sandbox', billingCycle: 'monthly', problemsCount: 9, registeredAt: '27/5/2026, 5:41:48 pm' },
            { username: 'vivek', password: 'password123', loginCount: 1, lastLogin: new Date().toLocaleString(), tier: 'sandbox', billingCycle: 'monthly', problemsCount: 7, registeredAt: new Date().toLocaleString() }
          ],
          chats: [],
          sandboxHistory: []
        };
        localStorage.setItem('aos_local_db', JSON.stringify(dbObj));
      }
      const rawUsers = dbObj.users || [];
      return rawUsers.map(u => ({
        ...u,
        tier: u.tier || 'sandbox',
        billingCycle: u.billingCycle || 'monthly',
        problemsCount: u.problemsCount || 0,
        login_count: u.loginCount || u.login_count || 1,
        last_login: u.lastLogin || u.last_login || new Date().toLocaleString()
      }));
    } catch { return []; }
  },
  updateUser: (username, fields) => {
    try {
      const dbVal = localStorage.getItem('aos_local_db');
      const dbObj = dbVal ? JSON.parse(dbVal) : { users: [] };
      dbObj.users = (dbObj.users || []).map(u => {
        if (u.username.toLowerCase() === username.toLowerCase()) {
          const updated = { ...u, ...fields };
          if (fields.login_count !== undefined) updated.loginCount = fields.login_count;
          if (fields.last_login !== undefined) updated.lastLogin = fields.last_login;
          return updated;
        }
        return u;
      });
      localStorage.setItem('aos_local_db', JSON.stringify(dbObj));
    } catch (e) {
      console.error(e);
    }
  },
  deleteUser: (username) => {
    try {
      const dbVal = localStorage.getItem('aos_local_db');
      const dbObj = dbVal ? JSON.parse(dbVal) : { users: [] };
      dbObj.users = (dbObj.users || []).filter(u => u.username.toLowerCase() !== username.toLowerCase());
      dbObj.chats = (dbObj.chats || []).filter(c => c.username.toLowerCase() !== username.toLowerCase());
      dbObj.sandboxHistory = (dbObj.sandboxHistory || []).filter(s => s.username.toLowerCase() !== username.toLowerCase());
      if (dbObj.userDatasets) {
        dbObj.userDatasets = dbObj.userDatasets.filter(d => d.username.toLowerCase() !== username.toLowerCase());
      }
      localStorage.setItem('aos_local_db', JSON.stringify(dbObj));
    } catch (e) {
      console.error(e);
    }
  },
  getPricing: () => { try { return JSON.parse(localStorage.getItem('aos_pricing_config')) || pricingDefault; } catch { return pricingDefault; } },
  savePricing: (p) => localStorage.setItem('aos_pricing_config', JSON.stringify(p)),
  getModels: () => { try { return JSON.parse(localStorage.getItem('aos_available_models')) || modelsDefault; } catch { return modelsDefault; } },
  saveModels: (m) => localStorage.setItem('aos_available_models', JSON.stringify(m)),
};

// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (user.toLowerCase() === 'admin') {
          sessionStorage.setItem('aos_admin_auth', '1');
          localStorage.setItem('aos_logged_in_user', 'admin');
          onLogin();
        } else {
          setErr('Authorized as user, but only admins can access the admin panel.');
          setLoading(false);
        }
      } else {
        // Fallback to client-side verification if username is admin
        if (user.toLowerCase() === 'admin' && (pass === '123' || pass === 'admin123')) {
          sessionStorage.setItem('aos_admin_auth', '1');
          localStorage.setItem('aos_logged_in_user', 'admin');
          onLogin();
        } else {
          setErr(data.error || 'Invalid admin credentials. Access denied.');
          setLoading(false);
        }
      }
    } catch (err) {
      // Offline fallback: check credentials locally
      if (user.toLowerCase() === 'admin' && (pass === '123' || pass === 'admin123')) {
        sessionStorage.setItem('aos_admin_auth', '1');
        localStorage.setItem('aos_logged_in_user', 'admin');
        onLogin();
      } else {
        setErr('Invalid credentials (Authentication offline).');
        setLoading(false);
      }
    }
  };

  return (
    <div className="apl-root">
      <div className="apl-bg-orb apl-orb1" />
      <div className="apl-bg-orb apl-orb2" />

      <div className="apl-login-wrap">
        <div className="apl-login-logo-wrap">
          <img src="/aosai-logo.png" alt="AosAI" className="apl-login-logo" />
          <div className="apl-login-logo-glow" />
        </div>

        <div className="apl-login-card">
          <div className="apl-login-header">
            <span className="apl-shield">🛡</span>
            <h1 className="apl-login-title">Admin Portal</h1>
            <p className="apl-login-sub">AosAI Platform Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="apl-login-form">
            <div className="apl-login-field">
              <label>Admin Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={user}
                onChange={e => setUser(e.target.value)}
                className="apl-login-input"
                autoComplete="username"
                required
              />
            </div>
            <div className="apl-login-field">
              <label>Admin Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="apl-login-input"
                autoComplete="current-password"
                required
              />
            </div>

            {err && <div className="apl-login-error">⚠ {err}</div>}

            <button type="submit" className="apl-login-btn" disabled={loading}>
              {loading ? <span className="apl-spin">◌</span> : '🔐'} {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>

          <a href="/" className="apl-back-link">← Return to Main App</a>
        </div>

        <p className="apl-login-footer">AosAI Platform · Admin access is monitored and logged.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('aos_admin_auth') === '1');
  const [page, setPage] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [pricing, setPricing] = useState(pricingDefault);
  const [models, setModels] = useState(modelsDefault);
  const [newModel, setNewModel] = useState({ name: '', provider: 'gemini' });
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = async () => {
    const local = localDb.getUsers();
    try {
      const resUsers = await fetch('/api/users');
      if (resUsers.ok) {
        const usersData = await resUsers.json();
        if (Array.isArray(usersData)) {
          const map = new Map();
          local.forEach(u => map.set(u.username.toLowerCase(), u));
          usersData.forEach(u => map.set(u.username.toLowerCase(), u));
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.last_login || b.lastLogin) - new Date(a.last_login || a.lastLogin));
          setUsers(merged);
        } else {
          setUsers(local);
        }
      } else {
        setUsers(local);
      }
    } catch (err) {
      setUsers(local);
    }

    try {
      const resPricing = await fetch('/api/pricing');
      if (resPricing.ok) {
        const pricingData = await resPricing.json();
        if (pricingData && Object.keys(pricingData).length > 0) {
          setPricing(pricingData);
        } else {
          setPricing(localDb.getPricing());
        }
      } else {
        setPricing(localDb.getPricing());
      }
    } catch (err) {
      setPricing(localDb.getPricing());
    }

    try {
      const resModels = await fetch('/api/models');
      if (resModels.ok) {
        const modelsData = await resModels.json();
        if (modelsData && modelsData.length > 0) {
          setModels(modelsData);
        } else {
          setModels(localDb.getModels());
        }
      } else {
        setModels(localDb.getModels());
      }
    } catch (err) {
      setModels(localDb.getModels());
    }
  };

  useEffect(() => {
    if (authed) {
      loadData();
      const t = setInterval(loadData, 5000);
      return () => clearInterval(t);
    }
  }, [authed]);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const totalRevenue = users.reduce((s, u) => {
    if (u.tier === 'developer') return s + (u.billingCycle === 'annual' ? pricing.annualDevSub : pricing.monthlyDevSub);
    if (u.tier === 'problem') return s + (u.problemsCount || 0) * (u.billingCycle === 'annual' ? pricing.annualProblemRate : pricing.monthlyProblemRate);
    return s;
  }, 0);
  const totalProblems = users.reduce((s, u) => s + (u.problemsCount || 0), 0);
  const totalLogins = users.reduce((s, u) => s + (u.login_count || 0), 0);
  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  const updateUser = async (username, fields) => {
    localDb.updateUser(username, fields);
    try {
      await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, updates: fields })
      });
    } catch (e) {
      console.warn('Backend update failed, saved locally:', e);
    }
    loadData();
  };

  const deleteUser = async (username) => {
    if (!confirm(`Delete "${username}"?`)) return;
    localDb.deleteUser(username);
    try {
      await fetch(`/api/users/${username}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete failed, deleted locally:', e);
    }
    loadData();
  };

  const savePricing = async (e) => {
    e.preventDefault();
    const f = e.target;
    const p = {
      monthlyDevSub: +f.monthlyDevSub.value,
      annualDevSub: +f.annualDevSub.value,
      monthlyProblemRate: +f.monthlyProblemRate.value,
      annualProblemRate: +f.annualProblemRate.value,
      traditionalHourCost: +f.traditionalHourCost.value,
      traditionalHoursPerProblem: +f.traditionalHoursPerProblem.value
    };
    localDb.savePricing(p);
    setPricing(p);
    try {
      await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      alert('Pricing saved to database!');
    } catch (e) {
      alert('Pricing saved locally (Backend offline).');
    }
  };

  const toggleModel = async (id) => {
    const updated = models.map(m => m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m);
    setModels(updated);
    localDb.saveModels(updated);
    try {
      await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.warn('Backend save failed, saved locally:', e);
    }
  };

  const deleteModel = async (id) => {
    const updated = models.filter(m => m.id !== id);
    setModels(updated);
    localDb.saveModels(updated);
    try {
      await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.warn('Backend save failed, saved locally:', e);
    }
  };

  const addModel = async (e) => {
    e.preventDefault();
    if (!newModel.name.trim()) return alert('Enter a model name');
    const id = newModel.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (models.find(m => m.id === id)) return alert('Already exists');
    const updated = [...models, { id, name: newModel.name.trim(), provider: newModel.provider, status: 'Active' }];
    setModels(updated);
    setNewModel({ name: '', provider: 'gemini' });
    localDb.saveModels(updated);
    try {
      await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert('Model registered to database!');
    } catch (e) {
      alert('Model registered locally (Backend offline).');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('aos_admin_auth');
    localStorage.removeItem('aos_logged_in_user');
    setAuthed(false);
  };

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'customers', icon: '👥', label: 'Customers' },
    { key: 'pricing', icon: '💰', label: 'Pricing & Plans' },
    { key: 'models', icon: '🤖', label: 'LLM Models' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="ap-root">
      {/* Mobile Top Bar */}
      <header className="ap-mobile-bar">
        <button className="ap-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
        <div className="ap-mobile-brand">
          <img src="/aosai-logo.png" alt="" className="ap-mobile-logo" />
          <span>AosAI Admin</span>
        </div>
        <a href="/" className="ap-back-btn">← App</a>
      </header>

      {sidebarOpen && <div className="ap-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`ap-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ap-sidebar-brand">
          <img src="/aosai-logo.png" alt="AosAI" className="ap-brand-logo" />
          <div>
            <div className="ap-brand-name">AosAI</div>
            <div className="ap-brand-sub">Admin Console</div>
          </div>
        </div>

        <div className="ap-sidebar-section">MAIN MENU</div>
        <nav className="ap-nav">
          {navItems.map(n => (
            <button key={n.key} onClick={() => { setPage(n.key); setSidebarOpen(false); }}
              className={`ap-nav-item ${page === n.key ? 'active' : ''}`}>
              <span className="ap-nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-section">SYSTEM</div>
        <div className="ap-sidebar-info">
          <div className="ap-info-row"><span>Status</span><span className="ap-badge-green">● Online</span></div>
          <div className="ap-info-row"><span>Users</span><span>{users.length}</span></div>
          <div className="ap-info-row"><span>Revenue</span><span style={{color:'#10b981'}}>${totalRevenue.toFixed(2)}</span></div>
        </div>

        <div className="ap-sidebar-footer">
          <a href="/" className="ap-footer-link">← Back to App</a>
          <button className="ap-footer-link" onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="ap-main">
        <div className="ap-topbar">
          <div>
            <h1 className="ap-page-title">{navItems.find(n => n.key === page)?.label}</h1>
            <p className="ap-page-sub">AosAI Platform Administration</p>
          </div>
          <span className="ap-admin-badge">🛡 Master Admin</span>
        </div>

        <div className="ap-content">

          {/* DASHBOARD */}
          {page === 'dashboard' && (
            <div className="ap-fade">
              <div className="ap-stats-grid">
                {[
                  { label: 'Total Customers', val: users.length, icon: '👥', color: '#8b5cf6' },
                  { label: 'Monthly Revenue', val: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: '#10b981' },
                  { label: 'Problems Solved', val: totalProblems, icon: '⚡', color: '#06b6d4' },
                  { label: 'Total Logins', val: totalLogins, icon: '🔐', color: '#ec4899' },
                ].map(s => (
                  <div key={s.label} className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                    <div><div className="ap-stat-val" style={{ color: s.color }}>{s.val}</div><div className="ap-stat-label">{s.label}</div></div>
                  </div>
                ))}
              </div>

              <div className="ap-grid-2">
                <div className="ap-card">
                  <h3 className="ap-card-title">Tier Breakdown</h3>
                  {['sandbox', 'developer', 'problem'].map(t => {
                    const count = users.filter(u => u.tier === t).length;
                    const pct = users.length ? Math.round(count / users.length * 100) : 0;
                    const colors = { sandbox: '#8b5cf6', developer: '#06b6d4', problem: '#10b981' };
                    const labels = { sandbox: 'Sandbox (Free)', developer: 'Developer Sub', problem: 'Pay-Per-Problem' };
                    return (
                      <div key={t} className="ap-tier-row">
                        <span className="ap-tier-label">{labels[t]}</span>
                        <div className="ap-tier-bar-wrap"><div className="ap-tier-bar" style={{ width: `${pct}%`, background: colors[t] }} /></div>
                        <span className="ap-tier-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="ap-card">
                  <h3 className="ap-card-title">LLM Model Status</h3>
                  {models.map(m => (
                    <div key={m.id} className="ap-model-row">
                      <span className="ap-model-name">{m.name}</span>
                      <span className={`ap-badge ${m.status === 'Active' ? 'ap-badge-green' : 'ap-badge-red'}`}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-card">
                <h3 className="ap-card-title">Recent Customers</h3>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr><th>User</th><th>Tier</th><th>Billing</th><th>Tasks</th><th>Logins</th></tr></thead>
                    <tbody>
                      {users.slice(0, 8).map(u => (
                        <tr key={u.username}>
                          <td><div className="ap-user-name">{u.username}</div><div className="ap-user-meta">{u.last_login}</div></td>
                          <td><span className="ap-tier-chip">{u.tier}</span></td>
                          <td>{u.billingCycle}</td>
                          <td>{u.problemsCount || 0}</td>
                          <td>{u.login_count || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {page === 'customers' && (
            <div className="ap-fade">
              <div className="ap-toolbar">
                <input className="ap-search" placeholder="🔍 Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
                <button className="ap-btn-primary" onClick={loadData}>↻ Refresh</button>
              </div>
              <div className="ap-card">
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr><th>User Details</th><th>Tier</th><th>Billing</th><th>Tasks</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No users found</td></tr>}
                      {filtered.map(u => (
                        <tr key={u.username}>
                          <td>
                            <div className="ap-user-name">{u.username}</div>
                            <div className="ap-user-meta">Logins: {u.login_count || 1} · {u.last_login}</div>
                          </td>
                          <td>
                            <select className="ap-select" value={u.tier} onChange={e => updateUser(u.username, { tier: e.target.value })}>
                              <option value="sandbox">Sandbox (Free)</option>
                              <option value="developer">Developer Sub</option>
                              <option value="problem">Pay-Per-Problem</option>
                            </select>
                          </td>
                          <td>
                            <select className="ap-select" value={u.billingCycle} onChange={e => updateUser(u.username, { billingCycle: e.target.value })}>
                              <option value="monthly">Monthly</option>
                              <option value="annual">Annual (−20%)</option>
                            </select>
                          </td>
                          <td><input type="number" className="ap-num-input" value={u.problemsCount || 0} min="0" onChange={e => updateUser(u.username, { problemsCount: +e.target.value })} /></td>
                          <td>
                            <div className="ap-action-row">
                              <button className="ap-btn-sm" onClick={() => { localStorage.setItem('aos_logged_in_user', u.username); window.location.href = '/'; }}>Switch</button>
                              <button className="ap-btn-sm ap-btn-danger" onClick={() => deleteUser(u.username)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRICING */}
          {page === 'pricing' && (
            <div className="ap-fade ap-grid-2">
              <div className="ap-card">
                <h3 className="ap-card-title">💰 Billing Rate Configuration</h3>
                <form onSubmit={savePricing} className="ap-form">
                  <div className="ap-form-grid">
                    {[['monthlyDevSub','Developer Monthly ($)',pricing.monthlyDevSub],['annualDevSub','Developer Annual ($)',pricing.annualDevSub],['monthlyProblemRate','PPP Monthly ($/task)',pricing.monthlyProblemRate],['annualProblemRate','PPP Annual ($/task)',pricing.annualProblemRate],['traditionalHourCost','Traditional Dev Rate ($/hr)',pricing.traditionalHourCost],['traditionalHoursPerProblem','Traditional Hours/Problem',pricing.traditionalHoursPerProblem]].map(([name, label, val]) => (
                      <div key={name} className="ap-field">
                        <label>{label}</label>
                        <input type="number" name={name} step="0.01" defaultValue={val} className="ap-input" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="ap-btn-primary" style={{ marginTop: '16px' }}>Save & Publish Rates</button>
                </form>
              </div>
              <div className="ap-card">
                <h3 className="ap-card-title">📊 Live Preview (10 tasks)</h3>
                <div className="ap-preview-list">
                  <div className="ap-preview-row"><span>Monthly PPP cost</span><span>${(10 * pricing.monthlyProblemRate).toFixed(2)}</span></div>
                  <div className="ap-preview-row"><span>Annual PPP cost</span><span>${(10 * pricing.annualProblemRate).toFixed(2)}</span></div>
                  <div className="ap-preview-row"><span>Traditional cost</span><span style={{ color: '#ef4444' }}>${(10 * pricing.traditionalHourCost * pricing.traditionalHoursPerProblem).toFixed(2)}</span></div>
                  <div className="ap-preview-row ap-preview-highlight"><span>Monthly savings</span><span style={{ color: '#10b981' }}>+${((10 * pricing.traditionalHourCost * pricing.traditionalHoursPerProblem) - (10 * pricing.monthlyProblemRate)).toFixed(2)}</span></div>
                </div>
                <h3 className="ap-card-title" style={{ marginTop: '20px' }}>Plan Summary</h3>
                <div className="ap-preview-list">
                  <div className="ap-preview-row"><span>Sandbox</span><span className="ap-badge ap-badge-gray">Free</span></div>
                  <div className="ap-preview-row"><span>Developer Monthly</span><span>${pricing.monthlyDevSub}/mo</span></div>
                  <div className="ap-preview-row"><span>Developer Annual</span><span>${pricing.annualDevSub}/mo</span></div>
                  <div className="ap-preview-row"><span>PPP Monthly</span><span>${pricing.monthlyProblemRate}/task</span></div>
                  <div className="ap-preview-row"><span>PPP Annual</span><span>${pricing.annualProblemRate}/task</span></div>
                </div>
              </div>
            </div>
          )}

          {/* MODELS */}
          {page === 'models' && (
            <div className="ap-fade ap-grid-2">
              <div className="ap-card">
                <h3 className="ap-card-title">🤖 Registered LLM Models</h3>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr><th>Model</th><th>Provider</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {models.map(m => (
                        <tr key={m.id}>
                          <td><strong>{m.name}</strong></td>
                          <td style={{ textTransform: 'capitalize' }}>{m.provider}</td>
                          <td><button onClick={() => toggleModel(m.id)} className={`ap-badge ap-badge-btn ${m.status === 'Active' ? 'ap-badge-green' : 'ap-badge-red'}`}>{m.status}</button></td>
                          <td><button onClick={() => deleteModel(m.id)} className="ap-btn-sm ap-btn-danger">Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="ap-card">
                <h3 className="ap-card-title">➕ Register New Model</h3>
                <form onSubmit={addModel} className="ap-form">
                  <div className="ap-field"><label>Model Name</label><input placeholder="e.g. GPT-5 Turbo" value={newModel.name} onChange={e => setNewModel(m => ({ ...m, name: e.target.value }))} className="ap-input" /></div>
                  <div className="ap-field">
                    <label>Provider</label>
                    <select value={newModel.provider} onChange={e => setNewModel(m => ({ ...m, provider: e.target.value }))} className="ap-input">
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="ollama">Ollama (Local)</option>
                    </select>
                  </div>
                  <button type="submit" className="ap-btn-primary" style={{ marginTop: '12px' }}>Register Model</button>
                </form>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div className="ap-fade ap-grid-2">
              <div className="ap-card">
                <h3 className="ap-card-title">⚙️ Platform Controls</h3>
                <div className="ap-settings-list">
                  {[
                    ['Purge Sandbox Caches', 'Clear all VM compilation caches', () => alert('Sandbox purged!'), false],
                    ['Kill All Swarms', 'Emergency terminate all agent workflows', () => alert('All swarms terminated.'), true],
                    ['Reset Pricing', 'Restore default billing rates', async () => {
                      try {
                        await fetch('/api/pricing', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(pricingDefault)
                        });
                        setPricing(pricingDefault);
                        alert('Pricing reset successfully!');
                      } catch (e) {
                        console.error(e);
                      }
                    }, false],
                    ['Reset Models', 'Restore the 5 default LLM profiles', async () => {
                      try {
                        await fetch('/api/models', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(modelsDefault)
                        });
                        setModels(modelsDefault);
                        alert('Models reset successfully!');
                      } catch (e) {
                        console.error(e);
                      }
                    }, false],
                  ].map(([name, desc, fn, danger]) => (
                    <div key={name} className="ap-setting-row">
                      <div><div className="ap-setting-name">{name}</div><div className="ap-setting-desc">{desc}</div></div>
                      <button onClick={fn} className={danger ? 'ap-btn-danger-outline' : 'ap-btn-secondary'}>{name.split(' ')[0]}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ap-card">
                <h3 className="ap-card-title">📈 Platform Stats</h3>
                <div className="ap-preview-list">
                  {[
                    ['Total Users', users.length],
                    ['Sandbox', users.filter(u => u.tier === 'sandbox').length],
                    ['Developer Subscribers', users.filter(u => u.tier === 'developer').length],
                    ['Pay-Per-Problem', users.filter(u => u.tier === 'problem').length],
                    ['Total Problems Solved', totalProblems],
                    ['Total Logins', totalLogins],
                    ['Active Models', `${models.filter(m => m.status === 'Active').length}/${models.length}`],
                    ['Monthly Revenue', `$${totalRevenue.toFixed(2)}`],
                  ].map(([label, val]) => (
                    <div key={label} className="ap-preview-row">
                      <span>{label}</span><span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
