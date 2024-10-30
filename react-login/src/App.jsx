import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './Home';
import CustomerInformation from './pages/CustomerInformation';
import OrderInformation from './pages/OrderInformation';
import OrderHistory from './pages/OrderHistory';
import Order from './pages/Order';
import './App.css';
import Logs from './pages/Logs';
import Dashboard from './pages/Dashboard';

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
  
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="customer-information" element={<CustomerInformation />} />
            <Route path="order-information" element={<OrderInformation />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="logs" element={<Logs />} />
          </Route>
  
          <Route path="/order" element={<Order />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    );
  }
  
  export default App;
