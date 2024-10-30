

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
   
});

const UserModel = mongoose.model("orderstatus", UserSchema);
module.exports = UserModel;
