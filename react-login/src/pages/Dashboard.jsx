import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Row,
  Col,
  Card,
  Input,
  List,
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
  const [loading, setLoading] = useState(true); // New loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeName, setEmployeeName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Initialization to check login status and fetch data if authenticated
  useEffect(() => {
    const employeeId = localStorage.getItem("EmployeeID");
    if (employeeId) {
      setIsLoggedIn(true);
      fetchEmployeeData();
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
    setLoading(false); // Set loading to false after initialization

    // Handle logout when the tab or browser is closed
    const handleTabClose = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("EmployeeID");
      sessionStorage.removeItem("sessionActive");
    };

    // Logout automatically at midnight
    const logoutAtMidnight = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("EmployeeID");
      sessionStorage.removeItem("sessionActive");
      setIsLoggedIn(false);
      navigate("/login");
    };

    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = nextMidnight - now;
    const midnightTimer = setTimeout(() => {
      logoutAtMidnight();
    }, timeUntilMidnight);

    // Cleanup event listener and timer on unmount
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      clearTimeout(midnightTimer);
    };
  }, [navigate]);

  // Fetch employee data based on EmployeeID
  const fetchEmployeeData = async () => {
    const employeeId = localStorage.getItem("EmployeeID");
    if (employeeId) {
      try {
        const response = await axios.get(
          `http://43.205.54.210:3001/employees/${employeeId}`
        );
        if (
          response.data &&
          response.data.FirstName &&
          response.data.LastName
        ) {
          setEmployeeName(
            `${response.data.FirstName} ${response.data.LastName}`
          );
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("EmployeeID");
    sessionStorage.removeItem("sessionActive");
    setIsLoggedIn(false);
    navigate("/login");
  };

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="settings">Settings</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Show a loading state or nothing until login check is complete
  if (loading) {
    return null; // Optional loading indicator can be added here
  }

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
          selectedKeys={[getMenuKeyFromPath()]}
          onClick={handleMenuClick}
          style={{ backgroundColor: "#fff" }}
        >
          <Menu.Item key="1" icon={<UserOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<FileOutlined />}>
            Customer Information
          </Menu.Item>
          <Menu.Item key="3" icon={<OrderedListOutlined />}>
            Live Order
          </Menu.Item>
          <Menu.Item key="4" icon={<HistoryOutlined />}>
            Order History
          </Menu.Item>
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
