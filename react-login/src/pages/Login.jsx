import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Tabs, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "./LoginSignup.css";

const { TabPane } = Tabs;

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in by verifying both username and role
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (username && role) {
      navigate("/dashboard"); // Redirect directly if logged in
    }

    // Prevent back navigation to login page after successful login
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };

    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  const handleLoginSubmit = async (values) => {
    setIsLoading(true);
  
    try {
      const response = await axios.post("http://64.227.145.104:3001/login", {
        username: values.username,
        password: values.password,
      });
  
      if (response.status === 200 && response.data === "Login Successful") {
        const user = await axios.get(
          `http://64.227.145.104:3001/getUserByUsername/${values.username}`
        );
        const accessList = user.data.access || [];
        localStorage.setItem("role", user.data.type);
        localStorage.setItem("access", JSON.stringify(accessList));
        localStorage.setItem("username", values.username);
        localStorage.setItem("isUserLogin", "true");  // Set user login status in localStorage
    
        alert("Login Successful!");
  
        // Define the route mappings for each access type
        const accessRoutes = {
          "dashboard": "/dashboard",
          "profile": "/dashboard/profile",
          "customer-information": "/dashboard/customer-information",
          "order-information": "/dashboard/order-information",
          "order-history": "/dashboard/order-history",
          "product-information": "/dashboard/product-information",
          "payment-information": "/dashboard/payment-information",
          "sales-person": "/dashboard/sales-person",
          "customer-analysis": "/dashboard/customer-analysis",
          "logs": "/dashboard/logs",
          "branch-order": "/dashboard/branch-order",
          "live-branch-order": "/dashboard/live-branch-order",
          "return-order": "/dashboard/return-order",
          "stock-order": "/dashboard/stock-order",
          "employees": "/dashboard/employees",
          "edit-profile": "/dashboard/edit-profile",
          "branch-view": "/dashboard/branch-view",
          "product-view": "/dashboard/product-view",
        };
  
        // Redirect to the first accessible page from the access list
        if (accessList.length > 0) {
          const firstAccessPage = accessList.find(access => accessRoutes[access]);
          if (firstAccessPage) {
            navigate(accessRoutes[firstAccessPage]);
          } else {
            navigate("/dashboard"); // Default route if no mapped access is found
          }
        } else {
          navigate("/dashboard"); // Default route if no access
        }
      } else {
        message.error(response.data || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="login-page">
      <div className="login-signup-container">
        <div className="logo-container">
          <img src={logo} alt="Logo for Black Forest Cakes" />
          <p>Black Forest Cakes: The King of Cakes, where every slice is a masterpiece.</p>
        </div>

        <div className="auth-tabs">
          <Tabs centered>
            <TabPane tab="Login" key="login">
              <Form
                name="login"
                onFinish={handleLoginSubmit}
                className="login-form"
                layout="vertical"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Username is required" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    style={{ width: "100%", borderRadius: "5px", backgroundColor: "#1890ff" }}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>

        <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
          <p>Black Forest Cake</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
