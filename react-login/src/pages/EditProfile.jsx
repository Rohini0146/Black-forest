import React, { useState, useEffect } from "react";
import { Input, Select, Button, message, Form, Row, Col, Tag } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const EditProfile = () => {
  const { username } = useParams();
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
    mobileNumber: "",
    branch: "",
    type: "",
    email: "",
    address: "",
    access: [],
  });
  const [originalUserDetails, setOriginalUserDetails] = useState({});
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user details and store data when the component is mounted
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!username) {
          console.error("Username is not defined");
          return;
        }

        const response = await axios.get(
          `http://64.227.145.104:3001/addusers/${username}`
        );
        if (response.status === 200) {
          setUserDetails(response.data);
          setOriginalUserDetails(response.data); // Save original details for comparison
        } else {
          message.error("User not found");
        }
      } catch (error) {
        message.error("Error fetching user details.");
      }
    };

    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://64.227.145.104:3001/stores");
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
        message.error("Error fetching store data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    fetchStores();
  }, [username]);

  const accessOptions = [
    "profile",
    "employees",
    "live-branch-order",
    "branch-order",
    "stock-order",
    "branch-view",
    "product-view",
    "return-order",
    "payments",
    "user-track",
    "reports-by-order",
    "dashboard",
    "customer-information",
    "live-order",
    "order-history",
    "product-information",
    "payment-information",
    "sales-person",
    "customer-analysis",
    "logs",
  ];

  // Handle adding new access without overwriting existing access
  const handleAddAccess = async (newAccess) => {
    const updatedAccess = [
      ...userDetails.access,
      ...newAccess.filter((item) => !userDetails.access.includes(item)),
    ];
    try {
      await axios.put(`http://64.227.145.104:3001/addusers/${username}`, {
        access: updatedAccess,
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        access: updatedAccess,
      }));
      message.success("Access levels updated successfully!");
    } catch (error) {
      message.error("Error updating access levels. Please try again.");
      console.error(error);
    }
  };

  // Handle removing access when clicking "X"
  const handleRemoveAccess = async (removedAccess) => {
    const updatedAccess = userDetails.access.filter(
      (item) => item !== removedAccess
    );
    try {
      await axios.put(`http://64.227.145.104:3001/addusers/${username}`, {
        access: updatedAccess,
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        access: updatedAccess,
      }));
      message.success("Access level removed successfully");
    } catch (error) {
      message.error("Error removing access level. Please try again.");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Determine which fields have changed
    const updatedFields = {};
    Object.keys(userDetails).forEach((key) => {
      if (userDetails[key] !== originalUserDetails[key]) {
        updatedFields[key] = userDetails[key];
      }
    });

    // Only proceed if there are fields to update
    if (Object.keys(updatedFields).length === 0) {
      message.info("No changes detected.");
      setLoading(false);
      return;
    }

    try {
      // Send only the modified fields to the server
      await axios.put(
        `http://64.227.145.104:3001/addusers/${username}`,
        updatedFields
      );

      message.success("Profile updated successfully!");
      navigate(`/dashboard/employees`);
    } catch (error) {
      message.error("Error updating profile. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <Form layout="vertical" style={{ maxWidth: 800 }} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Username" name="username">
              <Input value={userDetails.username} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Password" name="password">
              <Input.Password
                value={userDetails.password}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, password: e.target.value })
                }
                placeholder="Enter new password"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Mobile Number" name="mobileNumber">
              <Input
                value={userDetails.mobileNumber}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    mobileNumber: e.target.value,
                  })
                }
                placeholder="Enter mobile number"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Email" name="email">
              <Input
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Branch" name="branch">
              <Select
                value={userDetails.branch}
                onChange={(value) =>
                  setUserDetails({ ...userDetails, branch: value })
                }
                placeholder="Select branch"
                loading={loading}
              >
                {stores.map((store) => (
                  <Option key={store._id} value={store.branch}>
                    {store.branch}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Type" name="type">
              <Select
                value={userDetails.type}
                onChange={(value) =>
                  setUserDetails({ ...userDetails, type: value })
                }
                placeholder="Select type"
              >
                <Option value="waiter">Waiter</Option>
                <Option value="chef">Chef</Option>
                <Option value="manager">Manager</Option>
                <Option value="superadmin">Super Admin</Option>
                <Option value="deskadmin">Desk Admin</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input
                value={userDetails.address}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Display Current Access */}
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item label="Current Access Levels">
              <div>
                {userDetails.access.map((access) => (
                  <Input
                    key={access}
                    value={access}
                    readOnly
                    suffix={
                      <Button
                        type="text"
                        onClick={() => handleRemoveAccess(access)}
                        style={{ color: "red" }}
                      >
                        X
                      </Button>
                    }
                    style={{
                      marginBottom: "8px",
                      width: "60%", // Set a narrower width
                      maxWidth: "180px", // Optional max width
                      padding: "4px 8px", // Reduce padding for a compact look
                      fontSize: "14px",
                      marginRight: '15px' // Adjust font size for compactness
                    }}
                  />
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>

        {/* Add New Access Levels */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Add Access Levels">
              <Select
                mode="multiple"
                placeholder="Select access level(s)"
                onChange={(value) => handleAddAccess(value)}
              >
                {accessOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditProfile;
