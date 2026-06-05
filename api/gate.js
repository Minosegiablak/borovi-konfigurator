const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function getLocation(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName&lang=hu`);
    const data = await res.json();
    if (data.city) return `${data.city}, ${data.regionName}, ${data.country}`;
    return 'Ismeretlen';
  } catch {
    return 'Ismeretlen';
  }
}

function getDevice(ua) {
  if (!ua) return 'Ismeretlen';
  if (/mobile/i.test(ua)) return 'Telefon';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Számítógép';
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionCode = cookies['borovi_access'];

  if (sessionCode) {
    const valid = await redis.get(`code:${sessionCode}`);
    if (valid) {
      return serveApp(req, res);
    }
  }

  if (req.method === 'POST') {
    let body = '';
    await new Promise(resolve => {
      req.on('data', chunk => body += chunk);
      req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const code = (params.get('code') || '').trim().toUpperCase();

    const codeData = await redis.get(`code:${code}`);
    if (!codeData) {
      return showLoginPage(res, 'Hibás kód! Kérj érvényes kódot az adminisztrátortól.');
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'N/A';
    const ua = req.headers['user-agent'] || '';
    const device = getDevice(ua);
    const location = await getLocation(ip);
    const time = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    const logEntry = { code, ip, location, device, time };
    await redis.lpush('log:entries', JSON.stringify(logEntry));
    await redis.ltrim('log:entries', 0, 499);

    res.setHeader('Set-Cookie', `borovi_access=${code}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax`);
    res.setHeader('Location', '/');
    res.statusCode = 302;
    return res.end();
  }

  return showLoginPage(res);
};

function parseCookies(cookieStr) {
  const cookies = {};
  cookieStr.split(';').forEach(c => {
    const [k, v] = c.trim().split('=');
    if (k) cookies[k.trim()] = (v || '').trim();
  });
  return cookies;
}

function showLoginPage(res, error = '') {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(`<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Borovi Konfigurátor – Belépés</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { min-height: 100vh; background: #1a1a18; display: flex; align-items: center; justify-content: center; font-family: 'Lato', sans-serif; color: #e8e0d0; }
  .bg { position: fixed; inset: 0; background: radial-gradient(ellipse at 30% 50%, #2a2318 0%, #1a1a18 60%); z-index: 0; }
  .card { position: relative; z-index: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; padding: 56px 48px; width: 100%; max-width: 420px; backdrop-filter: blur(20px); box-shadow: 0 40px 80px rgba(0,0,0,0.5); animation: fadeUp 0.6s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .logo { font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 6px; color: #c9a96e; text-align: center; margin-bottom: 4px; }
  .subtitle { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); text-align: center; margin-bottom: 48px; }
  label { display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
  input[type=text] { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; color: #e8e0d0; font-family: 'Lato', sans-serif; font-size: 18px; letter-spacing: 4px; padding: 14px 16px; text-align: center; text-transform: uppercase; outline: none; transition: border-color 0.2s; margin-bottom: 24px; }
  input[type=text]:focus { border-color: #c9a96e; }
  input[type=text]::placeholder { letter-spacing: 2px; opacity: 0.3; font-size: 14px; }
  button { width: 100%; background: #c9a96e; border: none; border-radius: 2px; color: #1a1a18; font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 16px; cursor: pointer; transition: background 0.2s; }
  button:hover { background: #d4b87a; }
  .error { background: rgba(200,60,60,0.15); border: 1px solid rgba(200,60,60,0.3); border-radius: 2px; color: #e88; font-size: 13px; padding: 12px 16px; text-align: center; margin-bottom: 20px; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.15); letter-spacing: 1px; }
</style>
</head>
<body>
<div class="bg"></div>
<div class="card">
  <div class="logo">BOROVI</div>
  <div class="subtitle">Konfigurátor · 2026</div>
  ${error ? `<div class="error">${error}</div>` : ''}
  <form method="POST" action="/">
    <label>Hozzáférési kód</label>
    <input type="text" name="code" placeholder="XXXX-XXXX" autocomplete="off" autofocus maxlength="20">
    <button type="submit">Belépés</button>
  </form>
  <div class="footer">Kód igényléshez fordulj az adminisztrátorhoz</div>
</div>
</body>
</html>`);
}

async function serveApp(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'app.html');
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(content);
  } catch {
    res.statusCode = 500;
    res.end('Hiba az oldal betöltésekor.');
  }
}
