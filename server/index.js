const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const LoginDataModel = require("./models/LoginData");
const OrderModel = require("./models/Orders");
const stores = require("./models/Stores");
const status = require("./models/OrderStatus");
const AddUser = require("./models/AddUser");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  cors({
    origin: ["http://43.205.54.210", "http://yourdomain.com"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
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


//stockuser
app.post("/adduser", async (req, res) => {
  try {
    const newUser = new AddUser(req.body);
    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res
        .status(400)
        .json({
          message:
            "Username already exists. Please choose a different username.",
        });
    } else {
      res
        .status(500)
        .json({ message: "Error creating user. Please try again." });
    }
  }
});

// Get all users from addusers collection
app.get("/addusers", async (req, res) => {
  try {
    const users = await AddUser.find(); // Make sure it's referencing AddUser (the model that uses 'addusers' collection)
    res.status(200).json(users); // Send the users as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users. Please try again." });
  }
});

app.put("/addusers/:id/forceLogout", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await AddUser.findByIdAndUpdate(
      id,
      { forceLogout: true },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User has been forcefully logged out" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Error logging out user" });
  }
});

// API Routes
// app.post("/login") route without session expiry logic
// POST /login - Login route with session expiration time
// POST /login - Login route with session expiration time
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await AddUser.findOne({ username, password });

    if (user) {
      // Prevent login if the user is forcefully logged out
      if (user.isForceLogout) {
        return res.status(403).json({
          message: "Your account has been forcefully logged out. Please contact admin.",
        });
      }

      // Set isUserLogin to true when the user logs in
      user.isUserLogin = true;
      user.lastLogin = new Date();

      // Set session expiry to 10 seconds
      const sessionExpiryTime = new Date();
      sessionExpiryTime.setSeconds(sessionExpiryTime.getSeconds() + 10); // Set expiry to 10 seconds
      user.sessionExpiresAt = sessionExpiryTime;

      await user.save(); // Save the updated user data

      // Return user details with access levels
      res.status(200).json("Login Successful");
    } else {
      res.status(401).json({ message: "Invalid username or password. Please try again." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});



// Middleware to check session expiry
// Middleware to check session expiry
const checkSessionExpiry = async (req, res, next) => {
  const { username } = req.body;

  try {
    const user = await AddUser.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is force-logged out or session expired
    if (user.isForceLogout || (user.sessionExpiresAt && new Date() > new Date(user.sessionExpiresAt))) {
      // Session has expired, force logout
      user.isUserLogin = false;
      user.sessionExpiresAt = null; // Clear session expiry time
      await user.save(); // Save the updated user data

      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    // If the session is still valid, continue to the route
    next();
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({ message: "Error checking session" });
  }
};


// Example of applying the session expiry check
app.get("/some-protected-route", checkSessionExpiry, (req, res) => {
  res.status(200).json({ message: "You have access to this protected route." });
});




// Logout endpoint (can be called when the user logs out normally)
// Logout route for manual logout
app.post("/logout", async (req, res) => {
  try {
    const { username } = req.body;

    const user = await AddUser.findOne({ username });

    if (user) {
      // Set isUserLogin to false and clear session expiry on manual logout
      user.isUserLogin = false;
      user.sessionExpiresAt = null;
      await user.save();

      res.status(200).json({ message: "User logged out successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
});

// Force logout route for admin-initiated logout with timer
app.put("/addusers/forceLogout", async (req, res) => {
  try {
    const { username } = req.body;  // Receiving username in the request body

    // Find the user by username
    const user = await AddUser.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as logged out and force logout
    user.isUserLogin = false;         // Mark user as logged out
    user.isForceLogout = true;        // Set flag to true indicating forced logout
    user.sessionExpiresAt = null;     // If using sessions, clear session expiry time

    await user.save();
    console.log(`User ${username} has been forcefully logged out`);

    res.status(200).json({ message: "User has been forcefully logged out." });
  } catch (error) {
    console.error("Error during force logout:", error);
    res.status(500).json({ message: "Error logging out user" });
  }
});




// Update user details by username (or by ID)
app.put("/addusers/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const updateFields = req.body;

    // Handle the access array update separately to prevent overwriting
    const accessUpdate = {};
    if (updateFields.access && Array.isArray(updateFields.access)) {
      const cleanedAccess = updateFields.access.filter((item) => item !== "");
      accessUpdate.$set = { access: cleanedAccess }; // Ensure access is replaced only if updated
      delete updateFields.access;
    }

    // Combine field updates with access updates, if present
    const updatedUser = await AddUser.findOneAndUpdate(
      { username },
      { $set: updateFields, ...accessUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Get user access data
app.get("/addusers/:username/access", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await AddUser.findOne({ username }, "access");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ access: user.access });
  } catch (error) {
    console.error("Error fetching access data:", error);
    res.status(500).json({ message: "Error fetching access data" });
  }
});

// Get user details by username
app.get("/addusers/:username", async (req, res) => {
  try {
    const user = await AddUser.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// API to fetch user details by username (for access and role after login)
app.get("/getUserByUsername/:username", async (req, res) => {
  try {
    const user = await AddUser.findOne({ username: req.params.username });
    if (user) {
      res.status(200).json(user); // Return the user details with access levels
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const newEmployee = await EmployeeModel.create(req.body);
    res.json({ message: "Employee created successfully", data: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);
    res
      .status(500)
      .json({ error: "Failed to create employee", details: error });
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://43.205.54.210:${PORT}`);
});
