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
  Divider,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [units, setUnits] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProductData, setNewProductData] = useState({
    name: "",
    category: null,
    album: null,
    description: "",
    directuse: "",
    footnote: "",
    ingredients: "",
    images: [],
    price: [], // Ensure price is initialized as an empty array
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const onCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    resetForm();
    fetchProducts(); // Refetch products to ensure the list is updated
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAlbums();
    fetchUnits();
  }, []);

  const typeMapping = [
    { _id: "1", name: "Fresh Cream" },
    { _id: "2", name: "Butter Cream" },
  ];

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://139.59.60.185:3001/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://139.59.60.185:3001/productcategories"
      );
      console.log("Categories fetched:", response.data); // Check if data is correct
      const filteredCategories = response.data.filter(
        (category) => !category.isPastryProduct
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await axios.get("http://139.59.60.185:3001/albums");
      console.log("Albums fetched:", response.data);
      setAlbums(response.data);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get("http://139.59.60.185:3001/productunits");
      console.log("Units fetched:", response.data);
      setUnits(response.data);
    } catch (error) {
      console.error("Failed to fetch units:", error);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newProductData.name || "");
      formData.append("category", newProductData.category || "");
      formData.append("album", newProductData.album || "");
      formData.append("description", newProductData.description || "");
      formData.append("directuse", newProductData.directuse || "");
      formData.append("footnote", newProductData.footnote || "");
      formData.append("ingredients", newProductData.ingredients || "");
  
      // Serialize price details into JSON string
      formData.append("price", JSON.stringify(newProductData.price || []));
  
      newProductData.images.forEach((image) => {
        formData.append("images", image);
      });
  
      // Make the API call to create a new product
      const response = await axios.post(
        "http://139.59.60.185:3001/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Update the local state with the new product
      const newProduct = {
        ...response.data,
        category: categories.find((category) => category._id === response.data.category) || null,
        album: albums.find((album) => album._id === response.data.album) || null,
      };
  
      setProducts((prev) => [newProduct, ...prev]); // Add the new product to the top of the list
  
      // Close the modal and reset the form
      setIsAdding(false);
      resetForm();
      message.success("Product created successfully!");
    } catch (error) {
      console.error("Failed to create product:", error);
      message.error("Failed to create product!");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newProductData.name || "");
      formData.append("category", newProductData.category || "null");
      formData.append("album", newProductData.album || "null");
      formData.append("description", newProductData.description || "");
      formData.append("directuse", newProductData.directuse || "");
      formData.append("footnote", newProductData.footnote || "");
      formData.append("ingredients", newProductData.ingredients || "");

      // Serialize the price array into a JSON string
      formData.append("price", JSON.stringify(newProductData.price || []));

      newProductData.images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.put(
        `http://139.59.60.185:3001/products/${currentProduct._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Map back category, album, and unit objects for the updated product
      const updatedProduct = {
        ...response.data,
        category:
          categories.find(
            (category) => category._id === response.data.category
          ) || null,
        album:
          albums.find((album) => album._id === response.data.album) || null,
        price: response.data.price.map((priceDetail) => ({
          ...priceDetail,
          unit: units.find((unit) => unit._id === priceDetail.unit) || null,
        })),
      };

      setProducts((prev) =>
        prev.map((product) =>
          product._id === response.data._id ? updatedProduct : product
        )
      );
      setIsEditing(false);
      setCurrentProduct(null);
      message.success("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://139.59.60.185:3001/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      message.success("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProductData({
      name: "",
      category: null,
      album: null,
      description: "",
      directuse: "",
      footnote: "",
      ingredients: "",
      images: [],
      price: [
        {
          price: "",
          qty: "",
          offerPercent: 0,
          unit: "",
          type: "",
        },
      ], // Ensure at least one price detail row is initialized
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
      title: "Category",
      render: (text, record) =>
        record.category ? record.category.name : "None",
    },
    {
      title: "Album",
      render: (text, record) => (record.album ? record.album.name : "None"),
    },
    {
      title: "Status",
      render: (text, record) => <Checkbox checked={record.isActive} disabled />,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button onClick={() => handleDelete(record._id)} type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);

    setNewProductData({
      ...product,
      category: product.category ? product.category._id : null,
      album: product.album ? product.album._id : null,
      images: (product.images || []).map((image) => ({
        uid: image,
        name: image,
        status: "done",
        url: `http://139.59.60.185:3001/uploads/${image}`, // Adjust the URL based on your backend
      })),
      price: product.price?.length
        ? product.price.map((priceDetail) => ({
            ...priceDetail,
            type: priceDetail.type, // Use the stored type ID
            unit: priceDetail.unit?._id, // Map unit to its ID
          }))
        : [
            {
              price: "",
              qty: "",
              offerPercent: 0,
              unit: "",
              type: "",
            },
          ], // Ensure one empty row if no price details
    });
  };

  const handleAddProduct = () => {
    setIsAdding(true);
    resetForm();
    setNewProductData({
      ...newProductData,
      price: [
        {
          price: "",
          qty: "",
          offerPercent: 0,
          unit: "",
          type: "",
        },
      ], // Initialize with one empty row
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content style={{ padding: "30px" }}>
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Title level={2}>Products</Title>
            </Col>
            <Col span={24}>
              <Input
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 20 }}
              />
              <Select
                placeholder="Filter by category"
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                allowClear
                style={{ width: 215, marginRight: 10 }}
              >
                {categories.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by album"
                value={selectedAlbum}
                onChange={(value) => setSelectedAlbum(value)}
                allowClear
                style={{ width: 215, marginRight: 10 }}
              >
                {albums.map((album) => (
                  <Select.Option key={album._id} value={album._id}>
                    {album.name}
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Filter by unit"
                value={selectedUnit}
                onChange={(value) => {
                  console.log("Selected Unit:", value); // Debugging
                  setSelectedUnit(value);
                }}
                allowClear
                style={{ width: 215, marginRight: 10 }}
              >
                {units.map((unit) => (
                  <Select.Option key={unit._id} value={unit._id}>
                    {unit.name}
                  </Select.Option>
                ))}
              </Select>

              <Button
                type="primary"
                onClick={() => setIsAdding(true)}
                style={{ marginBottom: 20, width: 215 }}
                loading={loading}
                disabled={loading}
              >
                Add New Product
              </Button>
            </Col>
          </Row>

          <Table
            dataSource={products.filter((product) => {
              const matchesName = product.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
              const matchesCategory =
                !selectedCategory || product.category?._id === selectedCategory;
              const matchesAlbum =
                !selectedAlbum || product.album?._id === selectedAlbum;
              const matchesUnit =
                !selectedUnit ||
                product.price.some(
                  (priceDetail) => priceDetail.unit?._id === selectedUnit
                );

              return (
                matchesName && matchesCategory && matchesAlbum && matchesUnit
              );
            })}
            columns={columns}
            rowKey="_id"
          />
        </Card>
      </Layout.Content>

      <Modal
        title={isEditing ? "Edit Product" : "Add Product"}
        visible={isEditing || isAdding}
        onCancel={onCancel} // Use the updated onCancel function
        footer={[
          <Button
            key="back"
            onClick={onCancel}
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
          >
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
        width={800}
        style={{ top: 20, margin: "0 auto" }}
      >
        <Form layout="vertical" style={{ padding: "0 20px" }}>
          <Form.Item
            label="Name"
            required
            rules={[{ required: true, message: "Product name is required!" }]}
          >
            <Input
              value={newProductData.name}
              onChange={(e) =>
                setNewProductData({ ...newProductData, name: e.target.value })
              }
              placeholder="Enter product name"
            />
          </Form.Item>
          <Form.Item label="Category" required>
            <Select
              placeholder="Select Category"
              value={newProductData.category} // This will bind the selected category
              onChange={(value) =>
                setNewProductData({ ...newProductData, category: value })
              }
              allowClear
            >
              {categories
                .filter((category) => !category.category)
                .map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Album" required>
            <Select
              placeholder="Select Album"
              value={newProductData.album} // This will bind the selected album
              onChange={(value) =>
                setNewProductData({ ...newProductData, album: value })
              }
              allowClear
            >
              {albums
                .filter((album) => !album.category)
                .map((album) => (
                  <Select.Option key={album._id} value={album._id}>
                    {album.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  description: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="Direct To Use">
            <Input.TextArea
              value={newProductData.directuse}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  directuse: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="Footnote">
            <Input.TextArea
              value={newProductData.footnote}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  footnote: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="Ingredients">
            <Input.TextArea
              value={newProductData.ingredients}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  ingredients: e.target.value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="Images">
            <Upload
              multiple
              listType="picture"
              defaultFileList={newProductData.images}
              onRemove={(file) => {
                setNewProductData({
                  ...newProductData,
                  images: newProductData.images.filter(
                    (img) => img.uid !== file.uid
                  ),
                });
              }}
              beforeUpload={(file) => {
                setNewProductData({
                  ...newProductData,
                  images: [...newProductData.images, file],
                });
                return false; // Prevent auto-upload
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Price Details">
            <Table
              dataSource={
                newProductData.price.length > 0
                  ? newProductData.price
                  : [
                      {
                        price: "",
                        qty: "",
                        offerPercent: 0,
                        unit: "",
                        type: "",
                      },
                    ]
              }
              columns={[
                {
                  title: "Price",
                  dataIndex: "price",
                  render: (_, record, index) => (
                    <Input
                      value={record.price}
                      onChange={(e) => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice[index].price = e.target.value;
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      placeholder="Enter Price"
                    />
                  ),
                },
                {
                  title: "Quantity",
                  dataIndex: "qty",
                  render: (_, record, index) => (
                    <Input
                      value={record.qty}
                      onChange={(e) => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice[index].qty = e.target.value;
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      placeholder="Enter Quantity"
                    />
                  ),
                },
                {
                  title: "Offer Percent",
                  dataIndex: "offerPercent",
                  render: (_, record, index) => (
                    <Input
                      value={record.offerPercent}
                      onChange={(e) => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice[index].offerPercent = e.target.value;
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      placeholder="Enter Offer %"
                    />
                  ),
                },
                {
                  title: "Unit",
                  dataIndex: "unit",
                  render: (_, record, index) => (
                    <Select
                      value={record.unit}
                      onChange={(value) => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice[index].unit = value;
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      style={{ width: 100 }}
                    >
                      {units.map((unit) => (
                        <Select.Option key={unit._id} value={unit._id}>
                          {unit.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: "Type",
                  dataIndex: "type",
                  render: (typeId, record, index) => (
                    <Select
                      value={typeId}
                      onChange={(value) => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice[index].type = value;
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      style={{ width: 150 }}
                    >
                      {typeMapping.map((type) => (
                        <Select.Option key={type._id} value={type._id}>
                          {type.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: "Actions",
                  render: (_, __, index) => (
                    <Button
                      type="text"
                      danger
                      onClick={() => {
                        const updatedPrice = [...newProductData.price];
                        updatedPrice.splice(index, 1);
                        setNewProductData({
                          ...newProductData,
                          price: updatedPrice,
                        });
                      }}
                      icon={<DeleteOutlined />}
                    />
                  ),
                },
              ]}
              rowKey={(record, index) => index}
              footer={() => (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setNewProductData({
                      ...newProductData,
                      price: [
                        ...newProductData.price,
                        {
                          price: "",
                          qty: "",
                          offerPercent: 0,
                          unit: "",
                          type: "",
                        },
                      ],
                    })
                  }
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "6px",
                  }}
                >
                  Add Price Detail
                </Button>
              )}
              bordered
              style={{
                borderRadius: "8px",
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Products;
