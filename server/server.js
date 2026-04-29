import 'dotenv/config';
import { pathToFileURL } from 'url';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import batchRoutes from './routes/batches.js';
import blockchainRoutes from './routes/blockchain.js';

const app = express();

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

// Connect to DB lazily for Vercel Serverless environments
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('DB Connection Failed', err);
    }
  }
  next();
});

// Export the app for Vercel instead of using app.listen()
export default app;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PORT = process.env.PORT || 5000;

  const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  };

  start();
}
