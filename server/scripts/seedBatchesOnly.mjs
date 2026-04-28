import connectDB from '../config/db.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Block from '../models/Block.js';

const batchData = [
  { batchId: 'BATCH-001', crop: 'Rice', variety: 'Basmati', quantity: 500, quality: 'A+', farmerName: 'Ramesh Pradhan', aggName: 'Odisha Agri Co-op', retName: 'FreshMart Bhubaneswar', status: 'AT_RETAILER', farmerPrice: 32, aggregatorPrice: 42, retailPrice: 58, harvestDate: '2026-04-10', location: 'Puri', certifications: ['Organic', 'Residue-Free'] },
  { batchId: 'BATCH-002', crop: 'Onion', variety: 'Nashik Red', quantity: 300, quality: 'A', farmerName: 'Sunita Behera', aggName: 'Odisha Agri Co-op', retName: 'Odisha Organics', status: 'AT_RETAILER', farmerPrice: 18, aggregatorPrice: 28, retailPrice: 45, harvestDate: '2026-04-12', location: 'Cuttack', certifications: ['Verified Origin'] },
  { batchId: 'BATCH-003', crop: 'Turmeric', variety: 'Lakadong', quantity: 200, quality: 'A+', farmerName: 'Ramesh Pradhan', aggName: 'Kalinga Traders', retName: 'FreshMart Bhubaneswar', status: 'SOLD', farmerPrice: 85, aggregatorPrice: 110, retailPrice: 160, harvestDate: '2026-04-08', location: 'Puri', certifications: ['Organic', 'GI Tagged'] },
];

(async () => {
  await connectDB();
  const users = await User.find();
  const mapByName = {};
  users.forEach(u => mapByName[u.name] = u._id);
  const firstFarmer = users.find(u => u.role === 'farmer')?._id || users[0]?._id;

  for (const bd of batchData) {
    const exists = await Batch.findOne({ batchId: bd.batchId });
    if (exists) continue;
    const farmerId = mapByName[bd.farmerName] || firstFarmer;
    const b = await Batch.create({
      batchId: bd.batchId, crop: bd.crop, cropType: bd.crop, variety: bd.variety, quantity: bd.quantity, quantityInQuintals: (bd.quantity/100),
      farmerId: farmerId,
      aggregatorId: mapByName[bd.aggName] || null,
      retailerId: mapByName[bd.retName] || null,
      status: bd.status, farmerPrice: bd.farmerPrice, aggregatorPrice: bd.aggregatorPrice, retailPrice: bd.retailPrice,
      harvestDate: new Date(bd.harvestDate), location: bd.location, certifications: bd.certifications
    });
    await Block.addBlock({ type: 'CREATE_BATCH', batchId: bd.batchId, crop: bd.crop, quantity: bd.quantity, quality: bd.quality, actor: bd.farmerName, role: 'Farmer', location: bd.location, price: bd.farmerPrice });
  }

  const counts = { users: await User.countDocuments(), batches: await Batch.countDocuments(), blocks: await Block.countDocuments() };
  console.log('seeded counts:', counts);
  process.exit(0);
})();