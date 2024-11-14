const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductCategory', // Refers to itself for hierarchical categories
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: false,
    trim: true,
  },
  isPastryProduct: {
    type: Boolean,
    default: false,
  },
});
const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);
module.exports = ProductCategory;
