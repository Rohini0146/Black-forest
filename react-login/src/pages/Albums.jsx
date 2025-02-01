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
  Checkbox,
} from "antd";
const { Title } = Typography;

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isActive, setIsActive] = useState(true); // Add state for isActive
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://139.59.60.185:3001/albums");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      } else {
        console.error("Failed to fetch Albums");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked) => {
    if (isEditing) {
      setCurrentAlbum({ ...currentAlbum, isActive: checked });
    } else {
      setIsActive(checked);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    const newAlbum = {
      name: newAlbumName,
      isActive, // Include isActive when creating a new album
    };
    try {
      const response = await fetch("http://139.59.60.185:3001/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAlbum),
      });
      if (response.ok) {
        const createdAlbum = await response.json();
        setAlbums([...albums, createdAlbum]);
        setIsAdding(false);
        setNewAlbumName("");
        setIsActive(true); // Reset checkbox
        message.success("Album created successfully!");
      } else {
        console.error("Failed to create Album");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const updatedAlbum = {
      name: currentAlbum.name,
      isActive: currentAlbum.isActive,
    };
  
    try {
      const response = await fetch(
        `http://139.59.60.185:3001/albums/${currentAlbum._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAlbum),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setAlbums(
          albums.map((album) => (album._id === data._id ? data : album))
        );
        setIsEditing(false);
        setCurrentAlbum(null);
        message.success("Album updated successfully!");
      } else {
        message.error("Failed to update album.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while updating the album.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentAlbum(null);
    setNewAlbumName("");
    setIsActive(true); // Reset checkbox
  };

    const handleDelete = async (id) => {
      setLoading(true);
      console.log("Deleting unit with ID:", id);  // Add a log to check the ID
      try {
        const response = await fetch(`http://139.59.60.185:3001/albums/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setAlbums(albums.filter((album) => album._id !== id));
          message.success("Album Delete successfully!");
        } else {
          console.error("Failed to delete unit, response status:", response.status);
        }
      } catch (error) {
        console.error("Error during delete:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleEdit = (album) => {
    console.log("Editing Album:", album); // Debug
    setIsEditing(true);
    setCurrentAlbum(album);
  };
  

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content style={{ padding: "30px" }}>
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Title level={2}>Product Albums</Title>
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
                <span>Total Albums: {albums.length}</span>
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
                Add New Album
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={albums.filter((album) =>
              album.name.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={[
              {
                title: "S.No",
                key: "serialNumber",
                render: (_, record, index) => index + 1,
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
                  <span
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button onClick={() => handleEdit(record)} type="link">
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(record._id)}
                      type="link"
                      danger
                    >
                      Delete
                    </Button>
                  </span>
                ),
              },
            ]}
            rowKey="_id"
          />
        </Card>
      </Layout.Content>

      <Modal
        title={isEditing ? "Edit Album" : "Add Album"}
        visible={isEditing || isAdding}
        onCancel={handleCancel}
        onOk={isEditing ? handleUpdate : handleCreate}
        destroyOnClose
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={isEditing ? handleUpdate : handleCreate}
          >
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Album Name" required>
            <Input
              value={isEditing ? currentAlbum?.name || "" : newAlbumName}
              onChange={(e) =>
                isEditing
                  ? setCurrentAlbum({ ...currentAlbum, name: e.target.value })
                  : setNewAlbumName(e.target.value)
              }
              placeholder="Enter the album name"
            />
          </Form.Item>
          <Form.Item label="Enable Album">
            <Checkbox
              checked={isEditing ? currentAlbum?.isActive || false : isActive}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
            >
              Active
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Albums;
