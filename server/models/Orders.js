// models/Orders.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    response: { type: String, default: "" },
    notes: { type: String, default: "" }
}); 

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;
