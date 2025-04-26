const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Admin user data
const adminData = {
  username: 'admin',
  password: 'admin123',
  name: 'Administrator',
  email: 'admin@library.com',
  role: 'admin',
  active: true
};

// Function to create admin user
const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: adminData.username });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    const adminUser = await User.create({
      ...adminData,
      password: hashedPassword
    });
    
    console.log('Admin user created successfully:');
    console.log(`Username: ${adminData.username}`);
    console.log(`Password: ${adminData.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdminUser(); 