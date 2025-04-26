const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Admin user data - with plain text password to be hashed by the model
const directAdmin = {
  username: 'directadmin',
  password: 'direct123',
  name: 'Direct Administrator',
  email: 'directadmin@library.com',
  role: 'admin',
  active: true
};

// Function to create admin user directly through Mongoose
const createDirectAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Delete existing user if it exists
    await User.findOneAndDelete({ username: directAdmin.username });
    console.log('Deleted any existing user with the same username');
    
    // Create new user and let Mongoose/pre-save hook handle the password hashing
    const user = new User(directAdmin);
    await user.save();
    
    console.log('Direct admin user created successfully');
    console.log(`Username: ${directAdmin.username}`);
    console.log(`Password: ${directAdmin.password} (this should be hashed in the database)`);
    
    // Now attempt to retrieve and verify the user
    const savedUser = await User.findOne({ username: directAdmin.username });
    console.log('\nRetrieved user from database:');
    console.log(`Username: ${savedUser.username}`);
    console.log(`Hashed password: ${savedUser.password}`);
    
    // Test login directly
    console.log('\nTesting password comparison directly:');
    const passwordMatch = await savedUser.comparePassword(directAdmin.password);
    console.log(`Password comparison result: ${passwordMatch}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating direct admin:', error);
    process.exit(1);
  }
};

// Run the function
createDirectAdmin(); 