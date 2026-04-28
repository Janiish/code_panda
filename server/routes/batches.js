import express from 'express';
import Batch from '../models/Batch.js';
import Block from '../models/Block.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/batches — list batches (filter by role)
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, farmerId, aggregatorId, retailerId } = req.query;
    let filter = {};

    if (role === 'farmer') filter.farmerId = id;
    else if (role === 'aggregator') {
      if (req.query.available === 'true') filter = { status: 'HARVESTED', aggregatorId: null };
      else filter.aggregatorId = id;
    } else if (role === 'retailer') filter.retailerId = id;
    // consumer sees all
    if (status) filter.status = status;
    if (farmerId) filter.farmerId = farmerId;
    if (aggregatorId) filter.aggregatorId = aggregatorId;
    if (retailerId) filter.retailerId = retailerId;

    const batches = await Batch.find(filter)
      .populate('farmerId', 'name location avatar wallet crops')
      .populate('aggregatorId', 'name location avatar type')
      .populate('retailerId', 'name location avatar type')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches/all — all batches (for consumer trace)
router.get('/all', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('farmerId', 'name location avatar wallet crops')
      .populate('aggregatorId', 'name location avatar type')
      .populate('retailerId', 'name location avatar type')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches/available — available for aggregators
router.get('/available', auth, async (req, res) => {
  try {
    const batches = await Batch.find({ status: 'HARVESTED', aggregatorId: null })
      .populate('farmerId', 'name location avatar wallet');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches/:batchId — single batch with trace info
router.get('/:batchId', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('farmerId', 'name location avatar wallet crops phone');
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const blocks = await Block.find({ 'data.batchId': req.params.batchId }).sort({ index: 1 });
    res.json({ batch, blocks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/batches — create batch (farmer)
router.post('/', auth, async (req, res) => {
  try {
    const {
      crop,
      cropType,
      variety,
      quantity,
      quantityInQuintals,
      moistureLevel,
      quality,
      farmerPrice,
      location,
      certifications,
      farmerAadhaarId,
      farmerAadhaarMock,
      landCoordinates,
    } = req.body;

    const selectedCrop = cropType || crop;
    const normalizedQuantityInQuintals = Number(quantityInQuintals || 0);
    const normalizedQuantityKg = Number(quantity || normalizedQuantityInQuintals * 100);
    const normalizedMoisture = moistureLevel === undefined || moistureLevel === null
      ? null
      : Number(moistureLevel);

    const derivedQuality = normalizedMoisture === null
      ? (quality || 'A')
      : (normalizedMoisture <= 12 ? 'A+' : normalizedMoisture <= 14 ? 'A' : 'B+');

    const count = await Batch.countDocuments();
    const batchId = 'BATCH-' + String(count + 1).padStart(3, '0');
    const farmer = await User.findById(req.user.id);

    const batch = await Batch.create({
      batchId,
      crop: selectedCrop,
      cropType: selectedCrop,
      variety: variety || '',
      quantity: normalizedQuantityKg,
      quantityInQuintals: normalizedQuantityInQuintals || Number((normalizedQuantityKg / 100).toFixed(2)),
      moistureLevel: normalizedMoisture,
      quality: derivedQuality,
      farmerAadhaarId: farmerAadhaarId || farmerAadhaarMock || '',
      farmerAadhaarMock: farmerAadhaarMock || farmerAadhaarId || '',
      landCoordinates: landCoordinates || { lat: null, lng: null, source: 'EOSDA Satellite API (Mock)' },
      farmerId: req.user.id, farmerPrice,
      location: location || farmer.location, certifications: certifications || [],
      harvestDate: new Date()
    });

    await Block.addBlock({
      type: 'CREATE_HARVEST_LOG',
      batchId,
      cropType: selectedCrop,
      quantityInQuintals: batch.quantityInQuintals,
      moistureLevel: batch.moistureLevel,
      actor: req.user.name,
      role: 'Smallholder Farmer',
      location: batch.location,
      price: farmerPrice,
      farmerAadhaarVerifiedBy: 'Krushak Odisha API (Mock)',
      coordinatesVerifiedBy: 'EOSDA Satellite API (Mock)',
    });

    const populated = await Batch.findById(batch._id)
      .populate('farmerId', 'name location avatar wallet crops');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/batches/:batchId/buy — aggregator buys
router.put('/:batchId/buy', auth, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (batch.status !== 'HARVESTED') return res.status(400).json({ error: 'Batch not available' });

    batch.aggregatorId = req.user.id;
    batch.aggregatorPrice = Math.round(batch.farmerPrice * 1.35);
    batch.status = 'AGGREGATED';
    await batch.save();

    const farmer = await User.findById(batch.farmerId);
    await Block.addBlock({
      type: 'TRANSFER_TO_AGGREGATOR', batchId: batch.batchId,
      actor: req.user.name, role: 'Aggregator',
      from: farmer?.name, price: batch.aggregatorPrice, location: req.user.name
    });

    const populated = await Batch.findById(batch._id)
      .populate('farmerId', 'name location avatar wallet')
      .populate('aggregatorId', 'name location avatar type');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/batches/:batchId/ship — aggregator ships to retailer
router.put('/:batchId/ship', auth, async (req, res) => {
  try {
    const { retailerId } = req.body;
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const retailer = await User.findById(retailerId);
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    batch.retailerId = retailerId;
    batch.retailPrice = Math.round(batch.aggregatorPrice * 1.4);
    batch.status = 'IN_TRANSIT';
    await batch.save();

    // Auto-transition to AT_RETAILER after 2s (simulated)
    setTimeout(async () => {
      batch.status = 'AT_RETAILER';
      await batch.save();
    }, 2000);

    await Block.addBlock({
      type: 'TRANSFER_TO_RETAILER', batchId: batch.batchId,
      actor: retailer.name, role: 'Retailer',
      price: batch.retailPrice, location: retailer.location
    });

    const populated = await Batch.findById(batch._id)
      .populate('farmerId', 'name location avatar wallet')
      .populate('aggregatorId', 'name location avatar type')
      .populate('retailerId', 'name location avatar type');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/batches/:batchId/sell — retailer sells to consumer
router.put('/:batchId/sell', auth, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    batch.status = 'SOLD';
    await batch.save();

    await Block.addBlock({
      type: 'SOLD_TO_CONSUMER', batchId: batch.batchId,
      role: 'Consumer', location: batch.location
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
