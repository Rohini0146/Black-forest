import React, { useState, useEffect } from "react";
import { Table, Spin, message, Layout } from "antd";
import axios from "axios";

const { Content } = Layout;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://64.227.145.104:3001/userdatas");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      message.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "EmployeeID",
      key: "EmployeeID",
    },
    {
      title: "Login Time",
      dataIndex: "loginTime",
      key: "loginTime",
      render: (loginTime) => new Date(loginTime).toLocaleString(), // Format date nicely
    },
    {
      title: "User Agent",
      dataIndex: "userAgent",
      key: "userAgent",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "24px", backgroundColor: "#fff" }}>
        {loading ? (
          <Spin style={{ display: "block", marginTop: "50px", textAlign: "center" }} />
        ) : (
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default Logs;
