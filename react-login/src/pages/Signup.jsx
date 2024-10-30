// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Row, Col, Select, Tabs } from "antd";
import {
  MobileOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "./LoginSignup.css";
import { TabPane } from "react-bootstrap";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navigates = useNavigate();
  const location = useLocation();

  const handleTabChange = (key) => {
    navigate(key);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("http://43.205.54.210:3001/signup", {
        phonenumber: values.phone,
        password: values.password, // Include password in the request
        verificationCode: values.verificationCode,
        EmployeeID:values.EmployeeID,
        FirstName: values.FirstName,
        LastName: values.LastName,
        BranchLocation: values.BranchLocation,
        
      });
      console.log("Signup response:", response.data);
      if (response.data) {
        alert("Signup successful!");
        navigate("/login"); // Redirect to the login page
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
          <Tabs
            activeKey={location.pathname} // Tracks the current active tab based on route
            onChange={handleTabChange} // Handles tab changes for navigation
            centered
          >
            <TabPane tab="Login" key="/login">
              {/* Add your login page content here */}
            </TabPane>
            <TabPane tab="Sign Up" key="/signup">
              {/* Add your signup page content here */}
            </TabPane>
          </Tabs>
        </div>

        <Form
          name="signup"
          onFinish={handleSubmit}
          className="signup-form"
          layout="vertical"
        >
          <Form.Item
            name="EmployeeID"
            rules={[
              {
                required: true,
                message: "Employee ID is required",
              },
              {
                pattern: /^[0-9]{4,5}$/,
                message: "Please enter a valid Employee ID (4 to 5 digits)",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Employee ID"
              type="tel"
            />
          </Form.Item>

          {/* First Name and Last Name */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="FirstName"
                rules={[
                  {
                    required: true,
                    message: "First Name is required",
                  },
                ]}
              >
                <Input placeholder="First Name" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="LastName"
                rules={[
                  {
                    required: true,
                    message: "Last Name is required",
                  },
                ]}
              >
                <Input placeholder="Last Name" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="BranchLocation"
            style={{ textAlign: "start" }}
            rules={[
              {
                required: true,
                message: "Branch location is required",
              },
            ]}
          >
            <Select placeholder="Branch Location">
              <Option value="branch-1">Branch 1</Option>
              <Option value="branch-2">Branch 2</Option>
              <Option value="branch-3">Branch 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input your phone number!",
              },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number!",
              },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="Phone number"
              type="tel"
            />
          </Form.Item>

          <Form.Item
            name="verificationCode"
            rules={[
              {
                required: true,
                message: "Please input the verification code!",
              },
            ]}
          >
            <Row gutter={8}>
              <Col span={16}>
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Verification code"
                />
              </Col>
              <Col span={8}>
                <Button
                  style={{ width: "100%" }}
                  onClick={() => alert("Code sent to your phone")}
                >
                  Get Code
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                borderRadius: "5px",
                backgroundColor: "#1890ff",
              }}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
          <p>Black Forest Cake</p>
          
        </footer>
      </div>
    </div>
  );
};

export default Signup;
