import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

const initDb = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {}, users: [], alertConfig: {} }, null, 2));
    }
  } catch (e) {
    console.error("Critical error initializing database:", e);
  }
};
initDb();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

interface DbData {
  configs: Record<string, any>;
  users: any[];
  alertConfig: Record<string, any>;
}

const readDb = (): DbData => {
  try {
    if (!fs.existsSync(DATA_FILE)) return { configs: {}, users: [], alertConfig: {} };
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return {
      configs: parsed.configs || {},
      users: parsed.users || [],
      alertConfig: parsed.alertConfig || {}
    };
  } catch (e) {
    console.error("Error reading database:", e);
    return { configs: {}, users: [], alertConfig: {} };
  }
};

const writeDb = (data: DbData) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing database:", e);
  }
};

// --- Backend API Routes ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/save-config', (req, res) => {
  try {
    const { key, servers, cameras } = req.body;
    if (!key) return res.status(400).json({ error: "Key missing" });
    const db = readDb();
    db.configs[key] = { servers, cameras, timestamp: Date.now() };
    writeDb(db);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Error saving config' });
  }
});

app.get('/api/get-config/:key', (req, res) => {
  const db = readDb();
  res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

app.get('/api/get-all-configs', (_req, res) => {
  const db = readDb();
  res.json(db.configs || {});
});

app.get('/api/get-users', (_req, res) => {
  const db = readDb();
  res.json({ users: db.users });
});

app.post('/api/save-users', (req, res) => {
  try {
    const { users } = req.body;
    const db = readDb();
    db.users = users;
    writeDb(db);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Error saving users' });
  }
});

app.post('/api/check-status', async (req, res) => {
  const { servers } = req.body;
  if (!servers || !Array.isArray(servers)) return res.status(400).json({ error: "Invalid data" });

  const concurrencyLimit = 25;
  const results: any[] = [];

  for (let i = 0; i < servers.length; i += concurrencyLimit) {
    const batch = servers.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(batch.map(async (server: any) => {
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

// Fallback for any unhandled /api routes - return JSON instead of Vite index.html
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Parse port and host from arguments or environment
const args = process.argv.slice(2);
let port = 3000;
const portIdx = args.indexOf('--port');
if (portIdx !== -1 && args[portIdx + 1]) {
  port = parseInt(args[portIdx + 1], 10);
} else if (process.env.PORT) {
  port = parseInt(process.env.PORT, 10);
}

let host = '0.0.0.0';
const hostIdx = args.indexOf('--host');
if (hostIdx !== -1 && args[hostIdx + 1]) {
  host = args[hostIdx + 1];
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // Development mode: Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    console.log(`🚀 SALTEX Full-Stack server running at http://${host}:${port}`);
  });
}

startServer();
