import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CustomerInformation from "./pages/CustomerInformation";
import OrderInformation from "./pages/OrderInformation";
import OrderHistory from "./pages/OrderHistory";
import Logs from "./pages/Logs";
import BranchOrder from "./pages/BranchOrder";
import LiveBranchOrders from "./pages/LiveBranchOrders";
import ReturnOrder from "./pages/ReturnOrder";
import StockOrder from "./pages/StockOrder";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import Employees from "./pages/Employees";

function App() {
  const [userAccess, setUserAccess] = useState([]);
  const isSuperAdmin = localStorage.getItem("role") === "superadmin";

  useEffect(() => {
    const access = JSON.parse(localStorage.getItem("access")) || [];
    setUserAccess(access);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Profile as Main Page */}
        <Route path="/profile" element={<Profile />}>
        {(isSuperAdmin || userAccess.includes("dashboard")) && (
            <Route path="dashboard" element={<Dashboard />} />
          )}
          {(isSuperAdmin || userAccess.includes("customer-information")) && (
            <Route path="customer-information" element={<CustomerInformation />} />
          )}
          {(isSuperAdmin || userAccess.includes("live-order")) && (
            <Route path="live-order" element={<OrderInformation />} />
          )}
          {(isSuperAdmin || userAccess.includes("order-history")) && (
            <Route path="order-history" element={<OrderHistory />} />
          )}
          {(isSuperAdmin || userAccess.includes("logs")) && (
            <Route path="logs" element={<Logs />} />
          )}
          {(isSuperAdmin || userAccess.includes("branch-order")) && (
            <Route path="branch-order" element={<BranchOrder />} />
          )}
          {(isSuperAdmin || userAccess.includes("live-branch-order")) && (
            <Route path="live-branch-order" element={<LiveBranchOrders />} />
          )}
          {(isSuperAdmin || userAccess.includes("employees")) && (
            <Route path="employees" element={<Employees />} />
          )}
          {(isSuperAdmin || userAccess.includes("return-order")) && (
            <Route path="return-order" element={<ReturnOrder />} />
          )}
           {(isSuperAdmin || userAccess.includes("stock-order")) && (
            <Route path="stock-order" element={<StockOrder />} />
          )}
        </Route>

        {/* Redirect to Profile as a fallback */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;