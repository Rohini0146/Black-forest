import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Row, Col, message } from "antd";
import "./Dashboard.css"; // Optional for custom styling
import logo from "../images/Logo-bk.png";

const Order = () => {
  const [loading, setLoading] = useState(false);

  // Submit form to the backend
  const onFinish = async (values) => {
    console.log("Form Data to Submit:", values); // Log form data
    setLoading(true);
    try {
      const response = await axios.post("http://43.205.54.210:3001/order", values);
      if (response.data) {
        message.success("Order successfully submitted!");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      message.error("Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="dashboard-container">
      <div
        style={{
          backgroundColor: "#002140",
          width: "100%",
          paddingBottom: "7px",
          paddingTop: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          className="logo"
          src={logo}
          alt="Black Forest Cakes"
          style={{ width: "48.5%", margin: "0px", height: "auto" }}
        />
      </div>
      <h2 style={{ textAlign: "center", margin: "40px 0", fontSize: "30px" }}>
        Submit New Order
      </h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Customer Name"
              name="name"
              rules={[{ required: true, message: "Please input the customer's name!" }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: "Please input the phone number!" }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input the email!" }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please input the address!" }]}
        >
          <Input placeholder="Enter address" />
        </Form.Item>

        <Form.Item
          label="Birthday Information"
          name="birthdayInformation"
          rules={[{ required: true, message: "Please input birthday information!" }]}
        >
          <Input placeholder="Enter birthday information" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea placeholder="Enter any notes" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Wordings on Cake"
              name="wordings"
              rules={[{ required: true, message: "Please input the wordings for the cake!" }]}
            >
              <Input placeholder="Enter wordings" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Weight"
              name="cakeWeight"
              rules={[{ required: true, message: "Please input the weight of the cake!" }]}
            >
              <Input placeholder="Start with 1kg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Cake Type"
              name="cakeModel"
              rules={[{ required: true, message: "Please input the cake type!" }]}
            >
              <Input placeholder="Enter cake type" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Cake Flavour"
              name="cakeflavour"
              rules={[{ required: true, message: "Please input the cake flavor!" }]}
            >
              <Input placeholder="Enter cake flavor" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Delivery Date"
              name="deliveryDate"
              rules={[{ required: true, message: "Please input the delivery date!" }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Delivery Time"
              name="deliveryTime"
              rules={[{ required: true, message: "Please input the delivery time!" }]}
            >
              <Input placeholder="Enter delivery time" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[{ required: true, message: "Please input the payment method!" }]}
            >
              <Input placeholder="Enter payment method" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Advance Paid"
              name="advancePaid"
              rules={[{ required: true, message: "Please input the advance amount paid!" }]}
            >
              <Input placeholder="Enter advance paid" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Order
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Order;
