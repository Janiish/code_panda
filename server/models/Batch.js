import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  crop: { type: String, required: true },
  cropType: { type: String, default: '' },
  variety: { type: String, default: '' },
  quantity: { type: Number, required: true },
  quantityInQuintals: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  quality: { type: String, default: 'A' },
  moistureLevel: { type: Number, min: 0, max: 100, default: null },
  farmerAadhaarId: { type: String, default: '' },
  farmerAadhaarMock: { type: String, default: '' },
  landCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    source: { type: String, default: 'EOSDA Satellite API (Mock)' },
  },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aggregatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['HARVESTED', 'AGGREGATED', 'IN_TRANSIT', 'AT_RETAILER', 'SOLD'],
    default: 'HARVESTED'
  },
  farmerPrice: { type: Number, required: true },
  aggregatorPrice: { type: Number, default: null },
  retailPrice: { type: Number, default: null },
  harvestDate: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  certifications: [String],
}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);
