const mongoose = require("mongoose");

const AddUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  branch: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  access: {
    type: [String],
    required: true,
  },
  isUserLogin: { type: Boolean, default: false }, // Tracks if the user is logged in
  isForceLogout: { type: Boolean, default: false }, // Tracks if the user is forced to logout
  lastLogin: { type: Date, default: Date.now },
  sessionExpiresAt: { type: Date },
});

const AddUser = mongoose.model("adduser", AddUserSchema);
module.exports = AddUser;
