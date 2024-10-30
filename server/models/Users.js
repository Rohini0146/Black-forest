// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" },  // You can also add roles like "user" or "subscriber"
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
