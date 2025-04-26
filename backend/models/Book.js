const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Available', 'Issued', 'Under Maintenance', 'Lost'],
    default: 'Available'
  },
  type: {
    type: String,
    enum: ['Book', 'Movie'],
    default: 'Book'
  },
  cost: {
    type: Number,
    required: true
  },
  procurementDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Book', BookSchema); 