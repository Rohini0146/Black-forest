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
import {
  EnvironmentOutlined,
  FacebookFilled,
  FilterOutlined,
  GlobalOutlined,
  MailOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./OrderInformation.css";
import moment from "moment";
import logo from "../images/Logo-bk.png";
import jsPDF from "jspdf";

const { Content } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderInformation = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("orderDate");
  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [branches, setBranches] = useState({});
  const [dateRange, setDateRange] = useState(null);

  const limit = 3000;

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?limit=${limit}`
      );
      const newOrders = response.data.orders;
      setOrders(newOrders);
      setFilteredOrders(newOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOrders();
    fetchBranches();
  }, [fetchOrders]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      const branchesData = response.data;
      const branchesMap = {};
      branchesData.forEach((branch) => {
        branchesMap[branch._id] = branch.branch;
      });
      setBranches(branchesMap);
    } catch (error) {
      console.error("Error fetching branches:", error);
      message.error("Failed to fetch branches. Please try again later.");
    }
  };

  // Filter orders based on the selected tab (Recent, Last Week, Last Month)
  const filterOrdersByTab = (key) => {
    const now = new Date();
    let filtered = [];

    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (key === "recent") {
      filtered = sortedOrders.slice(0, 20); // Show the latest 20 orders
    } else if (key === "lastWeek") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastWeek
      );
    } else if (key === "lastMonth") {
      const lastMonth = new Date(now.setDate(now.getDate() - 30));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastMonth
      );
    }

    setFilteredOrders(filtered); // Update the state with filtered orders
  };

  useEffect(() => {
    if (orders.length > 0) {
      filterOrdersByTab(activeTab); // Apply filter on initial load or when tab changes
    }
  }, [orders, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setIsDateFilterActive(false);
    filterOrdersByTab(key);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true); // Show the modal
  };

  // Fetch orders within the specified date range based on filterType
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

  // Handle date range change based on the selected filter type
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
      filterOrdersByTab(activeTab);
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

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();

    // Add Logo Image
    const logoUrl = logo; // Replace with your logo URL or Base64
    doc.addImage(logoUrl, "PNG", 85, 25, 40, 15); // Adjust X and width for better centering and size

    // Title - Order Form Header
    doc.setFontSize(16); // Slightly smaller font
    doc.setTextColor(0, 0, 0);
    doc.text("ORDER FORM", 10, 18); // Position on the left side

    // Left Section - Website, Email, and Facebook Information
    doc.setFontSize(10); // Smaller font to avoid overlap
    doc.text("www.theblackforestcakes.com", 10, 28);
    doc.text("theblackforestcakes.in@gmail.com", 10, 33);
    doc.text("facebook.com/blackforestcakesthoothukudi", 10, 38);

    // Right Section - Contact Information
    const contactInfo = [
      "Contact",
      "CHIDAMBARAM NAGAR : 9791470656",
      "V.V.D. SIGNAL : 9500542656",
      "ETTAYAPURAM ROAD : 9597104066",
      "Antony church : 6386796656",
      "Sawyer Puram : 7395766656",
      "Kamaraj college : 9500266656",
      "3rd mile : 9600846656",
    ];

    // Adjust the position and spacing for the right section
    const startX = 135; // Adjust X to keep within right-side boundary
    const startY = 10; // Starting Y position for right-side content
    const lineSpacing = 5; // Line spacing to keep content compact

    doc.setFontSize(9);
    contactInfo.forEach((line, index) => {
      doc.text(line, startX, startY + index * lineSpacing); // Maintain a compact vertical layout
    });

    // Bottom Line Separator for Header
    doc.line(10, 50, 200, 50);

    // Save the PDF
    doc.save(`Invoice_${order.form_no}.pdf`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        className="live-od"
        style={{ padding: "24px", backgroundColor: "#fff" }}
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
                        marginBottom: "15px",
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
            display: "flex",
            alignItems: "end",
            justifyContent: "end",
            padding: "15px",
            backgroundColor: "#e6f7ff",
          }}
        />
        <Modal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={"70%"}
        >
          {selectedOrder && (
            <>
              {/* Header Section */}
              <div>
                <p className="order-head" style={{ margin: "0" }}>
                  <strong>INVOICE ORDER FORM</strong>
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "2px solid #6a1b1a",
                  padding: "15px 20px",
                  fontSize: "15px",
                }}
              >
                {/* Left Section */}
                <div>
                  <p style={{ margin: "5px 0" }}>
                    <GlobalOutlined style={{ marginRight: "10px" }} />
                    www.theblackforestcakes.com
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <MailOutlined style={{ marginRight: "10px" }} />
                    theblackforestcakes@gmail.com
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <FacebookFilled style={{ marginRight: "10px" }} />
                    facebook.com/theblackforestcakes
                  </p>
                </div>

                {/* Center Logo */}
                <div style={{ textAlign: "center" }}>
                  <img src={logo} alt="Logo" style={{ width: "160px" }} />
                </div>

                {/* Right Contact Information */}
                <div style={{ marginTop: "-40px" }}>
                  <p style={{ margin: "0" }}>
                    <strong>Contact</strong>
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    CHIDAMBARAM NAGAR : 9791470656
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    VVD Signal : 9500542656
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    Ettayapuram Road : 7502914688
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    Amroy church : 6381673966
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    Sankar Pulam : 7537933164
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    Kamaraj college : 9514466455
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  >
                    3rdmile : 9003466606
                  </p>
                </div>
              </div>

              {/* Order and Customer Information Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #6a1b1a",
                  padding: "15px 20px",
                  fontSize: "16px",
                }}
              >
                {/* Order Information */}
                <div style={{ width: "48%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "120px" }}>Form No :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      {selectedOrder.form_no}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "120px" }}>Date :</strong>
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      <span style={{ fontWeight: "500" }}>
                        {moment(selectedOrder.created_at).format("DD-MM-YYYY")}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "120px" }}>Delivery Date :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {moment(selectedOrder.delivery_date).format(
                          "DD-MM-YYYY"
                        )}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "120px" }}>Delivery Time :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {moment(selectedOrder.delivery_time).format("hh:mm A")}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "120px" }}>Order Time :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {moment(selectedOrder.created_at).format("hh:mm A")}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div style={{ width: "48%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "150px" }}>Customer Name :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {selectedOrder.customer_name}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "150px" }}>
                      Customer Number :
                    </strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {selectedOrder.customer_phone}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "150px" }}>Address :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {selectedOrder.address}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <strong style={{ width: "150px" }}>Email :</strong>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #380f10",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {selectedOrder.email || "N/A"}
                      </span>
                    </p>
                  </div>

                  <p>
                    <strong>Delivery Location :</strong>
                    <span style={{ fontWeight: "500" }}>
                      {" "}
                      <EnvironmentOutlined style={{ marginRight: "5px" }} />
                      Choose Delivery location
                    </span>
                    <br />
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      (Drag the marker in map to change location)
                    </span>
                  </p>
                </div>
              </div>
              {/* Cake Details Section */}
              <div
                style={{
                  border: "1px solid #6a1b1a",
                  padding: "15px 20px",
                  fontSize: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Wordings :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.wordings}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Birthday Date :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {moment(selectedOrder.birthday_date).format("DD-MM-YYYY")}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Cake Model :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.cake_model}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Weight :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.weight || "N/A"}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Flavour :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.flavour}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Type :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.type || "N/A"}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>
                    Alteration if any :
                  </strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.alteration || "N/A"}
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ width: "150px" }}>Special Care :</strong>{" "}
                  <p
                    style={{
                      fontWeight: "500",
                      border: "1px solid #380f10",
                      margin: "auto",
                      width: "45%",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.special_care || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Payment Details Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  borderTop: "1px solid #6a1b1a",
                  borderBottom: "1px solid #6a1b1a",
                  padding: "10px 0",
                  fontSize: "16px",
                }}
              >
                <p>
                  <strong>Amount :</strong>{" "}
                  <span style={{ fontWeight: "500" }}>
                    {selectedOrder.amount}
                  </span>
                </p>
                <p>
                  <strong>Advance :</strong>{" "}
                  <span style={{ fontWeight: "500" }}>
                    {selectedOrder.advance}
                  </span>
                </p>
                <p>
                  <strong>Balance :</strong>{" "}
                  <span style={{ fontWeight: "500" }}>
                    {selectedOrder.balance}
                  </span>
                </p>
                <p>
                  <strong>Total :</strong>{" "}
                  <span style={{ fontWeight: "500" }}>
                    {selectedOrder.amount}
                  </span>
                </p>
              </div>

              {/* Attention Notice Section */}
              <div
                style={{
                  padding: "15px 20px",
                  textAlign: "center",
                  borderBottom: "1px solid #6a1b1a",
                }}
              >
                <p style={{ fontSize: "22px", color: "red" }}>
                  <strong>Your Attention!</strong>
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    width: "80%",
                    marginInline: "auto",
                  }}
                >
                  Delivery Every cake we offer is handcrafted and since each
                  chef has his/her own way of baking and designing a cake, there
                  might be slight variation in the product in terms of design.
                </p>
              </div>
              {/* Terms and Conditions Section */}
              <div
                style={{
                  padding: "10px 20px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                <ol style={{ paddingLeft: "20px" }}>
                  <li>Bring this receipt at the time of delivery please.</li>
                  <li>
                    Minimum amount of 50% of the total amount should be paid as
                    advance.
                  </li>
                  <li>
                    For wedding cakes 100% of the amount should be paid as
                    advance.
                  </li>
                  <li>
                    Advance once received will not be returned at any
                    circumstances.
                  </li>
                  <li>
                    The advance received against cancellation order will be
                    adjusted in future orders or purchases of any of our outlet
                    products.
                  </li>
                  <li>
                    Cancellation of order should be intimated at the minimum
                    time of 48 hrs before the time of delivery.
                  </li>
                  <li>
                    Cancellation will not be done through phone. (Customer
                    should come in person).
                  </li>
                  <li>
                    For door delivery vehicle fare will be collected from the
                    customer.
                  </li>
                  <li>
                    Above 2Kg birthday cakes we haven’t provided carry bag,
                    sorry.
                  </li>
                  <li>
                    Fresh cream cakes, choco truffle cakes can be kept in normal
                    temperature for only two hours. After that, it should be
                    kept in chiller and it should not be kept in freezer.
                  </li>
                </ol>
              </div>

              {/* Footer Information Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #6a1b1a",
                  padding: "15px 20px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <div>
                  <p style={{ textAlign: "center" }}>
                    <strong>Branch :</strong>
                  </p>
                  <span>
                    {branches[selectedOrder.branch] || "Unknown Branch"}
                  </span>
                </div>
                <div>
                  <p style={{ textAlign: "center" }}>
                    <strong>Salesman :</strong>{" "}
                  </p>
                  <span>{selectedOrder.sales_man}</span>
                </div>
                <div>
                  <p style={{ textAlign: "center" }}>
                    <strong>Customer Sign :</strong>
                  </p>
                  <img
                    src={selectedOrder.customer_signature}
                    style={{ width: "80px" }}
                  />
                </div>
                <div>
                  <p style={{ textAlign: "center" }}>
                    <strong>Delivery Type :</strong>{" "}
                  </p>
                  <span>{selectedOrder.delivery_type}</span>
                </div>
              </div>
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default OrderInformation;
