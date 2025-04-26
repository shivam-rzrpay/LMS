const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const membershipRoutes = require('./routes/memberships');
const transactionRoutes = require('./routes/transactions');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB and ensure admin user exists
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check if admin user exists
    try {
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      if (adminCount === 0) {
        console.log('No admin user found. Creating default admin user...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await User.create({
          username: 'admin',
          password: hashedPassword,
          name: 'Administrator',
          email: 'admin@library.com',
          role: 'admin',
          active: true
        });
        
        console.log('Default admin user created:');
        console.log('Username: admin');
        console.log('Password: admin123');
      } else {
        console.log('Admin user(s) already exist');
      }
    } catch (error) {
      console.error('Error checking/creating admin user:', error);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 