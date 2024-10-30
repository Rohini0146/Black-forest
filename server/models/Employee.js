const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    EmployeeID: String,
    FirstName: String,
    LastName: String,
    BranchLocation: String,
    phonenumber: String,
    verificationCode: String,
});


const EmployeeModel = mongoose.model("employees", EmployeeSchema);
module.exports = EmployeeModel;





