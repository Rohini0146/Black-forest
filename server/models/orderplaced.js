const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  inStockQuantity: { type: Number, required: true },
  orderId: { type: String, required: true }, // Added orderId
  sendingQty: { type: Number, default: 0 }, // Default sendingQty to 0
  status: { type: String, enum: ['Not Started', 'Order Taken', 'Preparing', 'Done'], default: 'Not Started' }, // Enum for predefined status options
});

const OrderPlacedSchema = new Schema({
  products: [ProductSchema], // Array of products with individual product schema
  totalAmount: { type: Number, required: true },
  isStockOrder: { type: Number, default: false },
  deliveryDate: { type: Date },
  deliveryTime: { type: String },
  branch: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const OrderPlaced = mongoose.model("OrderPlaced", OrderPlacedSchema);

module.exports = OrderPlaced;
