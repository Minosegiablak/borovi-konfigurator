const { createClient } = require('@upstash/redis');

const redis = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'borovi2026';

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Admin jelszó ellenőrzés
  const auth = req.headers['authorization'] || '';
  const password = auth.replace('Bearer ', '');
  if (password !== ADMIN_PASSWORD) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Jogosulatlan hozzáférés' }));
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get('action');

  // Kódok listázása
  if (req.method === 'GET' && action === 'codes') {
    const keys = await redis.keys('code:*');
    const codes = [];
    for (const key of keys) {
      const data = await redis.get(key);
      codes.push({ code: key.replace('code:', ''), ...JSON.parse(data) });
    }
    codes.sort((a, b) => new Date(b.created) - new Date(a.created));
    return res.end(JSON.stringify({ codes }));
  }

  // Naplók listázása
  if (req.method === 'GET' && action === 'logs') {
    const entries = await redis.lrange('log:entries', 0, 99);
    const logs = entries.map(e => JSON.parse(e));
    return res.end(JSON.stringify({ logs }));
  }

  // Új kód létrehozása
  if (req.method === 'POST' && action === 'create') {
    let body = '';
    await new Promise(resolve => {
      req.on('data', chunk => body += chunk);
      req.on('end', resolve);
    });
    const { name, code: customCode } = JSON.parse(body || '{}');

    const code = customCode
      ? customCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
      : generateCode();

    const exists = await redis.get(`code:${code}`);
    if (exists) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Ez a kód már létezik' }));
    }

    const data = {
      name: name || 'Névtelen',
      created: new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' }),
      active: true
    };
    await redis.set(`code:${code}`, JSON.stringify(data));
    return res.end(JSON.stringify({ success: true, code }));
  }

  // Kód törlése
  if (req.method === 'DELETE' && action === 'delete') {
    const code = url.searchParams.get('code');
    if (!code) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Hiányzó kód' }));
    }
    await redis.del(`code:${code}`);
    return res.end(JSON.stringify({ success: true }));
  }

  res.statusCode = 400;
  res.end(JSON.stringify({ error: 'Ismeretlen művelet' }));
};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
