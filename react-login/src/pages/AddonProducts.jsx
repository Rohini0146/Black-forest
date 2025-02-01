import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Typography,
  Layout,
  message,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
const { Title } = Typography;

const AddonProducts = () => {
  const [addonProducts, setAddonProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProductData, setNewProductData] = useState({
    name: "",
    price: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all addon products
  useEffect(() => {
    fetchAddonProducts();
  }, []);

  const fetchAddonProducts = async () => {
    try {
      const response = await axios.get("http://139.59.60.185:3001/addonproducts");
      setAddonProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch addon products:", error);
    }
  };

  // Handle product edit
  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setNewProductData({
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  // Handle product delete
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://139.59.60.185:3001/addonproducts/${id}`);
      setAddonProducts(addonProducts.filter((product) => product._id !== id));
      message.success("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product create
  const handleCreate = async () => {
    setLoading(true);
    try {
      // Create FormData to send to the server
      const formData = new FormData();
      formData.append("name", newProductData.name);
      formData.append("price", newProductData.price);

      // Append image if selected
      if (newProductData.image) {
        formData.append("image", newProductData.image);
      }

      // Send the request to create a new product
      const response = await axios.post(
        "http://139.59.60.185:3001/addonproducts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the state with the new product
      setAddonProducts([...addonProducts, response.data]);

      // Reset form data and close modal
      setIsAdding(false);
      setNewProductData({
        name: "",
        price: "",
        image: null,
      });

      message.success("Product created successfully!");
    } catch (error) {
      console.error("Failed to create product:", error);
      message.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newProductData.name);
      formData.append("price", newProductData.price);
      if (newProductData.image && typeof newProductData.image !== "string") {
        formData.append("image", newProductData.image);
      }

      const response = await axios.put(
        `http://139.59.60.185:3001/addonproducts/${currentProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setAddonProducts(
        addonProducts.map((product) =>
          product._id === currentProduct._id ? response.data : product
        )
      );
      setIsEditing(false);
      setCurrentProduct(null);
      message.success("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
      message.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentProduct(null);
    setNewProductData({
      name: "",
      price: "",
      image: null,
    });
  };

  // Columns for the Table
  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button onClick={() => handleDelete(record._id)} type="link" danger>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content style={{ padding: "30px" }}>
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Title level={2}>Addon Products</Title>
            </Col>
            <Col
              span={24}
              style={{
                display: "flex",
                justifyContent: "end",
                marginBottom: "20px",
              }}
            >
              <div>
                <span>Total Products: {addonProducts.length}</span>
              </div>
            </Col>
            <Col span={24}>
              <Input
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 20 }}
              />
              <Button
                type="primary"
                onClick={() => setIsAdding(true)}
                style={{ marginBottom: 20 }}
                loading={loading}
                disabled={loading}
              >
                Add New Product
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={addonProducts.filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            rowKey="_id"
          />
        </Card>
      </Layout.Content>

      <Modal
        title={
          <div style={{ padding: "0 20px 25px 20px" }}>
            {isEditing ? "Edit Addon Product" : "Add Addon Product"}
          </div>
        }
        visible={isEditing || isAdding}
        onCancel={handleCancel}
        onOk={isEditing ? handleUpdate : handleCreate}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            style={{ marginBottom: "20px", marginRight: "20px" }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={isEditing ? handleUpdate : handleCreate}
            style={{ marginBottom: "20px", marginRight: "20px" }}
            disabled={loading}
          >
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form layout="vertical" style={{ padding: "0 20px" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Product Name" required>
                <Input
                  value={newProductData.name}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                />
              </Form.Item>
              <Form.Item label="Price" required>
                <Input
                  value={newProductData.price}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      price: e.target.value,
                    })
                  }
                  placeholder="Enter product price"
                />
              </Form.Item>
              <Form.Item label="Product Image">
                <Upload
                  beforeUpload={(file) => {
                    setNewProductData({
                      ...newProductData,
                      image: file,
                    });
                    return false; // Prevent auto upload
                  }}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Choose File</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              {newProductData.image &&
                (typeof newProductData.image === "string" ? (
                  <img
                    src={`http://139.59.60.185:3001/uploads/${newProductData.image}`}
                    alt="Product"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(newProductData.image)}
                    alt="Product"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ))}
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AddonProducts;
