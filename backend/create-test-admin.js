const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test admin user data
const testAdmin = {
  username: 'testadmin',
  password: 'test123',
  name: 'Test Administrator',
  email: 'testadmin@library.com',
  role: 'admin',
  active: true
};

// Function to create test admin user and test login
const createAndTestAdmin = async () => {
  let connection;
  
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Delete test admin if it already exists
    await User.findOneAndDelete({ username: testAdmin.username });
    console.log(`Deleted existing test admin user if it existed`);
    
    // Create unhashed password for login test
    const plainPassword = testAdmin.password;
    
    // Create admin user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testAdmin.password, salt);
    
    const adminUser = await User.create({
      ...testAdmin,
      password: hashedPassword
    });
    
    console.log('Test admin user created successfully:');
    console.log(`Username: ${testAdmin.username}`);
    console.log(`Password: ${plainPassword} (unhashed)`);
    console.log(`Hashed password in DB: ${adminUser.password}`);
    
    // Test login directly with comparePassword method
    const passwordMatch = await adminUser.comparePassword(plainPassword);
    console.log(`\nDirect password comparison result: ${passwordMatch}`);
    
    // Test login via API
    try {
      console.log('\nAttempting API login...');
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        username: testAdmin.username,
        password: plainPassword
      });
      
      console.log('API Login successful!');
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    } catch (error) {
      console.error('API Login failed:');
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
    }
    
  } catch (error) {
    console.error('Error in create and test admin process:', error);
  } finally {
    // Close the database connection
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
    process.exit(0);
  }
};

// Run the function
createAndTestAdmin(); 