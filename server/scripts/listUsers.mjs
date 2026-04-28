import connectDB from '../config/db.js';
import User from '../models/User.js';

(async () => {
  await connectDB();
  const users = await User.find().select('name role location');
  console.log('users:');
  users.forEach(u => console.log(u._id.toString(), '|', u.name, '|', u.role, '|', u.location));
  process.exit(0);
})();