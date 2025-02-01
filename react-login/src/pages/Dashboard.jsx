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
  Drawer,
  Button,
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
  MenuOutlined,
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
  const [drawerVisible, setDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const username = localStorage.getItem("username");
    setEmployeeName(username || "Employee");
  }, []);

  useEffect(() => {
    const access = JSON.parse(localStorage.getItem("access")) || [];
    const role = localStorage.getItem("role");
    setAccessList(access);
    setIsSuperAdmin(role === "superadmin");
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
    if (path.includes("product-units")) return "20";
    if (path.includes("product-categories")) return "21";
    if (path.includes("addon-product")) return "22";
    if (path.includes("album")) return "23";
    if (path.includes("products")) return "24";
    return "1"; // Default to "1" for the dashboard
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      1: "/dashboard",
      2: "/dashboard/profile",
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
      20: "/dashboard/product-units",
      21: "/dashboard/product-categories",
      22: "/dashboard/addon-product",
      23: "/dashboard/album",
      24: "/dashboard/products",

    };
    navigate(routes[key]);
  };

  const handleLogout = () => {
    const username = localStorage.getItem("username");
    axios
      .post("http://139.59.60.185:3001/logout", { username })
      .then(() => {
        localStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        navigate("/login");
      });
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://139.59.60.185:3001/stores");
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

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider for larger screens */}
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: "#fff",
          overflowY: "auto",
          height: "100vh",
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
        >
          {(isSuperAdmin || accessList.includes("dashboard")) && (
            <Menu.Item key="1" icon={<UserOutlined />}>
              Dashboard
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("profile")) && (
            <Menu.Item key="2" icon={<UserOutlined />}>
              Profile
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("employees")) && (
            <Menu.Item key="15" icon={<SolutionOutlined />}>
              Employees
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-units")) && (
            <Menu.Item key="20" icon={<SolutionOutlined />}>
              Product Units
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-categories")) && (
            <Menu.Item key="21" icon={<SolutionOutlined />}>
              Product Categories
            </Menu.Item>
          )}

          {(isSuperAdmin || accessList.includes("addon-product")) && (
            <Menu.Item key="22" icon={<SolutionOutlined />}>
              Addon Product
            </Menu.Item>
          )}

          {(isSuperAdmin || accessList.includes("album")) && (
            <Menu.Item key="23" icon={<SolutionOutlined />}>
              Album
            </Menu.Item>
          )}

          {(isSuperAdmin || accessList.includes("products")) && (
            <Menu.Item key="24" icon={<SolutionOutlined />}>
              Products
            </Menu.Item>
          )}

          {(isSuperAdmin || accessList.includes("branch-view")) && (
            <Menu.Item key="17" icon={<DatabaseOutlined />}>
              Branch View
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-view")) && (
            <Menu.Item key="19" icon={<ProductOutlined />}>
              Product View
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-information")) && (
            <Menu.Item key="3" icon={<FileOutlined />}>
              Customer Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-information")) && (
            <Menu.Item key="4" icon={<OrderedListOutlined />}>
              Live Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-history")) && (
            <Menu.Item key="5" icon={<HistoryOutlined />}>
              Order History
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-information")) && (
            <Menu.Item key="6" icon={<ShoppingOutlined />}>
              Product Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("payment-information")) && (
            <Menu.Item key="7" icon={<LineChartOutlined />}>
              Payment Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("sales-person")) && (
            <Menu.Item key="8" icon={<TeamOutlined />}>
              Sales Person
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-analysis")) && (
            <Menu.Item key="9" icon={<NotificationOutlined />}>
              Customer Analysis
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("logs")) && (
            <Menu.Item key="10" icon={<SettingOutlined />}>
              Logs
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("branch-order")) && (
            <Menu.Item key="11" icon={<ShopOutlined />}>
              Branch Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("live-branch-order")) && (
            <Menu.Item key="12" icon={<ProfileOutlined />}>
              Live Branch Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("return-order")) && (
            <Menu.Item key="13" icon={<ReloadOutlined />}>
              Return Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("stock-order")) && (
            <Menu.Item key="14" icon={<DatabaseOutlined />}>
              Stock Order
            </Menu.Item>
          )}
        </Menu>
      </Sider>

      {/* Drawer for mobile view */}
      <Drawer
        title="Menu"
        placement="left"
        closable={false}
        onClose={toggleDrawer}
        visible={drawerVisible}
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[getMenuKeyFromPath()]}
          onClick={handleMenuClick}
        >
          {(isSuperAdmin || accessList.includes("dashboard")) && (
            <Menu.Item key="1" icon={<UserOutlined />}>
              Dashboard
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("profile")) && (
            <Menu.Item key="2" icon={<UserOutlined />}>
              Profile
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("employees")) && (
            <Menu.Item key="15" icon={<SolutionOutlined />}>
              Employees
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("branch-view")) && (
            <Menu.Item key="17" icon={<DatabaseOutlined />}>
              Branch View
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-view")) && (
            <Menu.Item key="19" icon={<ProductOutlined />}>
              Product View
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-information")) && (
            <Menu.Item key="3" icon={<FileOutlined />}>
              Customer Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-information")) && (
            <Menu.Item key="4" icon={<OrderedListOutlined />}>
              Live Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("order-history")) && (
            <Menu.Item key="5" icon={<HistoryOutlined />}>
              Order History
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("product-information")) && (
            <Menu.Item key="6" icon={<ShoppingOutlined />}>
              Product Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("payment-information")) && (
            <Menu.Item key="7" icon={<LineChartOutlined />}>
              Payment Information
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("sales-person")) && (
            <Menu.Item key="8" icon={<TeamOutlined />}>
              Sales Person
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("customer-analysis")) && (
            <Menu.Item key="9" icon={<NotificationOutlined />}>
              Customer Analysis
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("logs")) && (
            <Menu.Item key="10" icon={<SettingOutlined />}>
              Logs
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("branch-order")) && (
            <Menu.Item key="11" icon={<ShopOutlined />}>
              Branch Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("live-branch-order")) && (
            <Menu.Item key="12" icon={<ProfileOutlined />}>
              Live Branch Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("return-order")) && (
            <Menu.Item key="13" icon={<ReloadOutlined />}>
              Return Order
            </Menu.Item>
          )}
          {(isSuperAdmin || accessList.includes("stock-order")) && (
            <Menu.Item key="14" icon={<DatabaseOutlined />}>
              Stock Order
            </Menu.Item>
          )}
        </Menu>
      </Drawer>

      <Layout>
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <div className="header-content">
            <div className="header-left">
              <Button
                className="menu-button"
                type="link"
                icon={<MenuOutlined />}
                onClick={toggleDrawer}
                style={{ marginRight: 16 }}
              />
              <div>
                <img src={logo} alt="Logo" style={{ width: "100px" }} />
              </div>
            </div>

            <div>
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) => key === "logout" && handleLogout()}
                  >
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
              <span style={{ color: "#fff" }}>
                {employeeName || "Employee"}
              </span>
            </div>
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
