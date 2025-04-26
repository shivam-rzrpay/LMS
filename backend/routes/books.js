const express = require('express');
const Book = require('../models/Book');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { title, author, category, status, type, available } = req.query;
    
    // Build query object
    const query = {};
    
    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (status) query.status = status;
    if (type) query.type = type;
    if (available === 'true') query.isAvailable = true;
    if (available === 'false') query.isAvailable = false;
    
    const books = await Book.find(query).sort({ title: 1 });
    
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/:id
// @desc    Get a single book by id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Create a new book
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      title,
      author,
      serialNumber,
      category,
      status,
      type,
      cost,
      procurementDate,
      description
    } = req.body;
    
    // Check if book with serial number already exists
    const bookExists = await Book.findOne({ serialNumber });
    
    if (bookExists) {
      return res.status(400).json({ message: 'A book with that serial number already exists' });
    }
    
    const book = await Book.create({
      title,
      author,
      serialNumber,
      category,
      status: status || 'Available',
      type: type || 'Book',
      cost,
      procurementDate: procurementDate || Date.now(),
      description,
      isAvailable: status === 'Available'
    });
    
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const {
      title,
      author,
      serialNumber,
      category,
      status,
      type,
      cost,
      procurementDate,
      description
    } = req.body;
    
    // Check if serial number is changed and already exists
    if (serialNumber && serialNumber !== book.serialNumber) {
      const bookWithSerial = await Book.findOne({ serialNumber });
      
      if (bookWithSerial) {
        return res.status(400).json({ message: 'A book with that serial number already exists' });
      }
    }
    
    book.title = title || book.title;
    book.author = author || book.author;
    book.serialNumber = serialNumber || book.serialNumber;
    book.category = category || book.category;
    book.status = status || book.status;
    book.type = type || book.type;
    book.cost = cost || book.cost;
    book.procurementDate = procurementDate || book.procurementDate;
    book.description = description || book.description;
    book.isAvailable = status === 'Available';
    
    const updatedBook = await book.save();
    
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    await book.deleteOne();
    
    res.json({ message: 'Book removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/check/:serialNumber
// @desc    Check if a book is available
// @access  Public
router.get('/check/:serialNumber', async (req, res) => {
  try {
    const book = await Book.findOne({ serialNumber: req.params.serialNumber });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({
      book,
      isAvailable: book.isAvailable
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 