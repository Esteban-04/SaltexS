const express = require('express');
const cors = require('cors');
const ping = require('ping');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Storage configuration
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const DATA_FILE = isVercel 
  ? '/tmp/data.json' 
  : path.resolve(__dirname, 'data.json');

const initDb = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const localFile = path.resolve(__dirname, 'data.json');
      if (fs.existsSync(localFile)) {
        try {
          const content = fs.readFileSync(localFile, 'utf8');
          fs.writeFileSync(DATA_FILE, content);
        } catch (_) {
          fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {}, users: [], alertConfig: {} }, null, 2));
        }
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {}, users: [], alertConfig: {} }, null, 2));
      }
    }
  } catch (e) {
    console.error("Init DB error:", e);
  }
};
initDb();

const readDb = () => {
  try {
    initDb();
    if (!fs.existsSync(DATA_FILE)) return { configs: {}, users: [], alertConfig: {} };
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return {
      configs: parsed.configs || {},
      users: parsed.users || [],
      alertConfig: parsed.alertConfig || {}
    };
  } catch (e) {
    return { configs: {}, users: [], alertConfig: {} };
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing database:", e);
  }
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Root route so "Cannot GET /" never occurs
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SALTEX Monitor API</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 480px; }
    h1 { color: #38bdf8; margin: 0 0 10px; font-size: 1.5rem; }
    p { color: #94a3b8; font-size: 0.95rem; }
    .badge { display: inline-block; background: #065f46; color: #34d399; padding: 4px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 12px; }
    a { color: #38bdf8; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge">● SERVIDOR ACTIVO</div>
    <h1>SALTEX Monitor Backend API</h1>
    <p>El backend de monitoreo está operativo en Vercel.</p>
    <p><a href="/api/health">Ver Estado (/api/health)</a></p>
  </div>
</body>
</html>`);
});

// API Routes
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

app.get(['/api/get-all-configs', '/get-all-configs'], (req, res) => {
  const db = readDb();
  res.json(db.configs || {});
});

app.get(['/api/get-config/:key', '/get-config/:key'], (req, res) => {
  const db = readDb();
  res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

app.post(['/api/save-config', '/save-config'], (req, res) => {
  try {
    const { key, servers, cameras } = req.body;
    if (!key) return res.status(400).json({ error: "Key missing" });
    const db = readDb();
    db.configs[key] = { servers, cameras, timestamp: Date.now() };
    writeDb(db);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Error' });
  }
});

app.get(['/api/get-users', '/get-users'], (req, res) => {
  const db = readDb();
  res.json({ users: db.users || [] });
});

app.post(['/api/save-users', '/save-users'], (req, res) => {
  try {
    const { users } = req.body;
    const db = readDb();
    db.users = users;
    writeDb(db);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Error' });
  }
});

app.post(['/api/check-status', '/check-status'], async (req, res) => {
  const { servers } = req.body;
  if (!servers || !Array.isArray(servers)) return res.status(400).json({ error: "Invalid data" });

  const concurrencyLimit = 25;
  const results = [];

  for (let i = 0; i < servers.length; i += concurrencyLimit) {
    const batch = servers.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(batch.map(async (server) => {
      const ip = server.ip?.trim();
      if (!ip || ip === 'N/A' || ip.includes('X') || ip === '0.0.0.0') {
        return { id: server.id, status: 'offline', ip };
      }
      try {
        const resPing = await ping.promise.probe(ip, {
          timeout: 2,
          extra: ['-n', '1']
        });
        return { id: server.id, status: resPing.alive ? 'online' : 'offline', ip };
      } catch (e) {
        return { id: server.id, status: 'offline', ip };
      }
    }));
    results.push(...batchResults);
  }
  res.json({ results });
});

if (require.main === module && !isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Monitor Backend escuchando en puerto ${PORT}`);
  });
}

module.exports = app;
module.exports.default = app;
