import { Button, DatePicker, message, Select, Table, Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import React, { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Option } = Select;

const History = () => {
  const [activeTab, setActiveTab] = useState("ordered");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("orderDate"); // Order/Delivery filter

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFilteredOrders(orders); // Reset filtered data on tab change
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
    const filtered = orders.filter((order) => {
      const dateToCompare =
        filterType === "orderDate" ? order.created_at : order.delivery_date;
      return moment(dateToCompare).isSame(dateString, "day");
    });
    setFilteredOrders(filtered);
  };

  const handleFilterTypeChange = (value) => {
    setFilterType(value); // Switch between Order Date and Delivery Date filter
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://64.227.145.104:3001/orders");
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Initialize filtered data with all orders
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Customer Name",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
        title: "Phone",
        dataIndex: "customer_phone",
        key: "customer_phone",
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => moment(created_at).format("DD-MM-YYYY"),
    },
    {
      title: "Delivery Date & Time",
      key: "delivery_date",
      render: (text, record) => (
        <>
          {moment(record.delivery_date).format("DD-MM-YYYY")} - {moment(record.delivery_time).format("hh:mm A")}
        </>
      ),
    },
    {
      title: "Advance Payment",
      dataIndex: "advance",
      key: "advance",
    },
    {
      title: "Pending Payment",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Status",
      dataIndex: "statusText",
      key: "statusText",
    },
  ];

  return (
    <div style={{ backgroundColor: "#fff", padding: 24, minHeight: 360 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{ color: "#fff" }}
        >
          <TabPane tab="Ordered" key="ordered" />
          <TabPane tab="In Progress" key="in progress" />
          <TabPane tab="Delivered" key="delivered" />
          <TabPane tab="Not Delivered" key="not delivered" />
        </Tabs>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            defaultValue="orderDate"
            onChange={handleFilterTypeChange}
            style={{ width: 150, marginRight: 10 }}
          >
            <Option value="orderDate">Order Date</Option>
            <Option value="deliveryDate">Delivery Date</Option>
          </Select>
          <DatePicker
            onChange={handleDateChange}
            style={{ marginLeft: "10px" }}
            placeholder={`Select ${
              filterType === "orderDate" ? "Order Date" : "Delivery Date"
            }`}
          />
        </div>
      </div>
      <Table
        dataSource={filteredOrders}
        columns={columns}
        pagination={{}}
        loading={loading}
        style={{ backgroundColor: "#e6f7ff" }}
        rowKey={(record) => record._id}
      />
    </div>
  );
};

export default History;
