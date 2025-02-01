const mongoose = require('mongoose');

const productUnitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure unique units
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const ProductUnit = mongoose.model('ProductUnit', productUnitSchema);

module.exports = ProductUnit;
