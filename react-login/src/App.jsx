import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./Home";
import CustomerInformation from "./pages/CustomerInformation";
import OrderInformation from "./pages/OrderInformation";
import OrderHistory from "./pages/OrderHistory";
import Order from "./pages/Order";
import "./App.css";
import Logs from "./pages/Logs";
import Dashboard from "./pages/Dashboard";
import Profile from "./stockorder/Profile";
import BranchOrder from "./stockorder/BranchOrder";
import StockLogin from "./stockorder/StockLogin"; 
import LiveBranchOrders from "./stockorder/LiveBranchOrders";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stocklogin" element={<StockLogin />}/>

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="customer-information" element={<CustomerInformation />} />
          <Route path="order-information" element={<OrderInformation />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="logs" element={<Logs />} />
        </Route>

        {/* Profile layout with nested routes */}
        <Route path="/profile" element={<Profile />}>
          <Route path="branch-order" element={<BranchOrder />} />
          <Route path="live-branch-order" element={<LiveBranchOrders />} />
          {/* Add additional sub-routes under /profile as needed */}
        </Route>

        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
