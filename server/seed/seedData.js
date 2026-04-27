import { pathToFileURL } from 'url';
import crypto from 'crypto';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Block from '../models/Block.js';

const FARMERS = [
  { name: 'Ramesh Pradhan', phone: '9876543210', role: 'farmer', location: 'Puri', crops: ['Rice', 'Turmeric'], avatar: '👨‍🌾' },
  { name: 'Sunita Behera', phone: '8765432109', role: 'farmer', location: 'Cuttack', crops: ['Onion', 'Potato'], avatar: '👩‍🌾' },
  { name: 'Manoj Sahoo', phone: '7654321098', role: 'farmer', location: 'Berhampur', crops: ['Red Chili', 'Tomato'], avatar: '👨‍🌾' },
  { name: 'Priya Mohanty', phone: '6543210987', role: 'farmer', location: 'Jeypore', crops: ['Groundnut', 'Mustard'], avatar: '👩‍🌾' },
  { name: 'Bikram Nayak', phone: '5432109876', role: 'farmer', location: 'Koraput', crops: ['Rice', 'Onion'], avatar: '👨‍🌾' },
];

const AGGREGATORS = [
  { name: 'Odisha Agri Co-op', phone: '9000000001', role: 'aggregator', location: 'Bhubaneswar', type: 'FPO', avatar: '🏢' },
  { name: 'Kalinga Traders', phone: '9000000002', role: 'aggregator', location: 'Cuttack', type: 'Trader', avatar: '📦' },
];

const RETAILERS = [
  { name: 'FreshMart Bhubaneswar', phone: '9000000010', role: 'retailer', location: 'Bhubaneswar', type: 'Retail', avatar: '🏪' },
  { name: 'Odisha Organics', phone: '9000000011', role: 'retailer', location: 'Puri', type: 'Organic', avatar: '🛒' },
  { name: 'Green Basket Rourkela', phone: '9000000012', role: 'retailer', location: 'Rourkela', type: 'Retail', avatar: '🏬' },
];

export async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('📦 Database already seeded — skipping');
    return;
  }

  console.log('🌱 Seeding database...');

  // Generate wallets
  const mkWallet = () => '0x' + [...Array(4)].map(() => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')).join('').slice(0, 8) + '...' + [...Array(2)].map(() => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')).join('').slice(0, 4);
  const mkAadhaarHash = (phone) => crypto.createHash('sha256').update(String(phone)).digest('hex');
  const allUsers = [...FARMERS, ...AGGREGATORS, ...RETAILERS].map(u => ({ ...u, wallet: mkWallet(), aadhaarHash: mkAadhaarHash(u.phone), isVerified: true }));
  const users = await User.insertMany(allUsers);

  const farmerMap = {};
  const aggMap = {};
  const retMap = {};
  users.forEach(u => {
    if (u.role === 'farmer') farmerMap[u.name] = u._id;
    if (u.role === 'aggregator') aggMap[u.name] = u._id;
    if (u.role === 'retailer') retMap[u.name] = u._id;
  });

  const batchData = [
    { batchId: 'BATCH-001', crop: 'Rice', variety: 'Basmati', quantity: 500, quality: 'A+', farmerName: 'Ramesh Pradhan', aggName: 'Odisha Agri Co-op', retName: 'FreshMart Bhubaneswar', status: 'AT_RETAILER', farmerPrice: 32, aggregatorPrice: 42, retailPrice: 58, harvestDate: '2026-04-10', location: 'Puri', certifications: ['Organic', 'Residue-Free'] },
    { batchId: 'BATCH-002', crop: 'Onion', variety: 'Nashik Red', quantity: 300, quality: 'A', farmerName: 'Sunita Behera', aggName: 'Odisha Agri Co-op', retName: 'Odisha Organics', status: 'AT_RETAILER', farmerPrice: 18, aggregatorPrice: 28, retailPrice: 45, harvestDate: '2026-04-12', location: 'Cuttack', certifications: ['Verified Origin'] },
    { batchId: 'BATCH-003', crop: 'Turmeric', variety: 'Lakadong', quantity: 200, quality: 'A+', farmerName: 'Ramesh Pradhan', aggName: 'Kalinga Traders', retName: 'FreshMart Bhubaneswar', status: 'SOLD', farmerPrice: 85, aggregatorPrice: 110, retailPrice: 160, harvestDate: '2026-04-08', location: 'Puri', certifications: ['Organic', 'GI Tagged'] },
    { batchId: 'BATCH-004', crop: 'Red Chili', variety: 'Guntur Sannam', quantity: 150, quality: 'A', farmerName: 'Manoj Sahoo', aggName: null, retName: null, status: 'HARVESTED', farmerPrice: 120, aggregatorPrice: null, retailPrice: null, harvestDate: '2026-04-20', location: 'Berhampur', certifications: [] },
    { batchId: 'BATCH-005', crop: 'Tomato', variety: 'Hybrid', quantity: 400, quality: 'B+', farmerName: 'Manoj Sahoo', aggName: 'Odisha Agri Co-op', retName: null, status: 'AGGREGATED', farmerPrice: 15, aggregatorPrice: 22, retailPrice: null, harvestDate: '2026-04-18', location: 'Berhampur', certifications: ['Verified Origin'] },
    { batchId: 'BATCH-006', crop: 'Potato', variety: 'Kufri Jyoti', quantity: 800, quality: 'A', farmerName: 'Sunita Behera', aggName: 'Kalinga Traders', retName: 'Green Basket Rourkela', status: 'IN_TRANSIT', farmerPrice: 12, aggregatorPrice: 18, retailPrice: 28, harvestDate: '2026-04-15', location: 'Cuttack', certifications: [] },
    { batchId: 'BATCH-007', crop: 'Groundnut', variety: 'Bold', quantity: 250, quality: 'A+', farmerName: 'Priya Mohanty', aggName: 'Odisha Agri Co-op', retName: 'FreshMart Bhubaneswar', status: 'SOLD', farmerPrice: 55, aggregatorPrice: 72, retailPrice: 95, harvestDate: '2026-04-05', location: 'Jeypore', certifications: ['Organic'] },
    { batchId: 'BATCH-008', crop: 'Rice', variety: 'Sona Masoori', quantity: 1000, quality: 'A', farmerName: 'Bikram Nayak', aggName: 'Odisha Agri Co-op', retName: 'Odisha Organics', status: 'AT_RETAILER', farmerPrice: 28, aggregatorPrice: 36, retailPrice: 52, harvestDate: '2026-04-11', location: 'Koraput', certifications: ['Verified Origin'] },
  ];

  const batches = [];
  for (const bd of batchData) {
    const b = await Batch.create({
      batchId: bd.batchId, crop: bd.crop, variety: bd.variety, quantity: bd.quantity, unit: 'kg', quality: bd.quality,
      farmerId: farmerMap[bd.farmerName],
      aggregatorId: bd.aggName ? aggMap[bd.aggName] : null,
      retailerId: bd.retName ? retMap[bd.retName] : null,
      status: bd.status, farmerPrice: bd.farmerPrice, aggregatorPrice: bd.aggregatorPrice, retailPrice: bd.retailPrice,
      harvestDate: new Date(bd.harvestDate), location: bd.location, certifications: bd.certifications
    });
    batches.push(b);

    // Blockchain records
    await Block.addBlock({ type: 'CREATE_BATCH', batchId: bd.batchId, crop: bd.crop, quantity: bd.quantity, quality: bd.quality, actor: bd.farmerName, role: 'Farmer', location: bd.location, price: bd.farmerPrice });
    if (bd.aggName) await Block.addBlock({ type: 'TRANSFER_TO_AGGREGATOR', batchId: bd.batchId, actor: bd.aggName, role: 'Aggregator', from: bd.farmerName, price: bd.aggregatorPrice, location: aggMap[bd.aggName] ? bd.aggName : '' });
    if (bd.retName) await Block.addBlock({ type: 'TRANSFER_TO_RETAILER', batchId: bd.batchId, actor: bd.retName, role: 'Retailer', price: bd.retailPrice, location: bd.retName });
    if (bd.status === 'SOLD') await Block.addBlock({ type: 'SOLD_TO_CONSUMER', batchId: bd.batchId, role: 'Consumer', location: bd.location });
  }

  console.log(`✅ Seeded: ${users.length} users, ${batches.length} batches, ${await Block.countDocuments()} blocks`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { default: connectDB } = await import('../config/db.js');

  connectDB()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
