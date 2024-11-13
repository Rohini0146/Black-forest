import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Tabs } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../images/Logo-bk.png";
import "./LoginSignup.css";

const { TabPane } = Tabs;

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const isLoggedIn = localStorage.getItem("username");
    if (isLoggedIn) {
      // If already logged in, redirect to profile
      navigate("/profile");
    }

    // Disable back/forward navigation on login page
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };

    // Cleanup the popstate when component unmounts
    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  const handleLoginSubmit = async (values) => {
  try {
    const response = await axios.post("http://43.205.54.210:3001/login", {
      username: values.username,
      password: values.password,
    });

    if (response.status === 200 && response.data === "Login Successful") {
      const user = await axios.get(
        `http://43.205.54.210:3001/getUserByUsername/${values.username}`
      );
      const accessList = user.data.access || [];
      localStorage.setItem("role", user.data.type);
      localStorage.setItem("access", JSON.stringify(accessList));
      localStorage.setItem("username", values.username);

      alert("Login Successful!");

      // Redirect to the first accessible page from the list
      if (accessList.length > 0) {
        navigate(`/profile/${accessList[0]}`);
      } else {
        navigate("/profile");  // Default route if no access
      }
    } else {
      alert(response.data || "Login failed. Please try again.");
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
