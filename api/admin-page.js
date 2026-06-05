module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(`<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Borovi Admin – Hozzáférés kezelés</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #c9a96e;
    --gold-light: #d4b87a;
    --bg: #141412;
    --surface: #1e1e1b;
    --surface2: #252520;
    --border: rgba(255,255,255,0.07);
    --text: #e8e0d0;
    --text-dim: rgba(232,224,208,0.45);
    --red: #e05555;
    --green: #5aab6e;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Lato', sans-serif;
    min-height: 100vh;
  }

  /* LOGIN */
  #login-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 30% 50%, #221e12 0%, #141412 70%);
  }
  .login-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 48px 40px;
    width: 360px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }
  .login-logo {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    letter-spacing: 5px;
    color: var(--gold);
    text-align: center;
    margin-bottom: 4px;
  }
  .login-sub {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-dim);
    text-align: center;
    margin-bottom: 40px;
  }
  .login-error {
    background: rgba(224,85,85,0.12);
    border: 1px solid rgba(224,85,85,0.25);
    border-radius: 2px;
    color: #e88;
    font-size: 13px;
    padding: 10px 14px;
    margin-bottom: 16px;
    text-align: center;
    display: none;
  }

  /* COMMON INPUTS */
  label { display: block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  input[type=text], input[type=password] {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text);
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 20px;
  }
  input[type=text]:focus, input[type=password]:focus { border-color: var(--gold); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: var(--gold);
    border: none; border-radius: 2px;
    color: #1a1a14;
    font-family: 'Lato', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    white-space: nowrap;
  }
  .btn:hover { background: var(--gold-light); }
  .btn:active { transform: scale(0.98); }
  .btn-full { width: 100%; }
  .btn-danger { background: transparent; color: var(--red); border: 1px solid rgba(224,85,85,0.3); }
  .btn-danger:hover { background: rgba(224,85,85,0.1); }
  .btn-sm { padding: 7px 14px; font-size: 10px; }

  /* MAIN APP */
  #app { display: none; }

  header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    position: sticky; top: 0; z-index: 100;
  }
  .header-logo {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    letter-spacing: 4px;
    color: var(--gold);
  }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .header-tag {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--text-dim); background: var(--surface2);
    border: 1px solid var(--border); border-radius: 2px;
    padding: 4px 10px;
  }

  main { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }

  /* TABS */
  .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .tab {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--text-dim); padding: 14px 24px;
    cursor: pointer; border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    background: none; border-top: none; border-left: none; border-right: none;
    font-family: 'Lato', sans-serif;
  }
  .tab:hover { color: var(--text); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* CARDS */
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; color: var(--text);
    margin-bottom: 6px;
  }
  .section-sub { font-size: 13px; color: var(--text-dim); margin-bottom: 28px; }

  .create-form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 28px;
    margin-bottom: 32px;
    display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;
  }
  .create-form .field { flex: 1; min-width: 180px; }
  .create-form label { margin-bottom: 8px; }
  .create-form input { margin-bottom: 0; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--text-dim); text-align: left;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
  }
  td {
    padding: 14px 16px; font-size: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .code-badge {
    font-family: 'Courier New', monospace;
    font-size: 15px; letter-spacing: 3px;
    color: var(--gold); font-weight: bold;
  }
  .empty-state {
    text-align: center; padding: 60px 20px;
    color: var(--text-dim); font-size: 14px;
  }
  .empty-state .icon { font-size: 40px; margin-bottom: 12px; }

  /* STATUS */
  .status-dot {
    display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; margin-right: 6px;
  }
  .status-dot.active { background: var(--green); box-shadow: 0 0 6px var(--green); }

  /* STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px; padding: 24px;
  }
  .stat-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--gold); }

  /* COPY TOAST */
  .toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--green); color: #fff;
    font-size: 13px; font-weight: 700;
    padding: 12px 20px; border-radius: 2px;
    opacity: 0; transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
    pointer-events: none; z-index: 999;
  }
  .toast.show { opacity: 1; transform: translateY(0); }

  @media (max-width: 600px) {
    main { padding: 24px 16px; }
    header { padding: 0 16px; }
    .create-form { flex-direction: column; }
    .create-form .field { width: 100%; }
  }
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login-screen">
  <div class="login-card">
    <div class="login-logo">BOROVI</div>
    <div class="login-sub">Admin felület</div>
    <div class="login-error" id="login-error">Hibás jelszó!</div>
    <label>Admin jelszó</label>
    <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
    <button class="btn btn-full" onclick="doLogin()">Belépés</button>
  </div>
</div>

<!-- APP -->
<div id="app">
  <header>
    <div class="header-logo">BOROVI</div>
    <div class="header-right">
      <span class="header-tag">Admin</span>
      <button class="btn btn-sm btn-danger" onclick="logout()">Kilépés</button>
    </div>
  </header>

  <main>
    <div class="tabs">
      <button class="tab active" onclick="switchTab('codes')">🔑 Kódok</button>
      <button class="tab" onclick="switchTab('logs')">📋 Napló</button>
    </div>

    <!-- KÓDOK -->
    <div id="tab-codes" class="tab-content active">
      <div class="section-title">Hozzáférési kódok</div>
      <div class="section-sub">Adj ki kódokat és vond vissza bármikor.</div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Aktív kódok</div>
          <div class="stat-value" id="stat-codes">–</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Belépések ma</div>
          <div class="stat-value" id="stat-logins">–</div>
        </div>
      </div>

      <div class="create-form">
        <div class="field">
          <label>Személy neve (opcionális)</label>
          <input type="text" id="new-name" placeholder="pl. Kovács Bt.">
        </div>
        <div class="field">
          <label>Egyedi kód (opcionális)</label>
          <input type="text" id="new-code" placeholder="pl. DEMO2026" maxlength="12">
        </div>
        <button class="btn" onclick="createCode()">+ Kód létrehozása</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kód</th>
              <th>Név</th>
              <th>Létrehozva</th>
              <th>Státusz</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="codes-tbody">
            <tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div>Betöltés...</div></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- NAPLÓ -->
    <div id="tab-logs" class="tab-content">
      <div class="section-title">Belépési napló</div>
      <div class="section-sub">Az utolsó 100 belépés adatai.</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kód</th>
              <th>Helyszín</th>
              <th>Eszköz</th>
              <th>IP cím</th>
              <th>Időpont</th>
            </tr>
          </thead>
          <tbody id="logs-tbody">
            <tr><td colspan="5"><div class="empty-state"><div class="icon">⏳</div>Betöltés...</div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>

<div class="toast" id="toast">✓ Kód másolva!</div>

<script>
let adminPassword = '';

function doLogin() {
  const pw = document.getElementById('login-password').value;
  if (!pw) return;
  adminPassword = pw;
  apiRequest('GET', '?action=codes')
    .then(() => {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      loadCodes();
    })
    .catch(() => {
      document.getElementById('login-error').style.display = 'block';
      adminPassword = '';
    });
}

document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

function logout() {
  adminPassword = '';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(\`tab-\${tab}\`).classList.add('active');
  event.target.classList.add('active');
  if (tab === 'codes') loadCodes();
  if (tab === 'logs') loadLogs();
}

async function apiRequest(method, path, body) {
  const res = await fetch(\`/api/admin\${path}\`, {
    method,
    headers: {
      'Authorization': \`Bearer \${adminPassword}\`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) throw new Error('Jogosulatlan');
  return res.json();
}

async function loadCodes() {
  const data = await apiRequest('GET', '?action=codes');
  const tbody = document.getElementById('codes-tbody');
  document.getElementById('stat-codes').textContent = data.codes.length;

  if (!data.codes.length) {
    tbody.innerHTML = \`<tr><td colspan="5"><div class="empty-state"><div class="icon">🔑</div>Még nincs kód. Hozz létre egyet!</div></td></tr>\`;
    return;
  }

  tbody.innerHTML = data.codes.map(c => \`
    <tr>
      <td>
        <span class="code-badge" style="cursor:pointer" onclick="copyCode('\${c.code}')" title="Kattints a másoláshoz">
          \${c.code}
        </span>
      </td>
      <td>\${c.name}</td>
      <td style="color:var(--text-dim);font-size:13px">\${c.created}</td>
      <td><span class="status-dot active"></span>Aktív</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteCode('\${c.code}')">Visszavon</button></td>
    </tr>
  \`).join('');
}

async function loadLogs() {
  const data = await apiRequest('GET', '?action=logs');
  const tbody = document.getElementById('logs-tbody');

  // Napi statisztika
  const today = new Date().toLocaleDateString('hu-HU');
  const todayCount = data.logs.filter(l => l.time && l.time.startsWith(today.replace(/\./g, '.'))).length;
  document.getElementById('stat-logins').textContent = todayCount;

  if (!data.logs.length) {
    tbody.innerHTML = \`<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div>Még nincs belépési napló.</div></td></tr>\`;
    return;
  }

  tbody.innerHTML = data.logs.map(l => \`
    <tr>
      <td><span class="code-badge">\${l.code}</span></td>
      <td>📍 \${l.location}</td>
      <td>\${l.device}</td>
      <td style="color:var(--text-dim);font-size:12px;font-family:monospace">\${l.ip}</td>
      <td style="color:var(--text-dim);font-size:13px">\${l.time}</td>
    </tr>
  \`).join('');
}

async function createCode() {
  const name = document.getElementById('new-name').value.trim();
  const code = document.getElementById('new-code').value.trim();
  const data = await apiRequest('POST', '?action=create', { name, code });
  if (data.error) { alert(data.error); return; }
  document.getElementById('new-name').value = '';
  document.getElementById('new-code').value = '';
  copyCode(data.code, true);
  loadCodes();
}

async function deleteCode(code) {
  if (!confirm(\`Biztosan visszavonod a "\${code}" kódot?\nA kóddal rendelkező személy többé nem tud belépni.\`)) return;
  await apiRequest('DELETE', \`?action=delete&code=\${code}\`);
  loadCodes();
}

function copyCode(code, newlyCreated = false) {
  navigator.clipboard.writeText(code).then(() => {
    const toast = document.getElementById('toast');
    toast.textContent = newlyCreated ? \`✓ Kód létrehozva és másolva: \${code}\` : \`✓ Másolva: \${code}\`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}
</script>
</body>
</html>`);
};
