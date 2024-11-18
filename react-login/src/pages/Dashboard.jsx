import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Row,
  Col,
  Card,
  List,
  Input,
} from "antd";
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
  SolutionOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  ProfileOutlined,
  ShopOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import logo from "../images/Logo-bk.png";
import { PieChart, Pie, Cell } from "recharts";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1023);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [employeeName, setEmployeeName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const username = localStorage.getItem("username"); // Assumes the username is stored in localStorage
    setEmployeeName(username || "Employee"); // Fallback to "Employee" if username is not found
  }, []);

  useEffect(() => {
    // Fetch user access and role from localStorage
    const access = JSON.parse(localStorage.getItem("access")) || [];
    const role = localStorage.getItem("role");
    setAccessList(access);
    setIsSuperAdmin(role === "superadmin"); // Check if user is superadmin
  }, []);

  const getMenuKeyFromPath = () => {
    const path = location.pathname;
    if (path.includes("profile")) return "2";
    if (path.includes("customer-information")) return "3";
    if (path.includes("order-information")) return "4";
    if (path.includes("order-history")) return "5";
    if (path.includes("product-information")) return "6";
    if (path.includes("payment-information")) return "7";
    if (path.includes("sales-person")) return "8";
    if (path.includes("customer-analysis")) return "9";
    if (path.includes("logs")) return "10";
    if (path.includes("branch-order")) return "11";
    if (path.includes("live-branch-order")) return "12";
    if (path.includes("return-order")) return "13";
    if (path.includes("stock-order")) return "14";
    if (path.includes("employees")) return "15";
    if (path.includes("edit-profile")) return "16";
    if (path.includes("branch-view")) return "17";
    if (path.includes("view-order")) return "18";
    if (path.includes("product-view")) return "19";
    return "1"; // Default to "1" for the dashboard
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      1: "/dashboard",
      2: "/dashboard/profile", // New Profile page route
      3: "/dashboard/customer-information",
      4: "/dashboard/order-information",
      5: "/dashboard/order-history",
      6: "/dashboard/product-information",
      7: "/dashboard/payment-information",
      8: "/dashboard/sales-person",
      9: "/dashboard/customer-analysis",
      10: "/dashboard/logs",
      11: "/dashboard/branch-order",
      12: "/dashboard/live-branch-order",
      13: "/dashboard/return-order",
      14: "/dashboard/stock-order",
      15: "/dashboard/employees",
      16: "/dashboard/edit-profile",
      17: "/dashboard/branch-view",
      18: "/dashboard/view-order",
      19: "/dashboard/product-view",
    };
    navigate(routes[key]);
  };

  // Logout function
  const handleLogout = () => {
    // Get the username from localStorage
    const username = localStorage.getItem("username");
  
    // Call the backend to update the `isUserLogin` to false
    axios.post("http://43.205.54.210:3001/logout", { username })
      .then((response) => {
        // After backend successfully updates the status, clear localStorage
        localStorage.clear(); // Clear all stored data (username, role, access, etc.)
        navigate("/login"); // Redirect to login page
      })
      .catch((error) => {
        console.error("Logout error:", error);
        navigate("/login"); // If error occurs, still redirect to login
      });
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
          selectedKeys={[getMenuKeyFromPath()]}
          onClick={handleMenuClick}
          style={{ backgroundColor: "fff" }}
        >
          {/* Conditionally render all menu items if superadmin, else based on accessList */}
          {(isSuperAdmin || accessList.includes("dashboard")) && (
            <Menu.Item key="1" icon={<UserOutlined />}>Dashboard</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("profile")) && (
            <Menu.Item key="2" icon={<UserOutlined />}>Profile</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("employees")) && (
            <Menu.Item key="15" icon={<SolutionOutlined />}>Employees</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("branch-view")) && (
            <Menu.Item key="17" icon={<DatabaseOutlined />}>Branch View</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-view")) && (
            <Menu.Item key="19" icon={<ProductOutlined />}>Product View</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-information")) && (
            <Menu.Item key="3" icon={<FileOutlined />}>Customer Information</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-information")) && (
            <Menu.Item key="4" icon={<OrderedListOutlined />}>Live Order</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-history")) && (
            <Menu.Item key="5" icon={<HistoryOutlined />}>Order History</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-information")) && (
            <Menu.Item key="6" icon={<ShoppingOutlined />}>Product Information</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("payment-information")) && (
            <Menu.Item key="7" icon={<LineChartOutlined />}>Payment Information</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("sales-person")) && (
            <Menu.Item key="8" icon={<TeamOutlined />}>Sales Person</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-analysis")) && (
            <Menu.Item key="9" icon={<NotificationOutlined />}>Customer Analysis</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("logs")) && (
            <Menu.Item key="10" icon={<SettingOutlined />}>Logs</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("branch-order")) && (
            <Menu.Item key="11" icon={<ShopOutlined />}>Branch Order</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("live-branch-order")) && (
            <Menu.Item key="12" icon={<ProfileOutlined />}>Live Branch Order</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("return-order")) && (
            <Menu.Item key="13" icon={<ReloadOutlined />}>Return Order</Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("stock-order")) && (
            <Menu.Item key="14" icon={<DatabaseOutlined />}>Stock Order</Menu.Item>
          )}
          
          
        </Menu>
      </Sider>

      <Layout>
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <div className="header-content">
            <Dropdown
              overlay={
                <Menu onClick={({ key }) => key === "logout" && handleLogout()}>
                  <Menu.Item key="profile">Profile</Menu.Item>
                  <Menu.Item key="settings">Settings</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="logout">Logout</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: "pointer", marginRight: 16 }}
              />
            </Dropdown>
            <span style={{ color: "#fff" }}>{employeeName || "Employee"}</span>
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>
          {location.pathname === "/dashboard" ? (
            <Row className="content1" gutter={[16, 16]}>
              <Col span={8}>
                <Card title="Search Branch">
                  <Search
                    placeholder="Search Branch"
                    onSearch={handleSearch}
                    enterButton
                  />
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      marginTop: "10px",
                    }}
                  >
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
                    <Pie
                      data={[{ name: "Orders", value: 100 }]}
                      dataKey="value"
                      outerRadius={80}
                    >
                      <Cell fill="#8884d8" />
                    </Pie>
                  </PieChart>
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
