const mongoose = require('mongoose');

const PastrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number, // Update to Number to ensure price calculations work properly
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory', // Correct reference to ProductCategory
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowGST: {
    type: Boolean,
    default: false
  },
  cess: {
    type: Number,
    default: 0
  },
  cgst: {
    type: Number,
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  code: {
    type: String,
    required: true
  }
});

const Pastry = mongoose.model('Pastry', PastrySchema);
module.exports = Pastry;
