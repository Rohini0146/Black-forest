// models/Stores.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  value: { type: Number, required: true },
  // Add other relevant fields based on your live database
  createdAt: { type: Date, default: Date.now }
}, { strict: true }); // Enforce schema strictness

const Store = mongoose.model('Store', StoreSchema, 'stores');
module.exports = Store;
