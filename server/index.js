const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const LoginDataModel = require("./models/LoginData");
const OrderModel = require("./models/Orders");
const stores = require("./models/Stores");
const status = require("./models/OrderStatus");
const AddUser = require("./models/AddUser");
const ProductCategory = require("./models/ProductCategories");
const Pastry = require("./models/Pastry");
const PlaceOrder = require("./models/PlaceOrder");
const OrderPlaced = require("./models/orderplaced");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  cors({
    origin: ["http://64.227.145.104", "http://yourdomain.com"],
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
      res.status(400).json({
        message: "Username already exists. Please choose a different username.",
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
          message:
            "Your account has been forcefully logged out. Please contact admin.",
        });
      }

      // Set isUserLogin to true when the user logs in
      user.isUserLogin = true;
      user.lastLogin = new Date();

      // Set session expiry to 10 minutes (as per usual practice)
      const sessionExpiryTime = new Date();
      sessionExpiryTime.setMinutes(sessionExpiryTime.getMinutes() + 10); // Set expiry to 10 minutes
      user.sessionExpiresAt = sessionExpiryTime;

      await user.save(); // Save the updated user data

      // Return user details with access levels
      res.status(200).json("Login Successful");
    } else {
      res
        .status(401)
        .json({ message: "Invalid username or password. Please try again." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Logout endpoint (can be called when the user logs out normally)
// Logout route for manual logout
app.post("/logout", async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user in the database
    const user = await AddUser.findOne({ username });

    if (user) {
      // Set isUserLogin to false and clear session expiry on manual logout
      user.isUserLogin = false;
      user.sessionExpiresAt = null; // Optional: Clear session expiry if needed
      await user.save(); // Save changes to the user

      // Respond with success
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
    const { username } = req.body; // Receiving username in the request body

    // Find the user by username
    const user = await AddUser.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as logged out and force logout
    user.isUserLogin = false; // Mark user as logged out
    user.isForceLogout = true; // Set flag to true indicating forced logout
    user.sessionExpiresAt = null; // If using sessions, clear session expiry time

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

app.get("/productcategories", async (req, res) => {
  try {
    const productcategoriesList = await ProductCategory.find().sort({
      created_at: -1,
    });
    res.json(productcategoriesList);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    res.status(500).json({ error: "Failed to fetch product categories" });
  }
});

app.get("/pastries", async (req, res) => {
  try {
    const pastriesList = await Pastry.find()
      .populate("category")
      .sort({ created_at: -1 });
    res.json(pastriesList);
  } catch (error) {
    console.error("Error fetching pastries:", error);
    res.status(500).json({ error: "Failed to fetch pastries" });
  }
});

// Backend to filter orders by orderDate and deliveryDate

app.post("/placeorders", async (req, res) => {
  console.log("Received order data:", req.body); // Debugging line to see what data is received

  try {
    const {
      products,
      totalAmount,
      isStockOrder,
      deliveryDate,
      deliveryTime,
      branch,
    } = req.body; // Include branch in destructuring

    // Generate a unique orderId based on the timestamp
    const orderId = `ORD-${new Date().getTime()}`;

    // Add the generated orderId and branches to each product
    const updatedProducts = products.map((product) => {
      return {
        ...product,
        orderId: orderId, // Assign the same orderId for all products in this order
        branches: product.branches.map((branch) => ({
          ...branch,
          name: branch.name || "No branch", // Default branch name if not provided
        })),
      };
    });

    console.log("Updated Products with orderId:", updatedProducts); // Debugging line

    // Create a new order with the branch information
    const newOrder = new PlaceOrder({
      orderId: orderId, // Use the timestamp-based orderId for the whole order
      products: updatedProducts,
      totalAmount,
      isStockOrder,
      deliveryDate,
      deliveryTime,
      branch, // Add branch field for the order
    });

    await newOrder.save(); // Save the order to the database

    console.log("Order saved successfully:", newOrder); // Debugging line to confirm that the order is saved

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Route to get all orders (GET)
// Route to get all orders (GET)
app.get("/placeorders", async (req, res) => {
  try {
    const {
      orderDate,
      deliveryDate,
      branch,
      page = 1,
      pageSize = 10,
    } = req.query;

    const filterQuery = {};

    // Apply order date filter
    if (orderDate) {
      const startOfOrderDate = new Date(orderDate);
      const endOfOrderDate = new Date(startOfOrderDate);
      endOfOrderDate.setHours(23, 59, 59, 999);

      filterQuery.createdAt = {
        $gte: startOfOrderDate,
        $lte: endOfOrderDate,
      };
    }

    // Apply delivery date filter
    if (deliveryDate) {
      const startOfDeliveryDate = new Date(deliveryDate);
      const endOfDeliveryDate = new Date(startOfDeliveryDate);
      endOfDeliveryDate.setHours(23, 59, 59, 999);

      filterQuery.deliveryDate = {
        $gte: startOfDeliveryDate,
        $lte: endOfDeliveryDate,
      };
    }

    // Default: Fetch today's orders if no filters are applied
    if (!orderDate && !deliveryDate) {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      filterQuery.createdAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    // Filter by branch if provided
    if (branch && branch !== "All") {
      filterQuery.branch = branch;
    }

    // Pagination
    const limit = parseInt(pageSize, 10);
    const skip = (parseInt(page, 10) - 1) * limit;

    // Fetch total count of orders matching filters
    const totalOrders = await PlaceOrder.countDocuments(filterQuery);

    // Fetch paginated orders
    const orders = await PlaceOrder.find(filterQuery)
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(skip)
      .limit(limit)
      .populate("branch", "name") // Populate branch details
      .lean();

    res.status(200).json({ orders, total: totalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});



app.get("/placeorders/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await PlaceOrder.findById(orderId); // Fetch the order by orderId (MongoDB ObjectId)
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
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

app.put("/orders/:id/notes", async (req, res) => {
  try {
    const { notes } = req.body; // Notes from the frontend
    const { id } = req.params; // Order ID from the request parameters

    // Update the `notes` field in the database
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { notes }, // Update the notes field
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Notes updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ error: "Failed to update notes" });
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

app.put("/placeorders/:Id", async (req, res) => {
  try {
    const { updatedProducts } = req.body; // Extract updated products

    if (!updatedProducts || !Array.isArray(updatedProducts)) {
      return res.status(400).json({ error: "Updated products array is missing or invalid" });
    }

    const order = await PlaceOrder.findById(req.params.Id); // Find order by ID

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update each product's sendingQty and status in the order
    order.products = order.products.map((product) => {
      const updatedProduct = updatedProducts.find((p) => p._id.toString() === product._id.toString());
      if (updatedProduct) {
        // If product is found, update sendingQty and status
        return {
          ...product,
          sendingQty: updatedProduct.sendingQty, // Update sendingQty
          status: updatedProduct.status, // Update status
        };
      }
      return product; // If no update found, return the product as is
    });

    await order.save(); // Save updated order to the database

    res.status(200).json({
      message: "Order updated successfully",
      order: order, // Return the updated order
    });
  } catch (error) {
    console.error("Error updating Order:", error);
    res.status(500).json({ message: "Failed to update Order", error: error.message });
  }
});



app.post("/orderplaceds", async (req, res) => {
  console.log("Received order data:", req.body); // Debugging line to see what data is received

  try {
    const {
      products,
      totalAmount,
      isStockOrder,
      deliveryDate,
      deliveryTime,
      branch,
    } = req.body; // Include branch in destructuring

    // Generate a unique orderId based on the timestamp
    const orderId = `ORD-${new Date().getTime()}`;

    // Add the generated orderId and branches to each product
    const updatedProducts = products.map((product) => {
      return {
        ...product,
        orderId: orderId, // Assign the same orderId for all products in this order
        branches: (product.branches || []).map((branch) => ({
          ...branch,
          name: branch.name || "No branch", // Default branch name if not provided
        })),
      };
    });

    console.log("Updated Products with orderId:", updatedProducts); // Debugging line

    // Create a new order with the branch information
    const newOrder = new OrderPlaced({
      orderId: orderId, // Use the timestamp-based orderId for the whole order
      products: updatedProducts,
      totalAmount,
      isStockOrder,
      deliveryDate,
      deliveryTime,
      branch, // Add branch field for the order
    });

    // Save the order to the database
    await newOrder.save(); 

    console.log("Order saved successfully:", newOrder); // Debugging line to confirm that the order is saved

    // Respond with success message
    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});


app.get("/orderplaceds", async (req, res) => {
  try {
    const { orderDate, deliveryDate, branch, page = 1, pageSize = 10 } = req.query;
    const filterQuery = {};

    if (orderDate) {
      const startOfOrderDate = new Date(orderDate);
      const endOfOrderDate = new Date(startOfOrderDate);
      endOfOrderDate.setHours(23, 59, 59, 999);

      filterQuery.createdAt = { $gte: startOfOrderDate, $lte: endOfOrderDate };
    }

    if (deliveryDate) {
      const startOfDeliveryDate = new Date(deliveryDate);
      const endOfDeliveryDate = new Date(startOfDeliveryDate);
      endOfDeliveryDate.setHours(23, 59, 59, 999);

      filterQuery.deliveryDate = { $gte: startOfDeliveryDate, $lte: endOfDeliveryDate };
    }

    if (branch && branch !== "All") filterQuery.branch = branch;

    const limit = parseInt(pageSize, 10);
    const skip = (parseInt(page, 10) - 1) * limit;

    console.log("MongoDB Filter Query:", filterQuery); // Log the filter query being used

    const totalOrders = await OrderPlaced.countDocuments(filterQuery);
    const orders = await OrderPlaced.find(filterQuery)
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ orders, total: totalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});




app.get("/orderplaceds/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderPlaced.findById(orderId); // Fetch the order by orderId (MongoDB ObjectId)
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});


app.put("/orderplaceds/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { products } = req.body;

  try {
    const order = await OrderPlaced.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update products
    products.forEach((updatedProduct) => {
      const index = order.products.findIndex(
        (product) => product.name === updatedProduct.name
      );
      if (index !== -1) {
        // Update both sendingQty and status if available
        order.products[index].sendingQty = updatedProduct.sendingQty;
        order.products[index].status = updatedProduct.status;
      }
    });

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;

// Change 'localhost' to '0.0.0.0'
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://64.227.145.104:${PORT}`);
});
