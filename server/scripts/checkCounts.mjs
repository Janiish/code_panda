import connectDB from '../config/db.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Block from '../models/Block.js';

(async () => {
  await connectDB();
  const users = await User.countDocuments();
  const batches = await Batch.countDocuments();
  const blocks = await Block.countDocuments();
  console.log('counts:', { users, batches, blocks });
  process.exit(0);
})();