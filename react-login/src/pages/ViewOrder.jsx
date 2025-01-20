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
  Button,
} from "antd";
import axios from "axios";
import moment from "moment";
import { DatabaseTwoTone } from "@ant-design/icons";

const { Option } = Select;

const ViewOrder = () => {
  const { orderId } = useParams(); // Get orderId from URL parameters
  const [order, setOrder] = useState(null); // Store order details
  const [loading, setLoading] = useState(true); // Loading state
  const [updatedProducts, setUpdatedProducts] = useState([]); // Store updated product details

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log("Fetching Order ID:", orderId); // Log order ID
        const response = await axios.get(
          `http://64.227.145.104:3001/orderplaceds/${orderId}`
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

  // Update sending quantity and status
  const handleQtyChange = (name, value) => {
    const updated = updatedProducts.map((product) => {
      if (product.name === name) {
        return {
          ...product,
          sendingQty: value, // Update only sendingQty but keep status unchanged
        };
      }
      return product;
    });
  
    // If product is not found in the updatedProducts array, add it with sendingQty
    if (!updated.some((product) => product.name === name)) {
      updated.push({
        name,
        sendingQty: value,
        status: order.products.find((product) => product.name === name)?.status || "Not Started", // Retain the previous status if not updated
      });
    }
  
    setUpdatedProducts(updated);
  };
  
  const handleStatusChange = (name, status) => {
    const updated = updatedProducts.map((product) => {
      if (product.name === name) {
        return {
          ...product,
          status, // Update only status but keep sendingQty unchanged
        };
      }
      return product;
    });
  
    // If product is not found in the updatedProducts array, add it with status
    if (!updated.some((product) => product.name === name)) {
      updated.push({
        name,
        sendingQty: order.products.find((product) => product.name === name)?.sendingQty || 0, // Retain the previous sendingQty if not updated
        status,
      });
    }
  
    setUpdatedProducts(updated);
  };

  const handleUpdate = async () => {
    try {
      if (updatedProducts.length === 0) {
        message.warning("No changes to update.");
        return;
      }

      console.log("Sending to Backend:", updatedProducts); // Debug the payload

      const response = await axios.put(
        `http://64.227.145.104:3001/orderplaceds/${orderId}`,
        {
          products: updatedProducts, // Send updated products
        }
      );

      console.log("Order updated:", response.data);
      message.success("Order updated successfully!");
      // Rest of the logic...
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  // Columns for the Ant Design table
  const columns = [
    {
      title: "S. No",
      dataIndex: "serial",
      key: "serial",
      render: (_, record, index) => (
        <div style={{ textAlign: "center" }}>{index + 1}</div>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <div style={{ textAlign: "center" }}>{name}</div>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <div style={{ textAlign: "center" }}>{quantity}</div>
      ),
    },
    {
      title: "InStock Quantity",
      dataIndex: "inStockQuantity",
      key: "inStockQuantity",
      render: (inStockQuantity) => (
        <div style={{ textAlign: "center" }}>{inStockQuantity}</div>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <div style={{ textAlign: "center" }}>{`₹${price}`}</div>
      ),
    },
    {
      title: "Sending Qty",
      dataIndex: "sendingQty",
      key: "sendingQty",
      render: (sendingQty, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <InputNumber
            min={0}
            value={sendingQty}
            onChange={(value) => handleQtyChange(record.name, value)}
            style={{ margin: "0 10px", width: "60px" }}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div style={{ textAlign: "center" }}>
          <Select
            defaultValue={status || "Not Started"}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.name, value)}
          >
            <Option value="Not Started">Not Started</Option>
            <Option value="Order Taken">Order Taken</Option>
            <Option value="Preparing">Preparing</Option>
            <Option value="Done">Done</Option>
          </Select>
        </div>
      ),
    },
  ];

  // Transform products data for the table
  const productData = order.products.map((product, index) => ({
    key: product.productId, // Use unique product ID here
    name: product.name,
    inStockQuantity: product.inStockQuantity,
    quantity: product.quantity,
    price: product.price,
    sendingQty:
      updatedProducts.find((p) => p.name === product.name)?.sendingQty ||
      product.sendingQty ||
      0, // Default to 0 if no sendingQty is set
    status:
      updatedProducts.find((p) => p._id === product._id)?.status ||
      product.status ||
      "Not Started", // Default to "Not Started"
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
        style={{ marginBottom: "30px", textAlign: "center" }}
      />

      {/* Update Button */}
      <div style={{ textAlign: "right" }}>
        <Button type="primary" onClick={handleUpdate}>
          Update
        </Button>
      </div>
    </div>
  );
};

export default ViewOrder;
