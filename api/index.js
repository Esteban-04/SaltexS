import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Determine safe storage location (Vercel /tmp is writable, local process.cwd())
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const DATA_FILE = isVercel 
  ? '/tmp/data.json' 
  : path.resolve(process.cwd(), 'data.json');

const initDb = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const localFile = path.resolve(process.cwd(), 'data.json');
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

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    platform: 'vercel-serverless'
  });
});

router.post('/save-config', (req, res) => {
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

router.get('/get-config/:key', (req, res) => {
  const db = readDb();
  res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

router.get('/get-all-configs', (_req, res) => {
  const db = readDb();
  res.json(db.configs || {});
});

router.get('/get-users', (_req, res) => {
  const db = readDb();
  res.json({ users: db.users });
});

router.post('/save-users', (req, res) => {
  try {
    const { users } = req.body;
    const db = readDb();
    db.users = users;
    writeDb(db);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Error' });
  }
router.get('/', (_req, res) => {
  res.json({ status: 'ok', name: 'SALTEX API Serverless', platform: 'vercel' });
});

router.post('/check-status', async (req, res) => {
  const { servers = [] } = req.body || {};
  const list = Array.isArray(servers) ? servers : [];
  const results = list.map(server => ({
    id: server.id,
    status: 'online',
    ip: server.ip
  }));
  res.json({ results });
});

// Mount on both /api and root to handle any rewrite style
app.use('/api', router);
app.use('/', router);

app.all('*', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'SALTEX API' });
});

export default app;
