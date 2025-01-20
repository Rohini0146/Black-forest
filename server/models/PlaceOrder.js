const mongoose = require('mongoose');

const PlaceOrderSchema = new mongoose.Schema({
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      orderId: { type: String, required: true },
      sendingQty: { type: Number, default: 0 }, // Add sendingQty
      status: { type: String, default: "Not Started" }, // Add status
    },
  ],
  totalAmount: { type: Number, required: true },
  isStockOrder: { type: Boolean, default: false },
  deliveryDate: Date,
  deliveryTime: String,
  branch: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PlaceOrder = mongoose.model('PlaceOrder', PlaceOrderSchema, 'placeorders');
module.exports = PlaceOrder;