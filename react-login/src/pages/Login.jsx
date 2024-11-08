import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Tabs, Row, Col, Select } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "./LoginSignup.css";

const { TabPane } = Tabs;
const { Option } = Select;

// Hardcoded admin ID and password for superadmin role
const SUPERADMIN_ID = "20212024";
const SUPERADMIN_PASSWORD = "cake@2024";

const Login = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key) => {
    navigate(key);
  };

  const handleLoginSubmit = async (values) => {
    try {
      const response = await axios.post("http://43.205.54.210:3001/login", {
        username: values.username,
        password: values.password,
        mobileNumber: values.mobileNumber,
        role: values.role,
      });
  
      if (response.status === 200 && response.data.message === "Login Successful") {
        const { access } = response.data.user; // Assuming your API response includes the user's access
        localStorage.setItem("username", values.username);
        localStorage.setItem("access", JSON.stringify(access)); // Save access array to local storage
        navigate("/profile");
      } else {
        alert(response.data || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data || "An error occurred. Please try again.");
    }
  };

  

  return (
    <div className="login-page">
      <div className="login-signup-container">
        <div className="logo-container">
          <img src={logo} alt="Logo for Black Forest Cakes" />
          <p>
            Black Forest Cakes: The King of Cakes, where every slice is a
            masterpiece.
          </p>
        </div>

        <div className="auth-tabs">
          <Tabs activeKey={location.pathname} onChange={handleTabChange} centered>
            <TabPane tab="Login" key="/login">
              <Form
                name="login"
                onFinish={handleLoginSubmit}
                className="login-form"
                layout="vertical"
              >
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: "Role is required" }]}
                >
                  <Select
                    placeholder="Select Role"
                    onChange={(value) => setRole(value)}
                  >
                    <Option value="waiter">Waiter</Option>
                    <Option value="chef">Chef</Option>
                    <Option value="manager">Manager</Option>
                    <Option value="admin">Admin</Option>
                    <Option value="superadmin">Super Admin</Option>
                  </Select>
                </Form.Item>

                {role === "superadmin" ? (
                  <>
                    <Form.Item
                      name="adminID"
                      rules={[{ required: true, message: "Admin ID is required for superadmin" }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Admin ID"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "Password is required" }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                      />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: "Username is required" }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Username"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "Password is required" }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                      />
                    </Form.Item>

                    <Form.Item
                      name="mobileNumber"
                      rules={[
                        { required: true, message: "Mobile number is required" },
                        { pattern: /^[0-9]{10}$/, message: "Enter a valid 10-digit mobile number" },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Mobile Number"
                      />
                    </Form.Item>
                  </>
                )}

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: "100%",
                      borderRadius: "5px",
                      backgroundColor: "#1890ff",
                    }}
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
