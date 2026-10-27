
const express = require('express');
const cors = require('cors');
const ping = require('ping');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// --- Configuración Inicial ---
let emailConfig = {
    enabled: false,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    recipient: 'esteban@saltexgroup.com'
};

if (fs.existsSync(CONFIG_FILE)) {
    try {
        const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        emailConfig = { ...emailConfig, ...savedConfig };
        console.log("✅ Configuración de alertas cargada");
    } catch (e) {
        console.error("❌ Error cargando configuración");
    }
}

let lastOfflineIps = new Set();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    console.log(`[${new Date().toISOString()}] Health check requested`);
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(), 
        environment: process.env.NODE_ENV || 'production'
    });
});

app.post('/api/config-alerts', (req, res) => {
    const { config } = req.body;
    if (config) {
        emailConfig = { ...emailConfig, ...config };
        try {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(emailConfig, null, 2));
        } catch(e) {}
        console.log("✅ Configuración de alertas actualizada");
        return res.json({ success: true });
    }
    res.status(400).json({ error: 'Configuración inválida' });
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers) return res.status(400).send();

    console.log(`[${new Date().toISOString()}] Checking status for ${servers.length} servers...`);

    const results = await Promise.all(servers.map(async (server) => {
        if (!server.ip || server.ip.includes('X')) return { id: server.id, status: 'offline' };
        try {
            // Nota: El ping puede tardar. Se usa timeout corto para no bloquear.
            const resPing = await ping.promise.probe(server.ip, { timeout: 2 });
            const status = resPing.alive ? 'online' : 'offline';
            console.log(` - Server ${server.ip}: ${status}`);
            return { id: server.id, status, name: server.name, ip: server.ip };
        } catch (e) {
            console.error(` ❌ Error pinging ${server.ip}: ${e.message}`);
            return { id: server.id, status: 'offline' };
        }
    }));

    res.json({ results });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Monitor Backend escuchando en puerto ${PORT}`);
});
