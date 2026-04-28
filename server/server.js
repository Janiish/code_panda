import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import batchRoutes from './routes/batches.js';
import blockchainRoutes from './routes/blockchain.js';
import { seedDatabase } from './seed/seedData.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), time: new Date() }));

// Start
const start = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 AgriChain ZK API Server`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
};

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
