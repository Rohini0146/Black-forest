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
  const [activeTab, setActiveTab] = useState("recent");
  const [filterType, setFilterType] = useState("orderDate");

  const limit = 3000; // Load 3000 records initially

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?limit=${limit}`
      );

      const { orders, total } = response.data;
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
    fetchOrders(); // Fetch data when the component mounts
  }, [fetchOrders]);

  const handleRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      fetchFilteredOrders(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    } else {
      fetchOrders(); // If no date range, fetch the initial set of orders
    }
  };

  const fetchFilteredOrders = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.205.54.210:3001/orders?startDate=${startDate}&endDate=${endDate}`
      );

      const { orders, total } = response.data;
      setCustomers(orders);
      setFilteredCustomers(orders);
    } catch (error) {
      console.error("Error fetching filtered customers:", error);
      message.error("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "No", dataIndex: "no", key: "no", render: (text, record, index) => index + 1 },
    { title: "Order ID", dataIndex: "form_no", key: "form_no" },
    { title: "Name", dataIndex: "customer_name", key: "customer_name" },
    { title: "Phone", dataIndex: "customer_phone", key: "customer_phone" },
    { title: "Cake Model", dataIndex: "cake_model", key: "cake_model" },
    { title: "Price", dataIndex: "amount", key: "amount" },
    {
      title: "Birthday Date",
      dataIndex: "birthday_date",
      key: "birthday_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    { title: "Branch Name", dataIndex: "branch", key: "branch" },
  ];

  return (
    <div className="outer-padding" style={{ backgroundColor: "#fff", padding: "24px" }}>
      <div className="head-tab" style={{ display: "flex", justifyContent: "space-between", alignItems: 'baseline' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Recent" key="recent" />
          <TabPane tab="Last Week" key="lastWeek" />
          <TabPane tab="Last Month" key="lastMonth" />
        </Tabs>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            icon={<FilterOutlined />}
            defaultValue="orderDate"
            onChange={setFilterType}
            style={{ width: 150, marginRight: 10 }}
          >
            <Option value="orderDate">Order Date</Option>
            <Option value="birthdayDate">Birthday Date</Option>
          </Select>

          <RangePicker onChange={handleRangeChange} />
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          pagination={{
            pageSize: undefined,
            showTotal: (total) => `Total ${total} items`,
            style: { marginTop: "20px", padding: "15px", backgroundColor: "#e6f7ff" },
          }}
          rowKey={(record) => record._id}
          style={{ padding: '0px', overflowX: "auto" }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </div>
  );
};

export default CustomerInformation;
