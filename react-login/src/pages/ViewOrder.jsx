import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Input,
  Table,
  Select,
  InputNumber,
  message,
  Spin,
} from "antd";
import axios from "axios";
import moment from "moment";
import { DatabaseOutlined, DatabaseTwoTone } from "@ant-design/icons";

const { Option } = Select;

const ViewOrder = () => {
  const { orderId } = useParams(); // Get orderId from URL parameters
  const [order, setOrder] = useState(null); // Store order details
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log("Fetching Order ID:", orderId); // Log order ID
        const response = await axios.get(
          `http://43.205.54.210:3001/placeorders/${orderId}`
        );
        console.log("API Response:", response.data); // Log API response

        if (response.data) {
          setOrder(response.data); // Set order data
        } else {
          message.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        message.error("Failed to fetch order details");
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>No order found!</p>
      </div>
    );
  }

  // Extract the order ID from the products array
  const extractedOrderId =
    order.products.length > 0 ? order.products[0].orderId : "N/A";

  // Columns for the Ant Design table
  const columns = [
    {
      title: "S. No",
      dataIndex: "serial",
      key: "serial",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (_, record) => `₹${record.quantity * record.price}`,
    },

    {
      title: "Sending Qty",
      dataIndex: "sendingQty",
      key: "sendingQty",
      render: (text, record) => (
        <InputNumber
          min={0}
          defaultValue={record.quantity}
          onChange={(value) => handleSendingQtyChange(value, record)}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Select
          defaultValue={record.status || "Not Started"}
          onChange={(value) => handleStatusChange(value, record)}
        >
          <Option value="Not Started">Not Started</Option>
          <Option value="Order Taken">Order Taken</Option>
          <Option value="Preparing">Preparing</Option>
          <Option value="Done">Done</Option>
        </Select>
      ),
    },
  ];

  // Handle changes in sending quantity
  const handleSendingQtyChange = (value, record) => {
    console.log(`Updated Sending quantity for ${record.name}:`, value);
  };

  // Handle changes in order taken (name)
  const handleOrderTakenChange = (value, record) => {
    console.log(`Updated Order Taken by ${record.name}:`, value);
  };

  // Handle status change (action dropdown)
  const handleStatusChange = (value, record) => {
    console.log(`Updated status for ${record.name}: ${value}`);
  };

  // Transform products data for the table
  const productData = order.products.map((product, index) => ({
    key: index,
    name: product.name,
    quantity: product.quantity,
    price: product.price,
    orderTaken: product.orderTaken || "N/A", // Default or fetched from the order data
    sendingQty: product.quantity, // Set the initial sending quantity as the quantity
    status: product.status || "Not Started", // Default status for the product
  }));

  return (
    <div style={{ padding: "20px" }}>
      {/* Order Details Section */}
      <Card style={{ marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: "10px 0" }}>
            {" "}
            <DatabaseTwoTone /> View Orders
          </h2>
        </div>
        <Row gutter={24}>
          <Col span={6}>
            <h3>Order ID:</h3>
            <p>{extractedOrderId}</p>
          </Col>
          <Col span={6}>
            <h3>Branch Name:</h3>
            <p>{order.branch || "N/A"}</p>
          </Col>
          <Col span={6}>
            <h3>Ordered From:</h3>
            <p>
              {order.createdAt
                ? moment(order.createdAt).format("DD/MM/YYYY @ HH:mm")
                : "N/A"}
            </p>
          </Col>
          <Col span={6}>
            <h3>Delivery Date & Time:</h3>
            <p>
              {order.deliveryDate && order.deliveryTime
                ? moment(
                    `${order.deliveryDate} ${order.deliveryTime}`,
                    "YYYY-MM-DD HH:mm:ss"
                  ).format("DD/MM/YYYY @ hh:mm a")
                : "Invalid date"}
            </p>
          </Col>
        </Row>
        <Row gutter={24} style={{ marginTop: "10px" }}>
          <Col span={24}>
            <Input.Search
              placeholder="Search Products..."
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Product Details Table */}
      <Table
        columns={columns}
        dataSource={productData}
        pagination={false}
        bordered
        style={{ marginBottom: "30px" }}
      />
    </div>
  );
};

export default ViewOrder;
