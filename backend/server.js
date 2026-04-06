const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const supplyChainRoutes = require('./routes/supplychain');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/supplychain', supplyChainRoutes);
app.use('/api/feedback', feedbackRoutes);

// Basic root response so GET / doesn’t return cannot GET
app.get('/', (req, res) => {
    res.send('AgriTrace backend is running');
});

// Health check for uptime and container readiness
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});