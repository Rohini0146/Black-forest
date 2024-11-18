import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  Form,
  Row,
  Col,
  Select,
  message,
  Typography,
} from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  const allPages = [
    "dashboard",
    "profile",
    "employees",
    "live-branch-order",
    "branch-order",
    "branch-view",
    "product-view",
    "stock-order",
    "return-order",
    "payments",
    "user-track",
    "reports-by-order",
    "customer-information",
    "live-order",
    "order-history",
    "product-information",
    "payment-information",
    "sales-person",
    "customer-analysis",
    "logs",
  ];

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const submitForm = async (values) => {
    try {
      const userAccess = values.access.includes("all")
        ? allPages
        : values.access;
      const userData = { ...values, access: userAccess };
      const response = await axios.post(
        "http://43.205.54.210:3001/adduser",
        userData
      );

      message.success(response.data.message);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.message);
      } else {
        message.error("Error creating user. Please try again.");
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content >
          <>
            <div className="profile-content">
              <div className="profile-welcome">
                <Title level={3}>Hello Admin</Title>
                <Text>
                  Welcome, Admin! Use this page to create and manage user
                  profiles, ensuring every customer has a smooth experience with
                  Black Forest Cake.
                </Text>
              </div>
              <div className="profile-form">
                <Title
                  level={4}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <UserAddOutlined
                    style={{
                      color: "#1890FF",
                      background: "#E6F7FF",
                      padding: "4px",
                      marginRight: "8px",
                      borderRadius: "50%",
                    }}
                  />
                  Create a User
                </Title>
                <Form
                  layout="vertical"
                  style={{ maxWidth: "800px" }}
                  onFinish={submitForm}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                          { required: true, message: "Please enter username" },
                        ]}
                      >
                        <Input placeholder="Enter username" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                          { required: true, message: "Please enter password" },
                        ]}
                      >
                        <Input.Password placeholder="Enter password" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Mobile Number"
                        name="mobileNumber"
                        rules={[
                          {
                            required: true,
                            message: "Please enter mobile number",
                          },
                        ]}
                      >
                        <Input placeholder="Enter mobile number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Email ID" name="email">
                        <Input placeholder="Enter email ID" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Address" name="address">
                        <Input placeholder="Enter address" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Branch"
                        name="branch"
                        rules={[
                          { required: true, message: "Please select a branch" },
                        ]}
                      >
                        <Select placeholder="Select branch" loading={loading}>
                          {stores.map((store) => (
                            <Option key={store.branch} value={store.name}>
                              {store.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Type"
                        name="type"
                        rules={[
                          { required: true, message: "Please enter type" },
                        ]}
                      >
                        <Select placeholder="Select type">
                          <Option value="waiter">Waiter</Option>
                          <Option value="manager">Manager</Option>
                          <Option value="chef">Chef</Option>
                          <Option value="superadmin">Super Admin</Option>
                          <Option value="deskadmin">Desk Admin</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Access"
                        name="access"
                        rules={[
                          {
                            required: true,
                            message: "Please enter access level",
                          },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select access level"
                        >
                          <Option value="all">All Pages</Option>
                          {allPages
                            .filter((page) => page !== "profile")
                            .map((page) => (
                              <Option key={page} value={page}>
                                {page
                                  .replace("-", " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="start">
                    <Button type="primary" htmlType="submit">
                      Create User
                    </Button>
                  </Row>
                </Form>
              </div>
            </div>
          </>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
