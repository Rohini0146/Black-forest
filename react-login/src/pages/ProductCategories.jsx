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
  Select,
  Checkbox,
  Upload,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
const { Title } = Typography;

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    parentId: null,
    isPastryProduct: false,
    image: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://139.59.60.185:3001/productcategories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://139.59.60.185:3001/products"
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setNewCategoryData({
      name: category.name,
      parentId: category.parentId ? category.parentId._id : null,  
      isPastryProduct: category.isPastryProduct,
      image: category.image
        ? `http://139.59.60.185:3001/uploads/${category.image}`
        : null, // Set image URL properly
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://139.59.60.185:3001/productcategories/${id}`);
      setCategories(categories.filter((category) => category._id !== id));
      message.success("Category deleted successfully!");
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategoryData.name);
      formData.append("parentId", newCategoryData.parentId || "null"); // Ensure it's either null or an ObjectId
      formData.append("isPastryProduct", newCategoryData.isPastryProduct);
      if (newCategoryData.image) {
        formData.append("image", newCategoryData.image);
      }
  
      const response = await axios.post(
        "http://139.59.60.185:3001/productcategories",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Add the new category to the state and map parentId to the full object if it exists
      setCategories((prev) => [
        ...prev,
        {
          ...response.data,
          parentId: categories.find((cat) => cat._id === newCategoryData.parentId) || null, // Map parentId to its full object
        },
      ]);
  
      setIsAdding(false);
      resetForm();
      message.success("Category created successfully!");
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategoryData.name);
      formData.append("parentId", newCategoryData.parentId || "null");
      formData.append("isPastryProduct", newCategoryData.isPastryProduct);
  
      if (newCategoryData.image) {
        formData.append("image", newCategoryData.image);
      }
  
      const response = await axios.put(
        `http://139.59.60.185:3001/productcategories/${currentCategory._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Update the specific category in the state and map parentId to the full object if it exists
      setCategories((prev) =>
        prev.map((category) =>
          category._id === currentCategory._id
            ? {
                ...response.data,
                parentId: categories.find((cat) => cat._id === newCategoryData.parentId) || null, // Map parentId to its full object
              }
            : category
        )
      );
  
      setIsEditing(false);
      setCurrentCategory(null);
      message.success("Category updated successfully!");
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentCategory(null);
    resetForm();
  };

  const resetForm = () => {
    setNewCategoryData({
      name: "",
      parentId: null,
      isPastryProduct: false,
      image: null,
    });
  };

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
      title: "Parent Category",
      render: (text, record) =>
        record.parentId ? record.parentId.name : "None",
    },
    {
      title: "Is Pastry Product",
      render: (text, record) => (
        <Checkbox checked={record.isPastryProduct} disabled />
      ),
    },
    {
      title: "Image",
      render: (text, record) =>
        record.image ? (
          <Image
            width={50}
            src={`http://139.59.60.185:3001/uploads/${record.image}`}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <span>
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
              <Title level={2}>Product Categories</Title>
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
                <span>Total Categories: {categories.length}</span>
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
                Add New Category
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={categories.filter((category) =>
              category.name.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            rowKey="_id"
          />
        </Card>
      </Layout.Content>

      <Modal
        title={
          <div style={{ padding: "0 20px 25px 20px" }}>
            {isEditing ? "Edit Category" : "Add Category"}
          </div>
        }
        visible={isEditing || isAdding}
        onCancel={handleCancel}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            style={{ marginBottom: "20px", marginRight: "20px" }}
          >
            Cancel
          </Button>,
          <Button
            style={{ marginBottom: "20px", marginRight: "20px" }}
            key="submit"
            type="primary"
            loading={loading}
            onClick={isEditing ? handleUpdate : handleCreate}
            disabled={loading}
          >
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form layout="vertical" style={{ padding: "0 20px" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Name"
                required
                validateStatus={!newCategoryData.name ? "error" : ""}
                help={!newCategoryData.name ? "Category name is required" : ""}
              >
                <Input
                  value={newCategoryData.name}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                />
              </Form.Item>

              <Form.Item label="Parent Category">
                <Select
                  value={newCategoryData.parentId}
                  onChange={(value) =>
                    setNewCategoryData({ ...newCategoryData, parentId: value })
                  }
                  placeholder="Select parent category"
                  allowClear
                >
                  {categories
                    .filter((category) => !category.parentId)
                    .map((category) => (
                      <Select.Option key={category._id} value={category._id}>
                        {category.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item label="Is Pastry Product">
                <Checkbox
                  checked={newCategoryData.isPastryProduct}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      isPastryProduct: e.target.checked,
                    })
                  }
                >
                  Yes
                </Checkbox>
              </Form.Item>
              <Form.Item label="Category Image">
                <Upload
                  beforeUpload={(file) => {
                    setNewCategoryData({
                      ...newCategoryData,
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
              {newCategoryData.image &&
                (typeof newCategoryData.image === "string" ? (
                  <img
                    src={newCategoryData.image}
                    alt="Product"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(newCategoryData.image)}
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

export default ProductCategories;
