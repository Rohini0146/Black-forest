const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const LoginDataModel = require("./models/LoginData");
const OrderModel = require("./models/Orders");
const stores = require("./models/Stores");
const status = require("./models/OrderStatus");
const AddUser = require("./models/AddUser")
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: ['http://43.205.54.210', 'http://yourdomain.com']
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://muskdeer:muskdeer123@cluster0.mg0yr.mongodb.net/employee?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  
  app.post('/adduser', async (req, res) => {
    try {
      const newUser = new AddUser(req.body);
      await newUser.save();
      res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
      } else {
        res.status(500).json({ message: 'Error creating user. Please try again.' });
      }
    }
  });

  

// API Routes
app.post("/login", async (req, res) => {
  try {
    const { username, password, mobileNumber, role } = req.body;
    
    // Validate against the database
    const user = await AddUser.findOne({ 
      username, 
      password, 
      mobileNumber, 
      type: role 
    });
    
    if (user) {
      res.status(200).json("Login Successful");
    } else {
      res.status(401).json("Invalid credentials. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json("Error during login");
  }
});


app.post("/signup", async (req, res) => {
  try {
    const newEmployee = await EmployeeModel.create(req.body);
    res.json({ message: "Employee created successfully", data: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Failed to create employee", details: error });
  }
});




app.post("/order", async (req, res) => {
  try {
    const newOrder = {
      ...req.body,
      customerID: Math.floor(100000 + Math.random() * 900000),
    };
    const createdOrder = await OrderModel.create(newOrder);
    res.json({ message: "Order created successfully", data: createdOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", details: error });
  }
});

// server.js
app.get("/orders", async (req, res) => {
  const limit = parseInt(req.query.limit) || undefined;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const dateField = req.query.dateField || "created_at"; // Default to "created_at" if dateField is not specified

  let filterQuery = {};

  if (startDate && endDate) {
    filterQuery[dateField] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    const orders = await OrderModel.find(filterQuery)
      .sort({ [dateField]: -1 }) // Sort by the selected date field
      .limit(limit);

    const totalOrders = await OrderModel.countDocuments(filterQuery);

    res.status(200).json({ orders, total: totalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});







app.get("/userdatas", async (req, res) => {
  try {
    const userDataLogs = await LoginDataModel.find().sort({ loginTime: -1 }); // Sort by loginTime descending
    res.status(200).json(userDataLogs);
  } catch (error) {
    console.error("Error fetching user datas:", error);
    res.status(500).json({ error: "Failed to fetch user datas" });
  }
});


app.get("/stores", async (req, res) => {
  try {
    const storeList = await stores.find().sort({ createdAt: -1 });
    res.json(storeList);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});


app.get("/orderstatus", async (req, res) => {
  try {
    const orderStatus = await status.find().sort({ createdAt: -1 });
    res.json(orderStatus);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});


app.put("/orders/:id/response", async (req, res) => {
  try {
    const { response } = req.body;
    const { id } = req.params;

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { response },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Response updated successfully", data: updatedOrder });
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Failed to update response" });
  }
});


// Route to fetch a single employee by EmployeeID
app.get("/employees/:employeeId", async (req, res) => {
  try {
    const employeeId = req.params.employeeId; // Get EmployeeID from URL params
    const employee = await EmployeeModel.findOne({ EmployeeID: employeeId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});



// Start the server
const PORT = process.env.PORT || 3001;

// Change 'localhost' to '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://43.205.54.210:${PORT}`);
});