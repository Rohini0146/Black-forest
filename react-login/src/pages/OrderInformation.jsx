import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import "./OrderInformation.css";
import moment from "moment";
import jsPDF from "jspdf";
import logo from "../images/Logo-bk.png";

const { Content } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderInformation = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("orderDate");
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null); // State to store selected order
  const [isModalVisible, setIsModalVisible] = useState(false);

  const limit = 3000; // Initial limit for data fetch

  // Fetch initial and subsequent batches of orders
  const fetchOrders = useCallback(
    async (skip = 0) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://43.205.54.210:3001/orders?limit=${limit}&skip=${skip}`
        );
        const newOrders = response.data.orders;

        setOrders((prev) => [...prev, ...newOrders]);
        setFilteredOrders((prev) => [...prev, ...newOrders]);
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchOrders(); // Load the first batch of orders on mount

    // Load the next batch after 1 second
    setTimeout(() => fetchOrders(limit), 1000);
  }, [fetchOrders]);


  const filterOrders = (key) => {
    const now = new Date();
    let filtered = [];

    // Create a shallow copy to avoid mutating the original orders array
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (key === 'recent') {
      filtered = sortedOrders.slice(0, 20); // Take the latest 20 orders
    } else if (key === 'lastWeek') {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastWeek
      );
    } else if (key === 'lastMonth') {
      const lastMonth = new Date(now.setDate(now.getDate() - 30));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastMonth
      );
    }

    setFilteredOrders(filtered); // Update the state with filtered orders
  };

  // Ensure recent orders are loaded on initial render
  useEffect(() => {
    if (orders.length > 0) {
      filterOrders('recent');
    }
  }, [orders]);

  const fetchFilteredOrders = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?startDate=${startDate}&endDate=${endDate}`
      );
      setFilteredOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
      message.error("Failed to fetch filtered orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      fetchFilteredOrders(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    } else {
      fetchOrders(); // Reload all orders if no date range is selected
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    filterOrders(key);
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
    const filtered = orders.filter((order) => {
      const dateToCompare =
        filterType === "orderDate" ? order.created_at : order.delivery_date;
      return moment(dateToCompare).isSame(dateString, "day");
    });
    setFilteredOrders(filtered);
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true); // Show the modal
  };
  

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();

    // Add Logo Image (Example with Base64 or URL)
    const logoUrl = logo; // Replace with your logo URL or Base64
    doc.addImage(logoUrl, "PNG", 80, 10, 50, 20); // X, Y, Width, Height

    // Title
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 40, null, null, "center"); // Adjust Y-position

    // Company and Customer Details
    doc.setFontSize(12);
    doc.text(`East Repair Inc.`, 10, 60);
    doc.text(`1912 Harvest Lane, New York, NY 12210`, 10, 68);

    doc.text(`Invoice No: ${order.form_no}`, 140, 60);
    doc.text(`Date: ${moment(order.created_at).format("DD-MM-YYYY")}`, 140, 68);

    // Line separator
    doc.line(10, 75, 200, 75);

    doc.text(`Bill To:`, 10, 85);
    doc.text(`${order.customer_name}`, 10, 93);
    doc.text(`${order.customer_phone}`, 10, 101);

    doc.text(
      `Delivery Date: ${moment(order.delivery_date).format("DD-MM-YYYY")}`,
      140,
      93
    );

    // Line separator
    doc.line(10, 110, 200, 110);

    // Table Header
    doc.setFontSize(14);
    doc.text("Description", 10, 120);
    doc.text("Amount", 180, 120, null, null, "right");

    // Table Data
    doc.setFontSize(12);
    let yOffset = 130; // Y-axis offset for rows
    const items = [
      { label: "Price", value: `Rs: ${order.amount}` },
      { label: "Advance Paid", value: `Rs: ${order.advance}` },
      { label: "Balance", value: `Rs: ${order.balance}` },
    ];

    items.forEach((item) => {
      doc.text(item.label, 10, yOffset);
      doc.text(item.value, 180, yOffset, null, null, "right");
      yOffset += 10;
    });

    // Line separator
    doc.line(10, yOffset + 5, 200, yOffset + 5);

    // Footer with Total
    doc.setFontSize(14);
    doc.text("Total:", 10, yOffset + 15);
    doc.text(`Rs: ${order.amount}`, 180, yOffset + 15, null, null, "right");

    // Save the PDF
    doc.save(`Invoice_${order.form_no}.pdf`);
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
        <Content
          className="full-tab"
          style={{ margin: "0px", padding: "24px", backgroundColor: "#fff" }}
        >
          <div
            className="head-tab"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              style={{ color: "#1890ff" }}
              className="tabs"
            >
              <TabPane tab="Recent" key="recent" />
              <TabPane tab="Last Week" key="lastWeek" />
              <TabPane tab="Last Month" key="lastMonth" />
            </Tabs>

            <div
              className="filter"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Select
                defaultValue="orderDate"
                onChange={handleFilterTypeChange}
                style={{ width: 150, marginRight: 10 }}
              >
                <Option value="orderDate">Order Date</Option>
                <Option value="deliveryDate">Delivery Date</Option>
              </Select>
              <RangePicker onChange={handleRangeChange} />
            </div>
          </div>

          {loading ? (
            <Spin
              tip="Loading..."
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "50px",
              }}
            />
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
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "end",
                  padding: "15px",
                  backgroundColor: "#e6f7ff",
                }}
              />
            </>
          )}
          <Modal
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            title={`Invoice for Order ID: ${selectedOrder?.form_no}`}
          >
            {selectedOrder && (
              <>
                {/* Logo at the Top */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <img
                    src={logo} // Pass the logo image URL or import as a variable
                    alt="Company Logo"
                    style={{ width: "150px", height: "auto" }}
                  />
                </div>
                <h2 style={{ textAlign: "center" }}>INVOICE</h2>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <p>
                      <b>Customer:</b> {selectedOrder?.customer_name}
                    </p>
                    <p>
                      <b>Phone:</b> {selectedOrder?.customer_phone}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <b>Order Date:</b>{" "}
                      {moment(selectedOrder?.created_at).format("DD-MM-YYYY")}
                    </p>
                    <p>
                      <b>Delivery Date:</b>{" "}
                      {moment(selectedOrder?.delivery_date).format(
                        "DD-MM-YYYY"
                      )}
                    </p>
                  </Col>
                </Row>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Description
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Price
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹{selectedOrder?.amount}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Advance Paid
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹{selectedOrder?.advance}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        cgst
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        sgst
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Balance
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹{selectedOrder?.balance}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        Total Amount
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        ₹{selectedOrder?.amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default OrderInformation;
