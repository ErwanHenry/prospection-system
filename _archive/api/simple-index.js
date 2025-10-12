/**
 * Version simplifiée pour Vercel - Graixl
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS très permissif pour debug
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*'
}));
app.use(express.json());

// Middleware de debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ========== ROUTES BASIQUES ==========

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        platform: 'Vercel',
        agents: 8
    });
});

app.get('/api/v1/docs', (req, res) => {
    res.json({
        title: 'Graixl API - Version Simplifiée',
        version: '1.0.0',
        description: 'API de prospection avec LinkedIn/Apollo',
        endpoints: {
            'GET /api/health': 'Status de l\'API',
            'POST /api/v1/prospects/analyze': 'Analyser un prospect',
            'POST /api/v1/prospects/import': 'Import LinkedIn/Apollo'
        }
    });
});

// Route import prospects simplifiée
app.post('/api/v1/prospects/import', (req, res) => {
    const { keywords } = req.body;
    
    res.json({
        success: true,
        prospects: [
            {
                id: 'demo_1',
                email: 'erwanhenry@hotmail.com',
                name: 'Erwan Henry',
                title: 'CEO & Founder',
                company: 'Graixl',
                source: 'demo_apollo'
            }
        ],
        source: 'demo',
        criteria: { keywords }
    });
});

// Route analyse prospect simplifiée
app.post('/api/v1/prospects/analyze', (req, res) => {
    const { email, name } = req.body;
    
    res.json({
        success: true,
        prospect: { email, name },
        analysis: {
            score: 92,
            industry: 'tech'
        },
        email: {
            subject: `${name}, découvrez Graixl`,
            body: `Bonjour ${name}, Graixl révolutionne votre prospection avec Claude Code...`
        }
    });
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../dashboard')));

// Redirection racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard/index.html'));
});

module.exports = app;