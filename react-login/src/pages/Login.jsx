// src/pages/LoginSignup.js

import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Tabs, Checkbox, Row, Col } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "./LoginSignup.css";

const { TabPane } = Tabs;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key) => {
    navigate(key);
  };

  const handleLoginSubmit = async (values) => {
    try {
      const response = await axios.post("http://43.205.54.210:3001/login", {
        EmployeeID: values["Employee ID"], // Pass Employee ID
        verificationCode: values.verificationCode, // Pass verification code
      });
  
      if (response.status === 200 && response.data === "Login Successful") {
        alert("Login Successful!");
        navigate("/dashboard"); // Redirect to the dashboard page
      } else {
        alert(response.data || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        error.response?.data?.message || "An error occurred. Please try again."
      );
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
        <Tabs style={{marginTop:'-20px'}}>
          {/* Login Form */}
          <TabPane key="login">
            <Form
              name="login"
              onFinish={handleLoginSubmit}
              className="login-form"
              layout="vertical"
            >
              <Form.Item
                name="Employee ID"
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
        <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
          <p>Black Forest Cake</p>
         
        </footer>
      </div>
    </div>
  );
};

export default Login;