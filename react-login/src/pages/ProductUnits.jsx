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
  message
} from "antd";
const { Title } = Typography;

const ProductUnits = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [newUnitName, setNewUnitName] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await fetch("http://139.59.60.185:3001/productunits");
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        console.error("Failed to fetch units");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (unit) => {
    setIsEditing(true);
    setCurrentUnit(unit);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    console.log("Deleting unit with ID:", id);  // Add a log to check the ID
    try {
      const response = await fetch(`http://139.59.60.185:3001/productunits/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUnits(units.filter((unit) => unit._id !== id));
        message.success("Unit Delete successfully!");
      } else {
        console.error("Failed to delete unit, response status:", response.status);
      }
    } catch (error) {
      console.error("Error during delete:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleUpdate = async () => {
    setLoading(true); // Set loading state to true
    const updatedUnit = { name: currentUnit.name };
    try {
      const response = await fetch(
        `http://139.59.60.185:3001/productunits/${currentUnit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUnit),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnits(units.map((unit) => (unit._id === data._id ? data : unit)));
        setIsEditing(false);
        setCurrentUnit(null);
        message.success("Unit updated successfully!");
      } else {
        console.error("Failed to update unit");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleCreate = async () => {
    setLoading(true); // Set loading state to true
    const newUnit = {
      name: newUnitName,
    };
    try {
      const response = await fetch("http://139.59.60.185:3001/productunits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUnit),
      });
      if (response.ok) {
        const createdUnit = await response.json();
        setUnits([...units, createdUnit]);
        setIsAdding(false);
        setNewUnitName("");
        message.success("Unit Created successfully!");
      } else {
        console.error("Failed to create unit");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentUnit(null);
    setNewUnitName("");
  };

  const columns = [
    {
      title: "S.No", // Changed title to "S.No"
      key: "serialNumber", // Add a new key for serial number
      render: (_, record, index) => index + 1, // Display the index + 1 for serial number
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(record._id)} // Use _id for the unit's unique identifier
            type="link"
            danger
          >
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
              <Title level={2}>Product Units</Title>
            </Col>
            <Col span={24} style={{display:"flex", justifyContent:"end", marginBottom: "20px" }}>
                          <div>
                            <span>Total Units: {units.length}</span>
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
                onClick={handleAdd}
                style={{ marginBottom: 20 }}
                loading={loading} // Show loading state while creating unit
                disabled={loading} // Disable the button during loading
              >
                Add New Unit
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={units.filter((unit) =>
              unit.name.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            rowKey="_id" // Use _id for the rowKey
          />
        </Card>
      </Layout.Content>

      <Modal
        title={
          <div style={{ padding: "0 20px" }}>
            {isEditing ? "Edit Unit" : "Add Unit"}
          </div>
        }
        visible={isEditing || isAdding}
        onCancel={handleCancel}
        onOk={isEditing ? handleUpdate : handleCreate}
        destroyOnClose
        width={500}
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
            loading={loading} // Show loading while submitting
            onClick={isEditing ? handleUpdate : handleCreate}
            style={{ marginBottom: "20px", marginRight: "20px" }}
            disabled={loading} // Disable the button while loading
          >
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form layout="vertical" style={{ padding: "20px" }}>
          <Form.Item label="Unit Name" required>
            <Input
              value={isEditing ? currentUnit.name : newUnitName}
              onChange={(e) =>
                isEditing
                  ? setCurrentUnit({ ...currentUnit, name: e.target.value })
                  : setNewUnitName(e.target.value)
              }
              placeholder="Enter the unit name"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProductUnits;
