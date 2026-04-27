import express from 'express';
import Block from '../models/Block.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/blockchain/recent — recent blocks
router.get('/recent', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 15;
    const blocks = await Block.find().sort({ index: -1 }).limit(count);
    res.json(blocks.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blockchain/batch/:batchId — blocks for specific batch
router.get('/batch/:batchId', async (req, res) => {
  try {
    const blocks = await Block.find({ 'data.batchId': req.params.batchId }).sort({ index: 1 });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blockchain/stats — chain stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Block.countDocuments();
    const latest = await Block.findOne().sort({ index: -1 });
    res.json({ totalBlocks: total, latestHash: latest?.hash, latestIndex: latest?.index });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blockchain/verify — verify chain integrity
router.get('/verify', async (req, res) => {
  try {
    const blocks = await Block.find().sort({ index: 1 });
    let valid = true;
    for (let i = 1; i < blocks.length; i++) {
      if (blocks[i].previousHash !== blocks[i - 1].hash) { valid = false; break; }
    }
    res.json({ valid, blocksChecked: blocks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
