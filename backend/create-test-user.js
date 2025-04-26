const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Simple user schema for this script
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  email: String,
  role: String,
  active: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

const createTestUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user with manually hashed password
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('admin123', adminSalt);
    
    const admin = await User.create({
      username: 'admin',
      password: adminHashedPassword,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      active: true,
      createdAt: new Date()
    });
    
    console.log('Created admin user:', admin);
    
    // Create regular user
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash('user123', userSalt);
    
    const regularUser = await User.create({
      username: 'user',
      password: userHashedPassword,
      name: 'Regular User',
      email: 'user@example.com',
      role: 'user',
      active: true,
      createdAt: new Date()
    });
    
    console.log('Created regular user:', regularUser);
    
    // Test password comparison
    const adminUser = await User.findOne({ username: 'admin' });
    const isAdminPasswordValid = await bcrypt.compare('admin123', adminUser.password);
    console.log('Admin password validation test:', isAdminPasswordValid);
    
    const normalUser = await User.findOne({ username: 'user' });
    const isUserPasswordValid = await bcrypt.compare('user123', normalUser.password);
    console.log('User password validation test:', isUserPasswordValid);
    
    console.log('Test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers(); 