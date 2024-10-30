const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const EmployeeModel = require("./models/Employee");
const LoginDataModel = require("./models/LoginData");
const OrderModel = require("./models/Orders");
const stores = require("./models/Stores");
const status = require("./models/OrderStatus");
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

// API Routes
app.post("/login", async (req, res) => {
  try {
    const { EmployeeID } = req.body;
    const userAgent = req.headers["user-agent"];
    const currentDateIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    const employee = await EmployeeModel.findOne({
      EmployeeID: new RegExp(EmployeeID, "i"),
    });
    if (!employee) return res.status(401).json("Invalid Employee ID");

    await LoginDataModel.create({
      EmployeeID: employee.EmployeeID,
      loginTime: currentDateIST,
      userAgent,
    });

    res.json("Login Successful");
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

  let filterQuery = {};

  if (startDate && endDate) {
    filterQuery.created_at = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    const orders = await OrderModel.find(filterQuery)
      .sort({ created_at: -1 })
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

app.get("/employees", async (req, res) => {
  try {
    const employees = await EmployeeModel.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


// Start the server
const PORT = process.env.PORT || 3001;

// Change 'localhost' to '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://43.205.54.210:${PORT}`);
});