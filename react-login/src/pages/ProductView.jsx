

import React, { useState, useEffect } from "react";
import { Card, Select, DatePicker, Button, message, Pagination } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./BranchView.css";

const { Option } = Select;

const ProductView = () => {
  const [type, setType] = useState("pending");
  const [branch, setBranch] = useState("All");
  const [orderedDate, setOrderedDate] = useState(moment()); // Default to current date
  const [deliveryDate, setDeliveryDate] = useState(null); 
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const navigate = useNavigate();

  // Fetch branch data
  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://43.205.54.210:3001/stores");
        if (response.data) {
          setBranches(response.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        message.error("Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch orders data with pagination and filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const filters = {
          page: currentPage,
          pageSize: pageSize,
        };

        // Apply filter for orderedDate (if selected)
        if (orderedDate) filters.orderedDate = orderedDate.format("YYYY-MM-DD");
        if (deliveryDate)
          filters.deliveryDate = deliveryDate.format("YYYY-MM-DD");
        if (branch !== "All") filters.branch = branch;
        if (type) filters.type = type;

        const response = await axios.get(
          "http://43.205.54.210:3001/placeorders",
          {
            params: filters,
          }
        );

        if (response.data) {
          setOrders(response.data.orders || []);
          setTotalOrders(response.data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderedDate, deliveryDate, branch, type, currentPage, pageSize]);

  const handleOrderDateChange = (date) => {
    setOrderedDate(date);
  };

  const handleDeliveryDateChange = (date) => {
    setDeliveryDate(date);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/view-order/${orderId}`);
  };

  // Format the branches for the specific product, grouping them by branch
  const formatBranches = (product) => {
    if (Array.isArray(product.branches) && product.branches.length > 0) {
      const groupedBranches = product.branches.reduce((acc, branch) => {
        if (acc[branch.name]) {
          acc[branch.name] += branch.quantity;
        } else {
          acc[branch.name] = branch.quantity;
        }
        return acc;
      }, {});

      const formattedBranches = Object.keys(groupedBranches)
        .map((branchName) => {
          return `${branchName} (${groupedBranches[branchName]} Pieces)`;
        })
        .join(" | ");

      return formattedBranches;
    }

    return "No branches available";
  };

  // Group products by name and calculate the total quantity per product
  const groupProductsByName = (orders) => {
    const productMap = {};

    orders.forEach((order) => {
      const branchName = order.branch;
      order.products.forEach((product) => {
        if (!productMap[product.name]) {
          productMap[product.name] = { totalQuantity: 0, branches: {} };
        }

        productMap[product.name].totalQuantity += product.quantity;

        if (!productMap[product.name].branches[branchName]) {
          productMap[product.name].branches[branchName] = 0;
        }
        productMap[product.name].branches[branchName] += product.quantity;
      });
    });

    return productMap;
  };

  const groupedProducts = groupProductsByName(orders);

  return (
    <div className="products-view">
      <h2>Product Orders</h2>
      <div className="filter-container">
        <div className="filter-item">
          <label>Branch</label>
          <Select
            value={branch}
            onChange={setBranch}
            className="filter-select"
            loading={loading}
          >
            <Option value="All">All</Option>
            {branches.map((branch) => (
              <Option key={branch._id} value={branch.branch}>
                {branch.branch}
              </Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <label>Ordered Date</label>
          <DatePicker
            value={orderedDate}
            onChange={handleOrderDateChange}
            placeholder="Ordered Date"
            style={{ width: "100%" }}
          />
        </div>
        <div className="filter-item">
          <label>Delivery Date</label>
          <DatePicker
            value={deliveryDate}
            onChange={handleDeliveryDateChange}
            placeholder="Delivery Date"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Display grouped products */}
      {Object.keys(groupedProducts).map((productName) => {
        const product = groupedProducts[productName];
        return (
          <Card key={productName} className="order-card">
            <div className="order-details-1">
              <div className="product-view">
                <div className="product-info">
                  <p>
                    <b>Product: </b> {productName}
                  </p>
                  <p>
                    <b>Total Quantity: </b> {product.totalQuantity} Pieces
                  </p>
                  <p>
                    <b>Branches: </b>
                    {Object.keys(product.branches).map((branch, index) => (
                      <span key={branch}>
                        {branch} ({product.branches[branch]})
                        {index < Object.keys(product.branches).length - 1 &&
                          " | "}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="order-action">
                <Button
                  type="primary"
                  onClick={() => handleViewOrder(productName)}
                >
                  View Order
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Pagination */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalOrders}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50]}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e6f7ff",
            display: "flex",
            alignItems: "end",
            justifyContent: "end",
          }}
        />
      </div>
    </div>
  );
};

export default ProductView;
