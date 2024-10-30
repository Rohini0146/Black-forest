const mongoose = require('mongoose');

const LoginDataSchema = new mongoose.Schema({
  EmployeeID: {
    type: String,
    required: true,
  },
  loginTime: {
    type: Date,
    default: Date.now, // Automatically set the current date
  },
  userAgent: {
    type: String,
    required: true,
  },
});

const LoginDataModel = mongoose.model("userdatas", LoginDataSchema); // This stores data in the `userdatas` collection
module.exports = LoginDataModel;
