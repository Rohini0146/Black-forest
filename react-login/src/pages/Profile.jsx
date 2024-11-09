import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Input,
  Button,
  Form,
  Row,
  Col,
  Select,
  message,
} from "antd";
import {
  UserAddOutlined,
  ShopOutlined,
  OrderedListOutlined,
  RetweetOutlined,
  DollarCircleOutlined,
  UserSwitchOutlined,
  LineChartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./Profile.css";
import logo from "../images/Logo-bk.png";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const Profile = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1023);
  const [stores, setStores] = useState([]);
  const [userAccess, setUserAccess] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeName, setEmployeeName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const username = localStorage.getItem("username"); // Assumes the username is stored in localStorage
    setEmployeeName(username || "Employee"); // Fallback to "Employee" if username is not found
  }, []);

  // All available pages for access
  const allPages = [
    "profile",
    "live-branch-order",
    "branch-order",
    "stock-order",
    "return-order",
    "payments",
    "user-track",
    "reports-by-order",
    "dashboard",
    "customer-information",
    "live-order",
    "order-history",
    "product-information",
    "payment-information",
    "sales-person",
    "customer-analysis",
    "logs",
  ];

  // Define icons for menu items
  const iconMap = {
    profile: <UserAddOutlined />,
    "live-branch-order": <ShopOutlined />,
    "branch-order": <ShoppingCartOutlined />,
    "stock-order": <OrderedListOutlined />,
    "return-order": <RetweetOutlined />,
    payments: <DollarCircleOutlined />,
    "user-track": <UserSwitchOutlined />,
    "reports-by-order": <LineChartOutlined />,
    dashboard: <UserOutlined />, // Replace with the appropriate icon
    "customer-information": <UserOutlined />, // Replace with the appropriate icon
    "live-order": <ShopOutlined />, // Replace with the appropriate icon
    "order-history": <RetweetOutlined />, // Replace with the appropriate icon
    "product-information": <ShoppingCartOutlined />, // Replace with the appropriate icon
    "payment-information": <DollarCircleOutlined />, // Replace with the appropriate icon
    "sales-person": <UserSwitchOutlined />, // Replace with the appropriate icon
    "customer-analysis": <LineChartOutlined />, // Replace with the appropriate icon
    "logs": <UserOutlined />, // Replace with the appropriate icon
  };

  // Fetch stores from the database
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // Retrieve access from localStorage for the logged-in user
    const access = JSON.parse(localStorage.getItem("access"));
    setUserAccess(access || []);

    // Navigate only if not Super Admin and on the profile root page
    const isSuperAdmin = localStorage.getItem("role") === "superadmin";
    if (
      !isSuperAdmin &&
      access &&
      access.length > 0 &&
      location.pathname === "/profile"
    ) {
      navigate(`/profile/${access[0]}`);
    }
  }, [location.pathname, navigate]);

  // Super Admin has access to all pages
  const isSuperAdmin = localStorage.getItem("role") === "superadmin";

  // Handle menu click for navigation
  const handleMenuClick = ({ key }) => {
    if (isSuperAdmin || userAccess.includes(key)) {
      // Allow access if user is super admin or has access to the page
      navigate(`/profile/${key}`);
    } else {
      message.error("You do not have access to this page.");
    }
  };

  // User dropdown menu for settings and logout
  const userMenu = (
    <Menu>
      <Menu.Item key="settings">Settings</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => navigate("/login")}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Form submission to create a new user
  const submitForm = async (values) => {
    try {
      // If "all" is selected for access, give access to all pages
      const userAccess = values.access.includes("all")
        ? allPages
        : values.access;
      const userData = { ...values, access: userAccess };
      const response = await axios.post(
        "http://43.205.54.210:3001/adduser",
        userData
      );
      message.success(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.message); // Display error message for duplicate username
      } else {
        message.error("Error creating user. Please try again.");
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: "#fff",
          overflowY: "auto",
          height: "100vh", // Make sure the Sider takes full height
        }}
        className="custom-sider"
      >
        <div
          style={{
            backgroundColor: "#002140",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <img
            className="logo-img"
            src={logo}
            alt="Logo"
            style={{
              width: collapsed ? "118%" : "47.5%",
              transition: "width 0.3s ease",
              padding: collapsed ? "10px" : "0",
            }}
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split("/").pop()]} // Dynamically set selected keys based on URL
          onClick={handleMenuClick}
          style={{ backgroundColor: "#fff" }}
        >
          {/* Super Admin Menu - Show All Pages */}
          {isSuperAdmin
            ? allPages.map((page) => (
                <Menu.Item key={page} icon={iconMap[page]}>
                  {page
                    .replace("-", " ")
                    .toLocaleLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </Menu.Item>
              ))
            : // Non-Super Admin Menu - Dynamically show pages based on user access
              userAccess.map((accessItem) => (
                <Menu.Item key={accessItem} icon={iconMap[accessItem]}>
                  {accessItem
                    .replace("-", " ")
                    .toLocaleLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </Menu.Item>
              ))}
        </Menu>
      </Sider>

      <Layout>
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <div className="header-content">
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: "pointer", marginRight: 16 }}
              />
            </Dropdown>
            <span style={{ color: "#fff" }}>{employeeName || "Employee"}</span>
          </div>
        </Header>

        <Content style={{ padding: "16px" }}>
          {location.pathname === "/profile" ? (
            <>
              <div className="profile-content">
                <div className="profile-welcome">
                  <h1>Hello Admin</h1>
                  <p>
                    "Welcome, Admin! Use this page to create and manage user
                    profiles, ensuring every customer has a smooth experience
                    with Black Forest Cake."
                  </p>
                </div>
                <div className="profile-form">
                  <h2 style={{ fontSize: "20px" }}>
                    <UserAddOutlined
                      style={{
                        color: "#1890FF",
                        background: "#E6F7FF",
                        padding: "4px",
                        marginRight: "5px",
                      }}
                    />{" "}
                    Create a User
                  </h2>
                  <Form
                    layout="vertical"
                    style={{ maxWidth: "800px", margin: "auto" }}
                    onFinish={submitForm}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Username"
                          name="username"
                          rules={[
                            {
                              required: true,
                              message: "Please enter username",
                            },
                          ]}
                        >
                          <Input placeholder="Enter username" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "Please enter password",
                            },
                          ]}
                        >
                          <Input.Password placeholder="Enter password" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Mobile Number"
                          name="mobileNumber"
                          rules={[
                            {
                              required: true,
                              message: "Please enter mobile number",
                            },
                          ]}
                        >
                          <Input placeholder="Enter mobile number" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Email ID" name="email">
                          <Input placeholder="Enter email ID" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label="Address" name="address">
                          <Input placeholder="Enter address" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Branch"
                          name="branch"
                          rules={[
                            {
                              required: true,
                              message: "Please select a branch",
                            },
                          ]}
                        >
                          <Select placeholder="Select branch" loading={loading}>
                            {stores.map((store) => (
                              <Option key={store.branch} value={store.name}>
                                {store.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Type"
                          name="type"
                          rules={[
                            { required: true, message: "Please enter type" },
                          ]}
                        >
                          <Select placeholder="Select type">
                            <Option value="waiter">Waiter</Option>
                            <Option value="manager">Manager</Option>
                            <Option value="chef">Chef</Option>
                            <Option value="superadmin">Super Admin</Option>
                            <Option value="deskadmin">Desk Admin</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label="Access"
                          name="access"
                          rules={[
                            {
                              required: true,
                              message: "Please enter access level",
                            },
                          ]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Select access level"
                          >
                            <Option value="all">All Pages</Option>
                            {allPages
                              .filter((page) => page !== "profile") // Filter out "profile" option
                              .map((page) => (
                                <Option key={page} value={page}>
                                  {page
                                    .replace("-", " ")
                                    .toLocaleLowerCase()
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Create User
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </>
          ) : (
            <Outlet /> // Render the nested route content here
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
