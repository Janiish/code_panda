import mongoose from 'mongoose';
import crypto from 'crypto';

const blockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  previousHash: { type: String, required: true },
  hash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
});

blockSchema.statics.calcHash = function (index, prevHash, timestamp, data, nonce = 0) {
  const str = `${index}${prevHash}${timestamp}${JSON.stringify(data)}${nonce}`;
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
};

blockSchema.statics.addBlock = async function (data) {
  const lastBlock = await this.findOne().sort({ index: -1 });
  const index = lastBlock ? lastBlock.index + 1 : 0;
  const previousHash = lastBlock ? lastBlock.hash : '0x' + '0'.repeat(64);
  const timestamp = new Date().toISOString();
  const hash = this.calcHash(index, previousHash, timestamp, data);
  return this.create({ index, timestamp, data, previousHash, hash });
};

export default mongoose.model('Block', blockSchema);
