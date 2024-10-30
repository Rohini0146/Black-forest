import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Row, Col, Card, Typography, List, Input } from "antd";
import {
  UserOutlined,
  FileOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  LineChartOutlined,
  TeamOutlined,
  NotificationOutlined,
  SettingOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import logo from "../images/Logo-bk.png";
import { BarChart, Bar, PieChart, Pie, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1023);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getMenuKeyFromPath = () => {
    const path = location.pathname;
    if (path.includes("customer-information")) return "2";
    if (path.includes("order-information")) return "3";
    if (path.includes("order-history")) return "4";
    if (path.includes("product-information")) return "5";
    if (path.includes("payment-information")) return "6";
    if (path.includes("sales-person")) return "7";
    if (path.includes("customer-analysis")) return "8";
    if (path.includes("logs")) return "9";
    return "1";
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      1: "/dashboard",
      2: "/dashboard/customer-information",
      3: "/dashboard/order-information",
      4: "/dashboard/order-history",
      5: "/dashboard/product-information",
      6: "/dashboard/payment-information",
      7: "/dashboard/sales-person",
      8: "/dashboard/customer-analysis",
      9: "/dashboard/logs",
    };
    navigate(routes[key]);
  };

  // Fetch function for stores
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      setStores(response.data);
      setFilteredStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (value) => {
    const filtered = stores.filter((store) =>
      store.branch.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStores(filtered);
  };


  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 1023);
    };

    window.addEventListener("resize", handleResize); // Add resize event listener
    return () => window.removeEventListener("resize", handleResize); // Clean up event listener
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}  style={{ backgroundColor: "#fff" }} >
        <div style={{ backgroundColor: "#002140", padding: "10px", textAlign: "center" }}>
          <img className="logo-img" src={logo} alt="Logo" style={{ 
        width: collapsed ? "118%" : "47.5%", // Change width based on collapsed state 
        transition: "width 0.3s ease",
        padding: collapsed ? "10px" : "0" // Smooth transition effect
      }}/>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getMenuKeyFromPath()]}
          onClick={handleMenuClick}
          style={{backgroundColor: "fff"}}
        >
          <Menu.Item key="1" icon={<UserOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<FileOutlined />}>Customer Information</Menu.Item>
          <Menu.Item key="3" icon={<OrderedListOutlined />}>Live Order</Menu.Item>
          <Menu.Item key="4" icon={<HistoryOutlined />}>Order History</Menu.Item>
          <Menu.Item key="5" icon={<ShoppingOutlined />}>
            Product Information
          </Menu.Item>
          <Menu.Item key="6" icon={<LineChartOutlined />}>
            Payment Information
          </Menu.Item>
          <Menu.Item key="7" icon={<TeamOutlined />}>
            Sales Person
          </Menu.Item>
          <Menu.Item key="8" icon={<NotificationOutlined />}>
            Customer Analysis
          </Menu.Item>
          <Menu.Item key="9" icon={<SettingOutlined />}>
            Logs
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout >
         <Header className="site-layout-background" style={{ padding: 0 }}>
          <div className="header-content">
            <Dropdown overlay={<Menu>
              <Menu.Item key="profile">Profile</Menu.Item>
              <Menu.Item key="settings">Settings</Menu.Item>
              <Menu.Divider />
              <Menu.Item key="logout">Logout</Menu.Item>
            </Menu>} trigger={["click"]}>
              <Avatar icon={<UserOutlined />} style={{ cursor: "pointer", marginRight: 16 }} />
            </Dropdown>
            <span style={{ color: "#fff" }}>Gerald Moe</span>
          </div>
        </Header>

        <Content className="content">
        
          {location.pathname === "/dashboard" ? (
            <Row gutter={[16, 16]} >
              <Col span={8}>
                <Card title="Search Branch">
                  <Search placeholder="Search Branch" onSearch={handleSearch} enterButton />
                  <div style={{ maxHeight: "200px", overflowY: "auto", marginTop: "10px" }}>
                    <List
                      dataSource={filteredStores}
                      renderItem={(store) => (
                        <List.Item>{store.branch}</List.Item>
                      )}
                    />
                  </div>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Order Summary">
                  <PieChart width={200} height={200}>
                    <Pie data={[{ name: "Orders", value: 100 }]} dataKey="value" outerRadius={80}>
                      <Cell fill="#8884d8" />
                    </Pie>
                  </PieChart>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Sales Chart">
                  <BarChart width={300} height={150} data={stores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </Card>
              </Col>
            </Row>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
