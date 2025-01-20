import React, { useState, useEffect } from "react";
import {
  Layout,
  Tabs,
  Card,
  Row,
  Col,
  message,
  DatePicker,
  Select,
  Spin,
  Empty,
  Pagination,
  Button,
  Space,
  Menu,
  Dropdown,
  Modal,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import logo from "../images/Logo-bk.png";
import "./OrderInformation.css";
import "./OrderHistory.css";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [filterType, setFilterType] = useState("orderDate");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [responseMap, setResponseMap] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const limit = 3000; // Set the limit to 3000 records

  // Fetch orders with limit
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://64.227.145.104:3001/orders?limit=${limit}`
      );

      const data = response.data;

      // Map the response for easier lookup
      const responseMapData = data.reduce((map, order) => {
        map[order._id] = order.response || "";
        return map;
      }, {});

      setResponseMap(responseMapData);

      // Sort orders by created date
      const sortedOrders = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(sortedOrders);
      filterOrdersByTab(activeTab, sortedOrders); // Filter by default tab
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on selected tab
  const filterOrdersByTab = (tab, orders) => {
    const now = moment();
    let filtered = [];

    if (tab === "recent") {
      filtered = orders.slice(0, 20); // Latest 20 orders
    } else if (tab === "lastWeek") {
      filtered = orders.filter((order) =>
        moment(order.created_at).isSameOrAfter(now.clone().subtract(7, "days"))
      );
    } else if (tab === "lastMonth") {
      filtered = orders.filter((order) =>
        moment(order.created_at).isSameOrAfter(now.clone().subtract(1, "month"))
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    if (orders.length > 0) {
      filterOrdersByTab(activeTab, orders);
    }
  }, [orders, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    filterOrdersByTab(key, orders);
  };

  const handleDateChange = (date, dateString) => {
    const filtered = orders.filter((order) =>
      moment(
        filterType === "orderDate" ? order.created_at : order.delivery_date
      ).isSame(dateString, "day")
    );
    setFilteredOrders(filtered);
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleMenuClick = async (e, orderId) => {
    const newResponse = e.key;
    const newResponseMap = { ...responseMap, [orderId]: newResponse };
    setResponseMap(newResponseMap);

    try {
      await axios.put(
        `http://64.227.145.104:3001/orders/${orderId}/response`,
        { response: newResponse }
      );
      message.success(`Response for Order ${orderId} updated to: ${newResponse}`);
    } catch (error) {
      console.error("Failed to update response:", error);
      message.error("Failed to update response");
    }
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 80, 10, 50, 20);
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 40, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Invoice No: ${order.form_no}`, 140, 60);
    doc.text(`Date: ${moment(order.created_at).format("DD-MM-YYYY")}`, 140, 68);
    doc.save(`Invoice_${order.form_no}.pdf`);
  };

  const menu = (orderId) => (
    <Menu onClick={(e) => handleMenuClick(e, orderId)}>
      <Menu.Item key="Not Attend">Not Attend</Menu.Item>
      <Menu.Item key="Customer not Interested">Customer not Interested</Menu.Item>
      <Menu.Item key="Customer come Tommorow">Customer come Tommorow</Menu.Item>
      <Menu.Item key="Order Taken by Customer">Order Taken by Customer</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
        <Content style={{ margin: "0px", padding: "24px", backgroundColor: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab="Recent" key="recent" />
              <TabPane tab="Last Week" key="lastWeek" />
              <TabPane tab="Last Month" key="lastMonth" />
            </Tabs>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Select defaultValue="orderDate" onChange={handleFilterTypeChange} style={{ width: 150, marginRight: 10 }}>
                <Option value="orderDate">Order Date</Option>
                <Option value="deliveryDate">Delivery Date</Option>
              </Select>
              <DatePicker onChange={handleDateChange} />
            </div>
          </div>

          {loading ? (
            <Spin tip="Loading..." style={{ display: "flex", justifyContent: "center", marginTop: "50px" }} />
          ) : paginatedOrders.length === 0 ? (
            <Empty description="No Data" style={{ marginTop: "50px" }} />
          ) : (
            <>
              <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
                {paginatedOrders.map((order) => (
                  <Col span={24} key={order._id}>
                    <Card>
                      <Row>
                        <Col
                          span={24}
                          className="order-avatar"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "25px",
                            rowGap: "10px",
                            padding: "5px",
                            borderRadius: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          {/* Customer Avatar and Info */}
                          <div className="avatar">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                alt="Customer Avatar"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "50%",
                                  marginRight: "10px",
                                  float: "left",
                                }}
                              />
                              <div>
                                <div>
                                  <p
                                    style={{
                                      fontWeight: "500",
                                      color: "#BFBFBF",
                                    }}
                                  >
                                    Name :{" "}
                                    <span
                                      style={{
                                        fontWeight: "500",
                                        color: "#000",
                                      }}
                                    >
                                      {order.customer_name}
                                    </span>{" "}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontWeight: "500",
                                      color: "#BFBFBF",
                                    }}
                                  >
                                    Number :{" "}
                                    <span
                                      style={{
                                        fontWeight: "500",
                                        color: "#000",
                                      }}
                                    >
                                      {order.customer_phone}
                                    </span>{" "}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border"></div>

                          {/* Payment and Price Details */}
                          <Row
                            className="price-detail"
                            gutter={[16, 8]}
                            style={{ marginLeft: "10px" }}
                          >
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Price :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  ₹{order.amount}
                                </span>
                              </div>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Payment Method :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  {order.payment_method}
                                </span>
                              </div>
                            </Col>
                          </Row>
                          <div className="border"></div>

                          <div
                            className="price-detail"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              marginTop: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{ marginRight: "8px", fontWeight: "bold" }}
                            >
                              Invoice :
                            </div>
                            <Space
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <Button
                                onClick={() => handleViewOrder(order)}
                                style={{
                                  border: "1px solid #1890FF",
                                  padding: "3px 20px",
                                }}
                              >
                                View
                              </Button>
                              <Button
                                onClick={() => handleDownloadPDF(order)}
                                type="primary"
                                style={{
                                  backgroundColor: "#1890FF",
                                  color: "#fff",
                                  padding: "3px 20px",
                                  border: "1px solid #1890FF",
                                }}
                              >
                                Download
                              </Button>
                            </Space>
                          </div>
                        </Col>

                        <div className="bd-btm"></div>

                        <Col
                          span={24}
                          style={{ padding: "20px 0" }}
                          className="live-detail"
                        >
                          <Row gutter={[24, 25]}>
                            <Col span={6}>
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Order ID :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {order.form_no}
                              </span>
                            </Col>
                            <Col span={6}>
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Order Date :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {moment(order.created_at).format("DD-MM-YYYY")}
                              </span>
                            </Col>
                            <Col span={6}>
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Delivery Date :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {moment(order.delivery_date).format(
                                  "DD-MM-YYYY"
                                )}
                              </span>
                            </Col>
                            <Col span={6}>
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Delivery Time :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {moment(order.delivery_time).format("hh:mm A")}
                              </span>
                            </Col>
                            <Col span={6} className="live-order-filter">
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Cake Model :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {order.cake_model}
                              </span>
                            </Col>

                            <Col span={6} className="live-order-filter">
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Weight :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {order.weight}
                              </span>
                            </Col>

                            <Col span={6} className="live-order-filter">
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Flavour :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {" "}
                                {order.flavour}
                              </span>
                            </Col>
                            <Col
                              span={6}
                              className="live-order-filter wordings"
                            >
                              <b
                                style={{ fontWeight: "500", color: "#BFBFBF" }}
                              >
                                Wordings :
                              </b>{" "}
                              <span style={{ fontWeight: "500" }}>
                                {order.wordings}
                              </span>
                            </Col>
                          </Row>

                          {/* Payment and Price Details */}
                          <Row
                            className="price-detail-mob"
                            gutter={[16, 8]}
                            style={{ marginLeft: "10px" }}
                          >
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Price :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  ₹{order.amount}
                                </span>
                              </div>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Payment Method :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  {order.payment_method}
                                </span>
                              </div>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Advance Paid :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  ₹{order.advance}
                                </span>
                              </div>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  backgroundColor: "#E6F7FF",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <b
                                  style={{
                                    fontWeight: "500",
                                    color: "#1890FF",
                                  }}
                                >
                                  Balance :
                                </b>{" "}
                                <span
                                  style={{
                                    color: "#1890FF",
                                    fontWeight: "500",
                                  }}
                                >
                                  ₹{order.balance}
                                </span>
                              </div>
                            </Col>
                          </Row>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: "8px",
                            }}
                          >
                            <Dropdown
                              overlay={menu(order._id)}
                              trigger={["click"]}
                            >
                              <div style={{ cursor: "pointer" }}>
                                <span
                                  style={{ color: "#1890ff", fontWeight: 500 }}
                                >
                                  Response
                                </span>
                                <DownOutlined
                                  style={{
                                    marginLeft: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                              </div>
                            </Dropdown>

                            {/* Display the selected response */}
                            {responseMap[order._id] && (
                              <div
                                style={{
                                  marginLeft: "16px",
                                  color: "#000",
                                  fontWeight: "bold",
                                }}
                              >
                                Customer Response: {responseMap[order._id]}
                              </div>
                            )}
                          </div>

                          <div
                            className="price-detail-mob"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              marginTop: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{ marginRight: "8px", fontWeight: "bold" }}
                            >
                              Invoice :
                            </div>
                            <Space
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <Button
                                onClick={() => handleViewOrder(order)}
                                style={{
                                  border: "1px solid #1890FF",
                                  padding: "3px 20px",
                                }}
                              >
                                View
                              </Button>
                              <Button
                                onClick={() => handleDownloadPDF(order)}
                                type="primary"
                                style={{
                                  backgroundColor: "#1890FF",
                                  color: "#fff",
                                  padding: "3px 20px",
                                  border: "1px solid #1890FF",
                                }}
                              >
                                Download
                              </Button>
                            </Space>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredOrders.length}
                onChange={handlePaginationChange}
                style={{ marginTop: "20px", display: "flex", justifyContent: "end" }}
              />
            </>
          )}

          <Modal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
            {selectedOrder && <div>{/* Modal content */}</div>}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OrderHistory;






