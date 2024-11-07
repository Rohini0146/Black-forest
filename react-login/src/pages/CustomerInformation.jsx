import React, { useState, useEffect, useCallback } from "react";
import { Table, Tabs, Select, DatePicker, message, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import { FilterOutlined } from "@ant-design/icons";
import "./CustomerInformation.css";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CustomerInformation = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState({});
  const [activeTab, setActiveTab] = useState("recent");
  const [filterType, setFilterType] = useState("orderDate");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState("Show All");

  const limit = 3000;

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      const branchesData = response.data;
      const branchesMap = {};
      branchesData.forEach((branch) => {
        branchesMap[branch._id] = branch.branch;
      });
      setBranches(branchesMap);
    } catch (error) {
      console.error("Error fetching branches:", error);
      message.error("Failed to fetch branches. Please try again later.");
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?limit=${limit}`
      );
      const { orders } = response.data;
      setCustomers(orders);
      setFilteredCustomers(orders);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBranches();
    fetchOrders();
  }, [fetchOrders]);

  const filterCustomersByTab = (key) => {
    const now = new Date();
    let filtered = [];

    const sortedCustomers = [...customers].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (key === "recent") {
      filtered = sortedCustomers.slice(0, 20);
    } else if (key === "lastWeek") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filtered = sortedCustomers.filter(
        (customer) => new Date(customer.created_at) >= lastWeek
      );
    } else if (key === "lastMonth") {
      const lastMonth = new Date(now.setDate(now.getDate() - 30));
      filtered = sortedCustomers.filter(
        (customer) => new Date(customer.created_at) >= lastMonth
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setIsDateFilterActive(false);
    filterCustomersByTab(key);
  };

  const handleRangeChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      const [start, end] = dates;
      const adjustedEndDate = end.add(1, "day").startOf("day");
      fetchFilteredOrders(
        start.startOf("day").format("YYYY-MM-DD"),
        adjustedEndDate.format("YYYY-MM-DD"),
        filterType,
        selectedResponse
      );
      setIsDateFilterActive(true);
    } else {
      fetchOrders();
      setIsDateFilterActive(false);
    }
  };

  const handleResponseChange = (value) => {
    setSelectedResponse(value);
    if (dateRange && dateRange.length === 2) {
      // Only apply response filter if a date range is selected
      const [start, end] = dateRange;
      const adjustedEndDate = end.add(1, "day").startOf("day");
      fetchFilteredOrders(
        start.startOf("day").format("YYYY-MM-DD"),
        adjustedEndDate.format("YYYY-MM-DD"),
        filterType,
        value
      );
    } else {
      message.info("Please select a date range first.");
      setFilteredCustomers(customers); // Reset to original data if no date range is selected
    }
  };

  const fetchFilteredOrders = async (
    startDate,
    endDate,
    filterType,
    responseType = "Show All"
  ) => {
    setLoading(true);
    try {
      const dateField =
        filterType === "birthdayDate" ? "birthday_date" : "created_at";
      let url = `http://43.205.54.210:3001/orders?startDate=${startDate}&endDate=${endDate}&dateField=${dateField}`;

      if (responseType !== "Show All") {
        url += `&response=${responseType}`;
      }

      const response = await axios.get(url);
      const { orders } = response.data;

      const filteredData = orders.filter((order) => {
        const dateValue =
          filterType === "birthdayDate"
            ? order.birthday_date
            : order.created_at;
        return (
          dateValue &&
          moment(dateValue).isBetween(startDate, endDate, null, "[]") &&
          (responseType === "Show All" || order.response === responseType)
        );
      });

      setFilteredCustomers(filteredData);
    } catch (error) {
      console.error("Error fetching filtered customers:", error);
      message.error("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    setDateRange(null); // Clear the date range in the RangePicker
    fetchOrders(); // Reload all orders when switching filter type
    setCurrentPage(1); // Reset pagination
  };

  const responseColors = {
    "No Need": "red",
    "Not Interest": "#FF6347", // Tomato
    "Out of Station": "#8A2BE2", // BlueViolet
    "Not Reachable": "#DC143C", // Crimson
    "Not Answering": "#DC143C",
    "Other Shop": "#A52A2A", // Brown
    "Visit Come to Shop": "#2E8B57", // SeaGreen
    Waiting: "orange",
    "Order Taken by Customer": "green",
    "Customer need not possible": "#FF4500", // OrangeRed
    "Whatsapp Model": "darkgreen",
  };

  const responseOptions = ["Show All", ...Object.keys(responseColors)];

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },

    { title: "Name", dataIndex: "customer_name", key: "customer_name" },
    { title: "Phone", dataIndex: "customer_phone", key: "customer_phone" },
    { title: "Response", dataIndex: "response", key: "response" },
    { title: "Cake Model", dataIndex: "cake_model", key: "cake_model" },
    { title: "Price", dataIndex: "amount", key: "amount" },
    {
      title: "Birthday Date",
      dataIndex: "birthday_date",
      key: "birthday_date",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Branch Name",
      dataIndex: "branch",
      key: "branch",
      render: (branchId) => branches[branchId] || "Unknown Branch",
    },
    { title: "Order ID", dataIndex: "form_no", key: "form_no" },
  ];

  useEffect(() => {
    if (!isDateFilterActive && customers.length > 0) {
      filterCustomersByTab(activeTab);
    }
  }, [customers, activeTab, isDateFilterActive]);

  return (
    <div
      className="outer-padding"
      style={{ backgroundColor: "#fff", padding: "24px" }}
    >
      <div
        className="head-tab"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="tabs">
          <TabPane tab="Recent" key="recent" />
          <TabPane tab="Last Week" key="lastWeek" />
          <TabPane tab="Last Month" key="lastMonth" />
        </Tabs>

        <Select
          style={{ width: 200, marginBottom: 20 }}
          value={selectedResponse}
          onChange={handleResponseChange}
        >
          {responseOptions.map((response) => (
            <Option key={response} value={response}>
              {response}
            </Option>
          ))}
        </Select>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            defaultValue="orderDate"
            onChange={handleFilterTypeChange}
            style={{ width: 150, marginRight: 10 }}
          >
            <Option value="orderDate">Order Date</Option>
            <Option value="birthdayDate">birthday Date</Option>
          </Select>
          <RangePicker value={dateRange} onChange={handleRangeChange} />
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          pagination={{
            pageSize: undefined,
            showTotal: (total) => `Total ${total} items`,
            style: {
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#e6f7ff",
            },
          }}
          rowKey={(record) => record._id}
          style={{ padding: "0px", overflowX: "auto" }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </div>
  );
};

export default CustomerInformation;
