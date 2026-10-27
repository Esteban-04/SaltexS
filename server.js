
import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
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

const readDb = () => {
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

const writeDb = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error writing database:", e);
    }
};

app.post('/api/save-config', (req, res) => {
    try {
        const { key, servers, cameras } = req.body;
        if (!key) return res.status(400).json({ error: "Key missing" });
        const db = readDb();
        db.configs[key] = { servers, cameras, timestamp: Date.now() };
        writeDb(db);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/get-config/:key', (req, res) => {
    const db = readDb();
    res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

app.get('/api/get-all-configs', (req, res) => {
    const db = readDb();
    res.json(db.configs || {});
});

app.get('/api/get-users', (req, res) => {
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
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers || !Array.isArray(servers)) return res.status(400).json({ error: "Invalid data" });

    // Límite de concurrencia para evitar saturar el stack de red o la VPN
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
                // Timeout de 2s para mayor veracidad en conexiones VPN latentes
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

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).+/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Cloud Engine running on port ${PORT}`);
});
