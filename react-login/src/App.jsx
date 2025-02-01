import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './Home';
import CustomerInformation from './pages/CustomerInformation';
import OrderInformation from './pages/OrderInformation';
import OrderHistory from './pages/OrderHistory';
import Order from './pages/Order';
import Logs from './pages/Logs';
import Dashboard from './pages/Dashboard';
import BranchOrder from './pages/BranchOrder';
import LiveBranchOrders from './pages/LiveBranchOrders';
import ReturnOrder from './pages/ReturnOrder';
import StockOrder from './pages/StockOrder';
import Employees from './pages/Employees';
import EditProfile from './pages/EditProfile';
import './App.css';
import Profile from './pages/Profile';
import AutoLogoutRedirect from "./pages/AutoLogoutRedirect";
import Cart from './pages/Cart';
import BranchView from './pages/BranchView';
import ViewOrder from './pages/ViewOrder'; // Import the ViewOrder component
import ProductView from './pages/ProductView';
import AddonProducts from './pages/AddonProducts';
import Albums from './pages/Albums';
import ProductCategories from './pages/ProductCategories';
import Products from './pages/Products';
import ProductUnits from './pages/ProductUnits';


const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("username") && localStorage.getItem("role");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
    return (
      <Router>
         <AutoLogoutRedirect />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="customer-information" element={<CustomerInformation />} />
            <Route path="order-information" element={<OrderInformation />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="logs" element={<Logs />} />
            <Route path="branch-order" element={<BranchOrder />} />
            <Route path="live-branch-order" element={<LiveBranchOrders />} />
            <Route path="return-order" element={<ReturnOrder />} />
            <Route path="stock-order" element={<StockOrder />} />
            <Route path='profile' element={<Profile />} />
            <Route path="employees" element={<Employees />} />
            <Route path="edit-profile/:username" element={<EditProfile />} />
            <Route path='cart' element={<Cart/>} />
            <Route path='branch-view' element={<BranchView />} />
            <Route path='addon-product' element={<AddonProducts />} />
            <Route path="album" element={<Albums />} />
            <Route path='product-categories' element={<ProductCategories />} /> 
            <Route path='products' element={<Products />} />
            <Route path='product-units' element={<ProductUnits />} />
            <Route
            path="view-order/:orderId"
            element={<ProtectedRoute><ViewOrder /></ProtectedRoute>}
          />
          <Route path='product-view' element={<ProductView />} />
          </Route>

          {/* Standalone Route for Orders */}
          <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />

          {/* Route for Viewing a Single Order */}
          

          {/* Catch-All Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    );
}

export default App;
