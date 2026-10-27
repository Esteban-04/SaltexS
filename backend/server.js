const express = require('express');
const cors = require('cors');
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

// Serve static frontend files from public folder
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

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
  const { servers = [] } = req.body || {};
  const list = Array.isArray(servers) ? servers : [];
  const results = list.map(server => ({
    id: server.id,
    status: 'online',
    ip: server.ip
  }));
  res.json({ results });
});

// Explicit asset serving with correct MIME types for React bundle
app.get('/assets/:filename', (req, res, next) => {
  const filename = req.params.filename;
  const possibleAssetDirs = [
    path.join(__dirname, 'public/assets'),
    path.resolve(process.cwd(), 'backend/public/assets'),
    path.resolve(process.cwd(), 'dist/assets'),
    path.join(__dirname, '../dist/assets')
  ];
  for (const dir of possibleAssetDirs) {
    const file = path.join(dir, filename);
    if (fs.existsSync(file)) {
      if (filename.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filename.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
      return res.sendFile(file);
    }
  }
  next();
});

const getIndexHtml = () => {
  const possiblePaths = [
    path.join(__dirname, 'public/index.html'),
    path.resolve(process.cwd(), 'backend/public/index.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
    path.join(__dirname, '../dist/index.html')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return fs.readFileSync(p, 'utf8');
      } catch (_) {}
    }
  }

  let jsName = 'index-09899d7b.js';
  try {
    const assetDirs = [
      path.join(__dirname, 'public/assets'),
      path.resolve(process.cwd(), 'backend/public/assets'),
      path.resolve(process.cwd(), 'dist/assets')
    ];
    for (const d of assetDirs) {
      if (fs.existsSync(d)) {
        const found = fs.readdirSync(d).find(f => f.endsWith('.js'));
        if (found) { jsName = found; break; }
      }
    }
  } catch (_) {}

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sites Saltex</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="module" crossorigin src="/assets/${jsName}"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
</body>
</html>`;
};

// Single Page Application Fallback: Serve React web app for any other route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(getIndexHtml());
});

if (require.main === module && !isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Monitor Backend escuchando en puerto ${PORT}`);
  });
}

module.exports = app;
module.exports.default = app;
