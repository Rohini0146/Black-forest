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
  Menu,
  Dropdown,
  Modal,
} from "antd";
import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import logo from "../images/Logo-bk.png";
import "./OrderInformation.css";
import "./OrderHistory.css";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [filterType, setFilterType] = useState("orderDate");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const limit = 3000; // Initial limit for data fetch

  // Fetch orders from the backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?limit=${limit}`
      );
      const newOrders = response.data.orders;
      setOrders(newOrders);
      applyTabFilter("recent", newOrders); // Apply "Recent" filter by default
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply the relevant filter based on the selected tab
  const applyTabFilter = (tabKey, ordersData = orders) => {
    const now = new Date();
    let filtered = [];

    const sortedOrders = [...ordersData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (tabKey === "recent") {
      filtered = sortedOrders.slice(0, 20); // Show the latest 20 orders
    } else if (tabKey === "lastWeek") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastWeek
      );
    } else if (tabKey === "lastMonth") {
      const lastMonth = new Date(now.setDate(now.getDate() - 30));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastMonth
      );
    }

    setFilteredOrders(filtered); // Update state with filtered orders
  };

  // Trigger filter when the tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setIsDateFilterActive(false);
    applyTabFilter(key); // Apply filter based on the new tab
  };

  const fetchFilteredOrders = async (startDate, endDate) => {
    setLoading(true);
    try {
      const dateField =
        filterType === "deliveryDate" ? "delivery_date" : "created_at";
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?startDate=${startDate}&endDate=${endDate}&dateField=${dateField}`
      );
      const { orders } = response.data;

      // Filter data based on the selected date type and date range
      const filteredData = orders.filter((order) => {
        const dateValue =
          filterType === "deliveryDate"
            ? order.delivery_date
            : order.created_at;
        return (
          dateValue &&
          moment(dateValue).isBetween(startDate, endDate, null, "[]")
        );
      });

      setFilteredOrders(filteredData); // Show only filtered data based on date range
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
      message.error("Failed to fetch filtered orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (dates) => {
    setDateRange(dates); // Update date range state
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      const adjustedEndDate = end.add(1, "day").startOf("day");

      fetchFilteredOrders(
        start.startOf("day").format("YYYY-MM-DD"),
        adjustedEndDate.format("YYYY-MM-DD")
      );
    } else {
      fetchOrders(); // Reload all orders if date range is cleared
    }
  };

  useEffect(() => {
    if (!isDateFilterActive && orders.length > 0) {
      applyTabFilter(activeTab);
    }
  }, [orders, activeTab, isDateFilterActive]);

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    setDateRange(null); // Clear the date range in the RangePicker
    fetchOrders(); // Reload all orders when switching filter type
    setCurrentPage(1); // Reset pagination
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

  const handleMenuClick = async (e, orderId) => {
    const newResponse = e.key;

    // Update the response in the backend
    try {
      await axios.put(`http://43.205.54.210:3001/orders/${orderId}/response`, {
        response: newResponse,
      });
      message.success(
        `Response for Order ${orderId} updated to: ${newResponse}`
      );

      // Update the response in the orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, response: newResponse } : order
        )
      );

      // Update the response in the filtered orders state as well
      setFilteredOrders((prevFilteredOrders) =>
        prevFilteredOrders.map((order) =>
          order._id === orderId ? { ...order, response: newResponse } : order
        )
      );
    } catch (error) {
      console.error("Failed to update response:", error);
      message.error("Failed to update response");
    }
  };

  const menu = (orderId) => (
    <Menu onClick={(e) => handleMenuClick(e, orderId)}>
      <Menu.Item key="No Need">No Need</Menu.Item>
      <Menu.Item key="Not Interest">Not Interest</Menu.Item>
      <Menu.Item key="Out of Station">Out of Station</Menu.Item>
      <Menu.Item key="Not Reachable">Not Reachable</Menu.Item>
      <Menu.Item key="Other Shop">Other Shop</Menu.Item>
      <Menu.Item key="Visit Come to Shop">Visit Come to Shop</Menu.Item>
      <Menu.Item key="Waiting">Waiting</Menu.Item>
      <Menu.Item key="Order Taken by Customer">
        Order Taken by Customer
      </Menu.Item>
      <Menu.Item key="Customer need not possible">
        Customer need not possible
      </Menu.Item>
    </Menu>
  );

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
      <Content
        className="hist-od"
        style={{ padding: "24px", backgroundColor: "#fff" }}
      >
        <div
          className="head-tab"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "16px",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="tabs"
          >
            <TabPane tab="Recent" key="recent" />
            <TabPane tab="Last Week" key="lastWeek" />
            <TabPane tab="Last Month" key="lastMonth" />
          </Tabs>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Select
              defaultValue="orderDate"
              onChange={handleFilterTypeChange}
              style={{ width: 150, marginRight: 10 }}
            >
              <Option value="orderDate">Order Date</Option>
              <Option value="deliveryDate">Delivery Date</Option>
            </Select>
            <RangePicker value={dateRange} onChange={handleRangeChange} />
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
          <Row gutter={[16, 16]}>
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
                        <div style={{ marginRight: "8px", fontWeight: "bold" }}>
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
                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Order ID :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.form_no}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Order Date :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.created_at).format("DD-MM-YYYY")}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Delivery Date :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.delivery_date).format("DD-MM-YYYY")}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Delivery Time :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.delivery_time).format("hh:mm A")}
                          </span>
                        </Col>
                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Cake Model :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.cake_model}
                          </span>
                        </Col>

                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Weight :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.weight}
                          </span>
                        </Col>

                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Flavour :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {" "}
                            {order.flavour}
                          </span>
                        </Col>
                        <Col span={6} className="live-order-filter wordings">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Wordings :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.wordings}
                          </span>
                        </Col>
                      </Row>

                      {/* Payment and Price Details */}
                      {/* <Row
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
                        </Row> */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Dropdown overlay={menu(order._id)} trigger={["click"]}>
                          <div
                            style={{ cursor: "pointer", marginRight: "16px" }}
                          >
                            <span style={{ color: "#1890ff", fontWeight: 500 }}>
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

                        {/* Display the selected response dynamically */}
                        {order.response && (
                          <span
                            style={{
                              color: "#000",
                              fontWeight: "bold",
                            }}
                          >
                            Selected Response: {order.response}
                          </span>
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
                        <div style={{ marginRight: "8px", fontWeight: "bold" }}>
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
        )}

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredOrders.length}
          onChange={handlePaginationChange}
          showTotal={(total) => `Total ${total} items`}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e6f7ff",
            display: "flex",
            alignItems: "end",
            justifyContent: "end",
            width: "100%",
          }}
        />

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
                    {moment(selectedOrder?.delivery_date).format("DD-MM-YYYY")}
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
  );
};

export default OrderHistory;
