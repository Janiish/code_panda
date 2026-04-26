// ============================================
// AgriChain ZK — Mock Seed Data
// ============================================

const CROPS = ['Rice', 'Onion', 'Turmeric', 'Red Chili', 'Tomato', 'Potato', 'Groundnut', 'Mustard'];
const CROP_EMOJI = { Rice: '🌾', Onion: '🧅', Turmeric: '🟡', 'Red Chili': '🌶️', Tomato: '🍅', Potato: '🥔', Groundnut: '🥜', Mustard: '🌻' };
const QUALITY_GRADES = ['A+', 'A', 'B+', 'B'];
const LOCATIONS = ['Bhubaneswar', 'Cuttack', 'Puri', 'Berhampur', 'Rourkela', 'Sambalpur', 'Balasore', 'Jeypore', 'Angul', 'Koraput'];

const FARMERS = [
  { id: 'F001', name: 'Ramesh Pradhan', location: 'Puri', phone: '+91 98765 43210', crops: ['Rice', 'Turmeric'], wallet: '0x7a3f...e2b1', avatar: '👨‍🌾' },
  { id: 'F002', name: 'Sunita Behera', location: 'Cuttack', phone: '+91 87654 32109', crops: ['Onion', 'Potato'], wallet: '0x4c8d...f3a2', avatar: '👩‍🌾' },
  { id: 'F003', name: 'Manoj Sahoo', location: 'Berhampur', phone: '+91 76543 21098', crops: ['Red Chili', 'Tomato'], wallet: '0x9e1b...d4c3', avatar: '👨‍🌾' },
  { id: 'F004', name: 'Priya Mohanty', location: 'Jeypore', phone: '+91 65432 10987', crops: ['Groundnut', 'Mustard'], wallet: '0x2f6a...b5d4', avatar: '👩‍🌾' },
  { id: 'F005', name: 'Bikram Nayak', location: 'Koraput', phone: '+91 54321 09876', crops: ['Rice', 'Onion'], wallet: '0x8d3e...a6e5', avatar: '👨‍🌾' },
];

const AGGREGATORS = [
  { id: 'A001', name: 'Odisha Agri Co-op', location: 'Bhubaneswar', type: 'FPO', wallet: '0xb2c4...7f91', avatar: '🏢' },
  { id: 'A002', name: 'Kalinga Traders', location: 'Cuttack', type: 'Trader', wallet: '0xd5e6...8a02', avatar: '📦' },
];

const RETAILERS = [
  { id: 'R001', name: 'FreshMart Bhubaneswar', location: 'Bhubaneswar', type: 'Retail', wallet: '0xf1a2...3b14', avatar: '🏪' },
  { id: 'R002', name: 'Odisha Organics', location: 'Puri', type: 'Organic', wallet: '0xc3d4...5e26', avatar: '🛒' },
  { id: 'R003', name: 'Green Basket Rourkela', location: 'Rourkela', type: 'Retail', wallet: '0xe5f6...7g38', avatar: '🏬' },
];

// Status flow: Harvested → Aggregated → In Transit → At Retailer → Sold
const BATCH_STATUS = {
  HARVESTED: { label: 'Harvested', color: 'green', icon: '🌱' },
  AGGREGATED: { label: 'Aggregated', color: 'cyan', icon: '📦' },
  IN_TRANSIT: { label: 'In Transit', color: 'amber', icon: '🚛' },
  AT_RETAILER: { label: 'At Retailer', color: 'purple', icon: '🏪' },
  SOLD: { label: 'Sold', color: 'green', icon: '✅' },
};

const BATCHES = [
  {
    id: 'BATCH-001', crop: 'Rice', variety: 'Basmati', quantity: 500, unit: 'kg',
    quality: 'A+', farmerId: 'F001', aggregatorId: 'A001', retailerId: 'R001',
    status: 'AT_RETAILER',
    farmerPrice: 32, aggregatorPrice: 42, retailPrice: 58,
    harvestDate: '2026-04-10', location: 'Puri',
    certifications: ['Organic', 'Residue-Free'],
  },
  {
    id: 'BATCH-002', crop: 'Onion', variety: 'Nashik Red', quantity: 300, unit: 'kg',
    quality: 'A', farmerId: 'F002', aggregatorId: 'A001', retailerId: 'R002',
    status: 'AT_RETAILER',
    farmerPrice: 18, aggregatorPrice: 28, retailPrice: 45,
    harvestDate: '2026-04-12', location: 'Cuttack',
    certifications: ['Verified Origin'],
  },
  {
    id: 'BATCH-003', crop: 'Turmeric', variety: 'Lakadong', quantity: 200, unit: 'kg',
    quality: 'A+', farmerId: 'F001', aggregatorId: 'A002', retailerId: 'R001',
    status: 'SOLD',
    farmerPrice: 85, aggregatorPrice: 110, retailPrice: 160,
    harvestDate: '2026-04-08', location: 'Puri',
    certifications: ['Organic', 'GI Tagged'],
  },
  {
    id: 'BATCH-004', crop: 'Red Chili', variety: 'Guntur Sannam', quantity: 150, unit: 'kg',
    quality: 'A', farmerId: 'F003', aggregatorId: null, retailerId: null,
    status: 'HARVESTED',
    farmerPrice: 120, aggregatorPrice: null, retailPrice: null,
    harvestDate: '2026-04-20', location: 'Berhampur',
    certifications: [],
  },
  {
    id: 'BATCH-005', crop: 'Tomato', variety: 'Hybrid', quantity: 400, unit: 'kg',
    quality: 'B+', farmerId: 'F003', aggregatorId: 'A001', retailerId: null,
    status: 'AGGREGATED',
    farmerPrice: 15, aggregatorPrice: 22, retailPrice: null,
    harvestDate: '2026-04-18', location: 'Berhampur',
    certifications: ['Verified Origin'],
  },
  {
    id: 'BATCH-006', crop: 'Potato', variety: 'Kufri Jyoti', quantity: 800, unit: 'kg',
    quality: 'A', farmerId: 'F002', aggregatorId: 'A002', retailerId: 'R003',
    status: 'IN_TRANSIT',
    farmerPrice: 12, aggregatorPrice: 18, retailPrice: 28,
    harvestDate: '2026-04-15', location: 'Cuttack',
    certifications: [],
  },
  {
    id: 'BATCH-007', crop: 'Groundnut', variety: 'Bold', quantity: 250, unit: 'kg',
    quality: 'A+', farmerId: 'F004', aggregatorId: 'A001', retailerId: 'R001',
    status: 'SOLD',
    farmerPrice: 55, aggregatorPrice: 72, retailPrice: 95,
    harvestDate: '2026-04-05', location: 'Jeypore',
    certifications: ['Organic'],
  },
  {
    id: 'BATCH-008', crop: 'Rice', variety: 'Sona Masoori', quantity: 1000, unit: 'kg',
    quality: 'A', farmerId: 'F005', aggregatorId: 'A001', retailerId: 'R002',
    status: 'AT_RETAILER',
    farmerPrice: 28, aggregatorPrice: 36, retailPrice: 52,
    harvestDate: '2026-04-11', location: 'Koraput',
    certifications: ['Verified Origin'],
  },
];

// Seed transactions for blockchain
const SEED_TRANSACTIONS = [];
for (const batch of BATCHES) {
  const farmer = FARMERS.find(f => f.id === batch.farmerId);
  SEED_TRANSACTIONS.push({
    type: 'CREATE_BATCH', batchId: batch.id, crop: batch.crop,
    quantity: batch.quantity, quality: batch.quality,
    actor: farmer?.name || 'Unknown', role: 'Farmer',
    location: batch.location, price: batch.farmerPrice,
    timestamp: batch.harvestDate + 'T08:00:00Z'
  });

  if (batch.aggregatorId) {
    const agg = AGGREGATORS.find(a => a.id === batch.aggregatorId);
    SEED_TRANSACTIONS.push({
      type: 'TRANSFER_TO_AGGREGATOR', batchId: batch.id,
      actor: agg?.name || 'Unknown', role: 'Aggregator',
      from: farmer?.name, price: batch.aggregatorPrice,
      location: agg?.location,
      timestamp: new Date(new Date(batch.harvestDate).getTime() + 2 * 86400000).toISOString()
    });
  }

  if (batch.retailerId) {
    const ret = RETAILERS.find(r => r.id === batch.retailerId);
    SEED_TRANSACTIONS.push({
      type: 'TRANSFER_TO_RETAILER', batchId: batch.id,
      actor: ret?.name || 'Unknown', role: 'Retailer',
      price: batch.retailPrice, location: ret?.location,
      timestamp: new Date(new Date(batch.harvestDate).getTime() + 4 * 86400000).toISOString()
    });
  }

  if (batch.status === 'SOLD') {
    SEED_TRANSACTIONS.push({
      type: 'SOLD_TO_CONSUMER', batchId: batch.id,
      role: 'Consumer', location: batch.location,
      timestamp: new Date(new Date(batch.harvestDate).getTime() + 6 * 86400000).toISOString()
    });
  }
}

// Helper functions
function getFarmer(id) { return FARMERS.find(f => f.id === id); }
function getAggregator(id) { return AGGREGATORS.find(a => a.id === id); }
function getRetailer(id) { return RETAILERS.find(r => r.id === id); }
function getBatch(id) { return BATCHES.find(b => b.id === id); }
function getBatchesForFarmer(farmerId) { return BATCHES.filter(b => b.farmerId === farmerId); }
function getBatchesForAggregator(aggId) { return BATCHES.filter(b => b.aggregatorId === aggId); }
function getBatchesForRetailer(retId) { return BATCHES.filter(b => b.retailerId === retId); }
function getCropEmoji(crop) { return CROP_EMOJI[crop] || '🌿'; }

function calcFarmerShare(batch) {
  if (!batch.retailPrice) return batch.farmerPrice ? 100 : 0;
  return Math.round((batch.farmerPrice / batch.retailPrice) * 100);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function shortHash(hash) {
  if (!hash) return '...';
  return hash.substring(0, 8) + '...' + hash.substring(hash.length - 6);
}
