import React from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Tabs, Row, Col } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "../pages/LoginSignup.css";

const { TabPane } = Tabs;

const StockLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key) => {
    navigate(key);
  };

  const handleSuperAdminSubmit = async (values) => {
    try {
      const response = await axios.post("http://64.227.145.104:3001/superadmin-login", {
        adminID: values.adminID,
        password: values.password,
      });

      if (response.status === 200) {
        alert("Super Admin Login Successful!");
        navigate("/dashboard");
      } else {
        alert("Super Admin login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
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
            activeKey={location.pathname}
            onChange={handleTabChange}
            centered
          >
            <TabPane tab="Login" key="/login">
              <Form name="login" className="login-form" layout="vertical">
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

            <TabPane tab="Sign Up" key="/signup">
              {/* Add your Sign-Up page content here */}
            </TabPane>

            <TabPane tab="Stock Login" key="/stocklogin">
              <Form
                name="superadmin-login"
                onFinish={handleSuperAdminSubmit}
                className="login-form"
                layout="vertical"
              >
                <Form.Item
                  name="adminID"
                  rules={[
                    {
                      required: true,
                      message: "Super Admin ID is required",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Super Admin ID"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Password is required",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                  />
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
                    Super Admin Login
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

export default StockLogin;
