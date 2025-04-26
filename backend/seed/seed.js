const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    active: true
  },
  {
    username: 'user',
    password: 'user123',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    active: true
  }
];

const books = [
  {
    title: 'Introduction to Physics',
    author: 'Richard Feynman',
    serialNumber: 'SC(B)000001',
    category: 'Science',
    status: 'Available',
    type: 'Book',
    cost: 25.99,
    procurementDate: new Date('2023-01-15'),
    description: 'A comprehensive introduction to physics concepts',
    isAvailable: true
  },
  {
    title: 'Principles of Economics',
    author: 'N. Gregory Mankiw',
    serialNumber: 'EC(B)000001',
    category: 'Economics',
    status: 'Available',
    type: 'Book',
    cost: 32.50,
    procurementDate: new Date('2023-02-10'),
    description: 'Foundational text on economic principles',
    isAvailable: true
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    serialNumber: 'LI(B)000001',
    category: 'Literature',
    status: 'Available',
    type: 'Book',
    cost: 15.75,
    procurementDate: new Date('2023-03-05'),
    description: 'Classic American novel',
    isAvailable: true
  },
  {
    title: 'Interstellar',
    author: 'Christopher Nolan',
    serialNumber: 'SC(M)000001',
    category: 'Science Fiction',
    status: 'Available',
    type: 'Movie',
    cost: 18.99,
    procurementDate: new Date('2023-01-20'),
    description: 'A science fiction film about space exploration',
    isAvailable: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Membership.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
      console.log(`Created user: ${user.username}`);
    }
    
    // Create books
    for (const book of books) {
      await Book.create(book);
      console.log(`Created ${book.type}: ${book.title}`);
    }
    
    // Create memberships
    const regularUser = createdUsers.find(user => user.role === 'user');
    
    if (regularUser) {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
      
      await Membership.create({
        membershipNumber: 'M000001',
        user: regularUser._id,
        startDate: new Date(),
        endDate,
        status: 'Active',
        membershipType: 'Standard',
        fineAmount: 0
      });
      
      console.log('Created membership for regular user');
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 