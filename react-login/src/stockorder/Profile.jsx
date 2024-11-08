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
  FileOutlined,
  ShoppingCartOutlined,
  RetweetOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  UserSwitchOutlined,
  UserOutlined,
  UserAddOutlined,
  ShopOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./Profile.css";
import logo from "../images/Logo-bk.png";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const Profile = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1023);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
  }, []);

  const handleMenuClick = ({ key }) => {
    const routes = {
      profile: "/profile",
      "live-branch-order": "/profile/live-branch-order",
      "branch-order": "/profile/branch-order",
      "stock-orders": "/profile/stock-orders",
      "return-orders": "/profile/return-orders",
      payments: "/profile/payments",
      "user-track": "/profile/user-track",
      "reports-by-order": "/profile/reports-by-order",
    };
    navigate(routes[key]);
  };

  // Form submission to create a new user
  const submitForm = async (values) => {
    try {
      const response = await axios.post("http://43.205.54.210:3001/adduser", values); // Update endpoint to `/adduser`
      message.success(response.data.message); // Display success message
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.message); // Display error message for duplicate username
      } else {
        message.error("Error creating user. Please try again."); // Display generic error message
      }
      console.error("Error creating user:", error);
    }
  };
  

  const userMenu = (
    <Menu>
      <Menu.Item key="settings">Settings</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={() => navigate("/login")}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const isMainProfilePage = location.pathname === "/profile";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: "#fff" }}
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
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ backgroundColor: "#fff" }}
        >
          <Menu.Item key="profile" icon={<UserAddOutlined />}>
            Profile
          </Menu.Item>
          <Menu.Item key="live-branch-order" icon={<ShopOutlined />}>
            Live Branch Order
          </Menu.Item>
          <Menu.Item key="branch-order" icon={<ShopOutlined />}>
            Branch Order
          </Menu.Item>
          <Menu.Item key="stock-orders" icon={<OrderedListOutlined />}>
            Stock Orders
          </Menu.Item>
          <Menu.Item key="return-orders" icon={<RetweetOutlined />}>
            Return Orders
          </Menu.Item>
          <Menu.Item key="payments" icon={<DollarCircleOutlined />}>
            Payments
          </Menu.Item>
          <Menu.Item key="user-track" icon={<UserSwitchOutlined />}>
            User Track
          </Menu.Item>
          <Menu.Item key="reports-by-order" icon={<LineChartOutlined />}>
            Reports by Order
          </Menu.Item>
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
            <span style={{ color: "#fff" }}>Employee</span>
          </div>
        </Header>

        <Content style={{ margin: "16px", padding: '0 24px', background: "#fff" }}>
          {isMainProfilePage ? (
            <>
              <div className="profile-welcome">
                <h1>Hello Admin</h1>
                <p>
                  "Welcome, Admin! Use this page to create and manage user
                  profiles, ensuring every customer has a smooth experience with
                  Black Forest Cake."
                </p>
              </div>
              <div className="profile-form">
                <h2 style={{ fontSize: '20px' }}>
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
                      <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter username' }]}>
                        <Input placeholder="Enter username" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
                        <Input.Password placeholder="Enter password" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Mobile Number" name="mobileNumber" rules={[{ required: true, message: 'Please enter mobile number' }]}>
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
                      <Form.Item label="Branch" name="branch" rules={[{ required: true, message: 'Please select a branch' }]}>
                        <Select
                          placeholder="Select branch"
                          loading={loading}
                        >
                          {stores.map((store) => (
                            <Option key={store.branch} value={store.name}>
                              {store.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please enter type' }]}>
                        <Select placeholder="Select type">
                          <Option value="waiter">Waiter</Option>
                          <Option value="manager">Manager</Option>
                          <Option value="chef">Chef</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Access" name="access" rules={[{ required: true, message: 'Please enter access level' }]}>
                        <Select mode="multiple" placeholder="Select access level">
                          <Option value="branch-order">Branch Order</Option>
                          <Option value="stock-order">Stock Order</Option>
                          <Option value="return-order">Return Order</Option>
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
