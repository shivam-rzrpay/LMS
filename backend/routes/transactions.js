const express = require('express');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate fine
const calculateFine = (returnDate, actualReturnDate) => {
  if (!actualReturnDate) return 0;
  
  const dueDate = new Date(returnDate);
  const returnedDate = new Date(actualReturnDate);
  
  if (returnedDate <= dueDate) return 0;
  
  // Calculate days overdue
  const daysOverdue = Math.ceil((returnedDate - dueDate) / (1000 * 60 * 60 * 24));
  
  // Fine rate: $1 per day overdue
  return daysOverdue * 1;
};

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Apply query filters
    const { status, type, bookId, membershipId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.transactionType = type;
    if (bookId) query.book = bookId;
    if (membershipId) query.membership = membershipId;
    
    // Only admins can see all transactions
    if (req.user.role !== 'admin') {
      const memberships = await Membership.find({ user: req.user._id });
      const membershipIds = memberships.map(m => m._id);
      query.membership = { $in: membershipIds };
    }
    
    const transactions = await Transaction.find(query)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/active
// @desc    Get active transactions (books currently issued)
// @access  Private
router.get('/active', protect, async (req, res) => {
  try {
    const query = { status: 'Active' };
    
    // Regular users can only see their own transactions
    if (req.user.role !== 'admin') {
      const memberships = await Membership.find({ user: req.user._id });
      const membershipIds = memberships.map(m => m._id);
      query.membership = { $in: membershipIds };
    }
    
    const transactions = await Transaction.find(query)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      })
      .sort({ returnDate: 1 });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/overdue
// @desc    Get overdue transactions
// @access  Private
router.get('/overdue', protect, async (req, res) => {
  try {
    const query = { status: 'Overdue' };
    
    // Regular users can only see their own transactions
    if (req.user.role !== 'admin') {
      const memberships = await Membership.find({ user: req.user._id });
      const membershipIds = memberships.map(m => m._id);
      query.membership = { $in: membershipIds };
    }
    
    const currentDate = new Date();
    
    // Get active transactions that are past their return date
    const activeQuery = { 
      status: 'Active', 
      returnDate: { $lt: currentDate }
    };
    
    if (req.user.role !== 'admin') {
      const memberships = await Membership.find({ user: req.user._id });
      const membershipIds = memberships.map(m => m._id);
      activeQuery.membership = { $in: membershipIds };
    }
    
    // Find explicitly marked overdue transactions
    const overdueTransactions = await Transaction.find(query)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
    
    // Find active transactions that are past due date
    const lateActiveTransactions = await Transaction.find(activeQuery)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
      
    // Combine both result sets
    const allOverdueTransactions = [...overdueTransactions, ...lateActiveTransactions];
    
    // Calculate fine for each transaction
    const transactionsWithFine = allOverdueTransactions.map(transaction => {
      const fine = calculateFine(transaction.returnDate, currentDate);
      return {
        ...transaction._doc,
        calculatedFine: fine
      };
    });
    
    res.json(transactionsWithFine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get a single transaction
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Users can only see their own transactions
    if (
      req.user.role !== 'admin' && 
      transaction.membership.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/issue
// @desc    Issue a book
// @access  Private
router.post('/issue', protect, async (req, res) => {
  try {
    const { bookId, membershipId, returnDate } = req.body;
    
    // Validate input
    if (!bookId || !membershipId || !returnDate) {
      return res.status(400).json({ message: 'Please provide book ID, membership ID, and return date' });
    }
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (!book.isAvailable || book.status !== 'Available') {
      return res.status(400).json({ message: 'Book is not available for issue' });
    }
    
    // Check if membership exists and is active
    const membership = await Membership.findById(membershipId);
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    if (membership.status !== 'Active') {
      return res.status(400).json({ message: 'Membership is not active' });
    }
    
    // Regular users can only issue books for their own memberships
    if (
      req.user.role !== 'admin' && 
      membership.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to issue book for this membership' });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      book: bookId,
      membership: membershipId,
      issueDate: Date.now(),
      returnDate,
      status: 'Active',
      transactionType: 'Issue',
      createdBy: req.user._id
    });
    
    // Update book status
    book.isAvailable = false;
    book.status = 'Issued';
    await book.save();
    
    // Return transaction with populated fields
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/return
// @desc    Return a book
// @access  Private
router.post('/return', protect, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Validate input
    if (!transactionId) {
      return res.status(400).json({ message: 'Please provide transaction ID' });
    }
    
    // Find transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status === 'Returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }
    
    // Get membership and book details
    const membership = await Membership.findById(transaction.membership);
    const book = await Book.findById(transaction.book);
    
    if (!membership || !book) {
      return res.status(404).json({ message: 'Membership or book not found' });
    }
    
    // Regular users can only return their own books
    if (
      req.user.role !== 'admin' && 
      membership.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to return this book' });
    }
    
    // Update transaction
    const actualReturnDate = new Date();
    transaction.actualReturnDate = actualReturnDate;
    transaction.status = 'Returned';
    
    // Calculate fine if returned late
    const fine = calculateFine(transaction.returnDate, actualReturnDate);
    transaction.fine = fine;
    
    // If fine exists, update membership fine amount
    if (fine > 0) {
      membership.fineAmount += fine;
      await membership.save();
    }
    
    await transaction.save();
    
    // Update book status
    book.isAvailable = true;
    book.status = 'Available';
    await book.save();
    
    // Return transaction with populated fields
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user fineAmount',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
    
    res.json(populatedTransaction);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/payfine
// @desc    Pay fine for a transaction
// @access  Private
router.post('/payfine', protect, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    
    // Validate input
    if (!transactionId) {
      return res.status(400).json({ message: 'Please provide transaction ID' });
    }
    
    // Find transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.finePaid) {
      return res.status(400).json({ message: 'Fine already paid for this transaction' });
    }
    
    if (transaction.fine <= 0) {
      return res.status(400).json({ message: 'No fine to pay for this transaction' });
    }
    
    // Get membership
    const membership = await Membership.findById(transaction.membership);
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    // Regular users can only pay fines for their own transactions
    if (
      req.user.role !== 'admin' && 
      membership.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to pay fine for this transaction' });
    }
    
    // Update transaction
    transaction.finePaid = true;
    transaction.transactionType = 'PayFine';
    await transaction.save();
    
    // Update membership fine amount
    membership.fineAmount -= transaction.fine;
    if (membership.fineAmount < 0) membership.fineAmount = 0;
    await membership.save();
    
    // Create a fine payment transaction
    const fineTransaction = await Transaction.create({
      book: transaction.book,
      membership: transaction.membership,
      issueDate: Date.now(),
      returnDate: Date.now(),
      actualReturnDate: Date.now(),
      status: 'Returned',
      fine: -transaction.fine, // Negative to indicate payment
      finePaid: true,
      transactionType: 'PayFine',
      createdBy: req.user._id
    });
    
    // Return transaction with populated fields
    const populatedTransaction = await Transaction.findById(fineTransaction._id)
      .populate('book', 'title author serialNumber')
      .populate({
        path: 'membership',
        select: 'membershipNumber user fineAmount',
        populate: {
          path: 'user',
          select: 'name email username'
        }
      });
    
    res.json(populatedTransaction);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 