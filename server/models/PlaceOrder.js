const mongoose = require('mongoose');

const PlaceOrderSchema = new mongoose.Schema({
  products: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  isStockOrder: Boolean,
  deliveryDate: Date,
  deliveryTime: String,
  createdAt: { type: Date, default: Date.now },
});
  

const PlaceOrder = mongoose.model('PlaceOrder', PlaceOrderSchema, 'placeorders');
module.exports = PlaceOrder;
