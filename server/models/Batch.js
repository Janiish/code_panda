import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  cropType: { type: String, required: true },
  variety: { type: String, default: '' },
  quantityInQuintals: { type: Number, default: 0 },
  moistureLevel: { type: Number, default: null },
  qualityFlags: {
    moistureBand: { type: String, enum: ['LOW', 'OK', 'HIGH'], default: 'OK' },
    adulterationRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' }
  },
  featureHash: { type: String, default: '' },
  zkProof: { type: String, default: '' },
  syncStatus: { type: String, enum: ['PENDING_SYNC', 'ONCHAIN_CONFIRMED'], default: 'ONCHAIN_CONFIRMED' },
  farmerAadhaarId: { type: String, default: '' },
  farmerAadhaarMock: { type: String, default: '' },
  landCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    source: { type: String, default: 'EOSDA Satellite API' },
  },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['HARVESTED', 'AGGREGATED', 'IN_TRANSIT', 'AT_RETAILER', 'SOLD'],
    default: 'HARVESTED'
  },
  farmerPrice: { type: Number, required: true },
  retailPrice: { type: Number, default: null },
  aggregatorPrice: { type: Number, default: null },
  harvestDate: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  certifications: [String],
}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);
