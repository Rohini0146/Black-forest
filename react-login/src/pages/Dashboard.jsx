import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Input, List } from "antd";
import axios from "axios";
import { PieChart, Pie, Cell } from "recharts";
import { Outlet } from "react-router-dom";
import "./Dashboard.css";

const { Content } = Layout;
const { Search } = Input;

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stores from the API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://43.205.54.210:3001/stores");
      setStores(response.data);
      setFilteredStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (value) => {
    const filtered = stores.filter((store) =>
      store.branch.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStores(filtered);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Layout
      className="dashboard"
      style={{ minHeight: "100vh", background: "transparent" }}
    >
      <Content>
        <Row className="content1" gutter={[16, 16]}>
          <Col span={8}>
            <Card title="Search Branch">
              <Search
                placeholder="Search Branch"
                onSearch={handleSearch}
                enterButton
              />
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "10px",
                }}
              >
                <List
                  dataSource={filteredStores}
                  renderItem={(store) => <List.Item>{store.branch}</List.Item>}
                />
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Order Summary">
              <PieChart width={200} height={200}>
                <Pie
                  data={[{ name: "Orders", value: 100 }]}
                  dataKey="value"
                  outerRadius={80}
                >
                  <Cell fill="#8884d8" />
                </Pie>
              </PieChart>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;
