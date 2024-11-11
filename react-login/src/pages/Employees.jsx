import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Input, Select, Button, Space, message } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]); // Store the branch data
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Get the currently logged-in username from local storage
  const currentUser = localStorage.getItem("username");

  // Fetch employees and stores when the component is mounted
  useEffect(() => {
    const fetchEmployeesAndStores = async () => {
      try {
        // Fetch employees
        const employeeResponse = await axios.get(
          "http://43.205.54.210:3001/addusers"
        );
        setEmployees(employeeResponse.data);

        // Fetch stores (for branches)
        const storeResponse = await axios.get(
          "http://43.205.54.210:3001/stores"
        );
        setStores(storeResponse.data); // Assuming stores contain branches
      } catch (error) {
        message.error("Error fetching employee or store data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesAndStores();
  }, []);

  // Search filter
  const handleSearch = () => {
    return employees.filter((employee) =>
      employee.username.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // Branch and Type Filters
  const handleBranchChange = (value) => {
    setSelectedBranch(value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  // Force Logout
  const handleForceLogout = (id) => {
    axios
      .put(`http://43.205.54.210:3001/addusers/${id}/forceLogout`)
      .then((response) => {
        message.success("User has been forcefully logged out");
        setEmployees(employees.filter((emp) => emp._id !== id));  // Remove the user from the list
        window.location.replace("/login"); // Redirect to the login page
      })
      .catch((error) => {
        console.error("Error during force logout:", error);
        message.error("Error logging out user");
      });
  };
  
  
  
  
  // Function to determine the status of the user (active or last login time)
  const handleStatus = (isUserLogin) => {
    return isUserLogin ? "Active Now" : "Not Active";
  };

  // Sorting employees so active users come first
  const data = handleSearch()
    .map((employee, index) => ({
      key: employee._id, // Ensure the key is unique per employee
      username: employee.username,
      branch: employee.branch,
      type: employee.type,
      status: handleStatus(employee.isUserLogin),
    }))
    .sort((a, b) => {
      // Sort active users to the top
      if (a.status === "Active Now" && b.status !== "Active Now") {
        return -1;
      }
      if (b.status === "Active Now" && a.status !== "Active Now") {
        return 1;
      }
      // For other users, sort by last login time if needed (optional)
      return new Date(b.status) - new Date(a.status);
    })
    .map((employee, index) => ({
      ...employee,
      key: index + 1, // Update the serial number based on the sorted data
    }));

  const columns = [
    { title: "S.No", dataIndex: "key", key: "key" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Branch", dataIndex: "branch", key: "branch" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status === "Active Now" ? "green" : "red" }}>
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} />
          <Button type="link" onClick={() => handleForceLogout(record.key)}>
            Force Logout
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Employee List</h2>

      {/* Search Bar */}
      <Input.Search
        placeholder="Search employees"
        onSearch={(value) => setSearchText(value)}
        style={{ width: 300, marginBottom: 20 }}
      />

      {/* Filters */}
      <Space style={{ marginBottom: 20 }}>
        <Select
          placeholder="Filter by Branch"
          onChange={handleBranchChange}
          style={{ width: 200 }}
        >
          {stores.map((store) => (
            <Option key={store.branch} value={store.name}>
              {store.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by Type"
          onChange={handleTypeChange}
          style={{ width: 200 }}
        >
          <Option value="waiter">Waiter</Option>
          <Option value="cashier">Cashier</Option>
          <Option value="manager">Manager</Option>
        </Select>
      </Space>

      {/* Employee Table */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowKey="_id"
      />
    </div>
  );
};

export default Employees;
