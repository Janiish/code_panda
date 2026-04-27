import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['farmer', 'aggregator', 'retailer', 'consumer'], required: true },
  location: { type: String, default: '' },
  wallet: { type: String, default: '' },
  aadhaarHash: { type: String, default: '', unique: true, sparse: true },
  avatar: { type: String, default: '👤' },
  crops: [String],
  type: { type: String, default: '' },
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
