const express = require('express');
const Membership = require('../models/Membership');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/memberships
// @desc    Get all memberships
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Only admins can see all memberships
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all memberships' });
    }
    
    const memberships = await Membership.find({}).populate('user', 'name email username');
    res.json(memberships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/memberships/user/:userId
// @desc    Get memberships for a specific user
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Users can only see their own memberships, admins can see any
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view these memberships' });
    }
    
    const memberships = await Membership.find({ user: req.params.userId }).populate('user', 'name email username');
    res.json(memberships);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/memberships/:id
// @desc    Get a single membership
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id).populate('user', 'name email username');
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    // Users can only see their own memberships, admins can see any
    if (req.user.role !== 'admin' && req.user._id.toString() !== membership.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this membership' });
    }
    
    res.json(membership);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/memberships
// @desc    Create a new membership
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      membershipNumber,
      user,
      startDate,
      endDate,
      status,
      membershipType
    } = req.body;
    
    // Check if membership with number already exists
    const membershipExists = await Membership.findOne({ membershipNumber });
    
    if (membershipExists) {
      return res.status(400).json({ message: 'A membership with that number already exists' });
    }
    
    const membership = await Membership.create({
      membershipNumber,
      user,
      startDate: startDate || Date.now(),
      endDate,
      status: status || 'Active',
      membershipType: membershipType || 'Standard',
      fineAmount: 0
    });
    
    res.status(201).json(await membership.populate('user', 'name email username'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/memberships/:id
// @desc    Update a membership
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    const {
      membershipNumber,
      startDate,
      endDate,
      status,
      membershipType,
      fineAmount
    } = req.body;
    
    // Check if membership number is changed and already exists
    if (membershipNumber && membershipNumber !== membership.membershipNumber) {
      const membershipWithNumber = await Membership.findOne({ membershipNumber });
      
      if (membershipWithNumber) {
        return res.status(400).json({ message: 'A membership with that number already exists' });
      }
    }
    
    membership.membershipNumber = membershipNumber || membership.membershipNumber;
    membership.startDate = startDate || membership.startDate;
    membership.endDate = endDate || membership.endDate;
    membership.status = status || membership.status;
    membership.membershipType = membershipType || membership.membershipType;
    membership.fineAmount = fineAmount !== undefined ? fineAmount : membership.fineAmount;
    
    const updatedMembership = await membership.save();
    
    res.json(await updatedMembership.populate('user', 'name email username'));
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/memberships/:id
// @desc    Delete a membership
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    
    await membership.deleteOne();
    
    res.json({ message: 'Membership removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 