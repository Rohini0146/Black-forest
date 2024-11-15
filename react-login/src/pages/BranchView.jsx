import React, { useState, useEffect } from "react";
import { Card, Select, DatePicker, Button, message } from "antd";
import axios from "axios";
import "../pages/BranchView.css";
import moment from "moment";

const { Option } = Select;

const BranchView = () => {
  const [type, setType] = useState("pending");
  const [branch, setBranch] = useState("All");
  const [orderedDate, setOrderedDate] = useState(null); // For filtering by order date
  const [deliveryDate, setDeliveryDate] = useState(null); // For filtering by delivery date
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]); // State to store placeorders data
  const [loading, setLoading] = useState(false);

  // Fetch branch data (this can be fetched for SuperAdmins or specific branch users)
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

  // Fetch placeorders data based on filters and user's branch
  useEffect(() => {
    const fetchOrders = async () => {
        setLoading(true);
        try {
          const filters = {};
    
          if (orderedDate) filters.orderedDate = orderedDate.format("YYYY-MM-DD");
          if (deliveryDate) filters.deliveryDate = deliveryDate.format("YYYY-MM-DD");
    
          const response = await axios.get(
            "http://43.205.54.210:3001/placeorders",
            { params: filters }
          );
          if (response.data) {
            setOrders(response.data);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          message.error("Failed to fetch orders");
        } finally {
          setLoading(false);
        }
      };
    fetchOrders();
  }, [orderedDate, deliveryDate]); // Trigger re-fetching when order or delivery date changes

  // Function to handle filtering based on order date and delivery date
  const handleOrderDateChange = (date) => {
    setOrderedDate(date); // Update the order date
  };

  const handleDeliveryDateChange = (date) => {
    setDeliveryDate(date); // Update the delivery date
  };

  return (
    <div className="products-view">
      <h2>Stock Orders - Branch View</h2>
      <div className="filter-container">
        <div className="filter-item">
          <label>Type</label>
          <Select value={type} onChange={setType} className="filter-select">
            <Option value="Pending">Pending</Option>
            <Option value="Ordered">Ordered</Option>
            <Option value="Delivered">Delivered</Option>
          </Select>
        </div>
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
            onChange={handleOrderDateChange} // Handle change of order date
            placeholder="Ordered Date"
            style={{ width: "100%" }}
          />
        </div>
        <div className="filter-item">
          <label>Delivery Date</label>
          <DatePicker
            value={deliveryDate}
            onChange={handleDeliveryDateChange} // Handle change of delivery date
            placeholder="Delivery Date"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {orders.map((order) => (
        <Card key={order._id} className="order-card">
          <div className="order-details">
            <div className="product-view">
              <svg
                width="86"
                height="81"
                viewBox="0 0 86 81"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.920898"
                  width="84.1579"
                  height="81.002"
                  rx="5.25987"
                  fill="#E6F7FF"
                />
                <g clip-path="url(#clip0_180355_9290)">
                  <path
                    d="M65.8493 40.8218H20.9062V64.3187H65.8493V40.8218Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M65.8493 40.8218H20.9062V64.3187H65.8493V40.8218Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M45.2235 43.5908H23.0596V60.1099H45.2235V43.5908Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M46.6642 59.9043C46.6642 60.3555 46.295 60.7246 45.8438 60.7246H22.5469C22.0957 60.7246 21.7266 60.3555 21.7266 59.9043C21.7266 59.4531 22.0957 59.084 22.5469 59.084H45.8387C46.2899 59.084 46.659 59.4531 46.659 59.9043H46.6642Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M68.0078 68.1177H18.958V64.4775C18.958 63.5444 19.7168 62.7856 20.6499 62.7856H66.3107C67.2439 62.7856 68.0026 63.5444 68.0026 64.4775V68.1177H68.0078Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M62.3631 45.436H51.8066V68.1126H62.3631V45.436Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M26.5513 28.0967H24.9106V32.3059H26.5513V28.0967Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M60.0508 28.3022H58.4102V32.5115H60.0508V28.3022Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M66.7775 25.9431C66.7775 23.8154 65.0549 22.0928 62.9323 22.0928H22.0857C19.958 22.0928 18.2354 23.8154 18.2354 25.9431C18.2354 28.0708 19.958 29.7884 22.0857 29.7884H62.9272C65.0549 29.7884 66.7724 28.0657 66.7724 25.9431H66.7775Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M66.8798 34.8184C66.8798 33.3726 65.7058 32.2036 64.2651 32.2036H21.0601C19.6143 32.2036 18.4453 33.3777 18.4453 34.8184V44.3597H66.8798V34.8184Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M67.0339 38.7661L72.5198 44.3596H13.0059L18.4456 38.9199L67.0339 38.7661Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M34.2263 65.416H36.3745C36.6873 65.416 36.9436 65.6724 36.9436 65.9851V66.3491C36.9436 66.6619 36.6873 66.9182 36.3745 66.9182H34.2263C33.9136 66.9182 33.6572 66.6619 33.6572 66.3491V65.9851C33.6572 65.6724 33.9136 65.416 34.2263 65.416Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M28.7356 63.8008H30.8838C31.1965 63.8008 31.4529 64.0571 31.4529 64.3699V64.7339C31.4529 65.0466 31.1965 65.303 30.8838 65.303H28.7356C28.4229 65.303 28.1665 65.0466 28.1665 64.7339V64.3699C28.1665 64.0571 28.4229 63.8008 28.7356 63.8008Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M27.1614 65.4673C27.4741 65.4673 27.7305 65.7236 27.7305 66.0364V66.4004C27.7305 66.7131 27.4741 66.9695 27.1614 66.9695H25.0132"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M21.696 63.8008H23.8442C24.157 63.8008 24.4133 64.0571 24.4133 64.3699V64.7339C24.4133 65.0466 24.157 65.303 23.8442 65.303H21.696C21.3833 65.303 21.127 65.0466 21.127 64.7339V64.3699C21.127 64.0571 21.3782 63.8059 21.6909 63.8059L21.696 63.8008Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M17.6304 46.3079C17.6304 47.5742 16.605 48.5996 15.3386 48.5996C14.0723 48.5996 13.0469 47.5742 13.0469 46.3079V44.3545H17.6304V46.3079Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M22.2036 46.3025C22.2036 47.5689 21.1782 48.5943 19.9119 48.5943C18.6455 48.5943 17.6201 47.5689 17.6201 46.3025V44.3491H22.2036V46.3025Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M26.7925 46.2971C26.7925 47.5635 25.7671 48.5889 24.5007 48.5889C23.2344 48.5889 22.209 47.5635 22.209 46.2971V44.3438H26.7925V46.2971Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M31.3711 46.2927C31.3711 47.5591 30.3457 48.5845 29.0794 48.5845C27.813 48.5845 26.7876 47.5591 26.7876 46.2927V44.3394H31.3711V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M35.9492 46.2927C35.9492 47.5591 34.9238 48.5845 33.6575 48.5845C32.3911 48.5845 31.3657 47.5591 31.3657 46.2927V44.3394H35.9492V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M40.5332 46.2927C40.5332 47.5591 39.5078 48.5845 38.2415 48.5845C36.9751 48.5845 35.9497 47.5591 35.9497 46.2927V44.3394H40.5332V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M45.0137 46.3079C45.0137 47.5742 43.9883 48.5996 42.7219 48.5996C41.4556 48.5996 40.4302 47.5742 40.4302 46.3079V44.3545H45.0137V46.3079Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M49.5869 46.3025C49.5869 47.5689 48.5615 48.5943 47.2952 48.5943C46.0288 48.5943 45.0034 47.5689 45.0034 46.3025V44.3491H49.5869V46.3025Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M54.1753 46.2971C54.1753 47.5635 53.1499 48.5889 51.8836 48.5889C50.6172 48.5889 49.5918 47.5635 49.5918 46.2971V44.3438H54.1753V46.2971Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M58.7539 46.2927C58.7539 47.5591 57.7285 48.5845 56.4622 48.5845C55.1958 48.5845 54.1704 47.5591 54.1704 46.2927V44.3394H58.7539V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M63.3374 46.2927C63.3374 47.5591 62.312 48.5845 61.0457 48.5845C59.7793 48.5845 58.7539 47.5591 58.7539 46.2927V44.3394H63.3374V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M67.9209 46.2927C67.9209 47.5591 66.8955 48.5845 65.6292 48.5845C64.3628 48.5845 63.3374 47.5591 63.3374 46.2927V44.3394H67.9209V46.2927Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M72.5044 46.3079C72.5044 47.5742 71.479 48.5996 70.2127 48.5996C68.9463 48.5996 67.9209 47.5742 67.9209 46.3079V44.3545H72.5044V46.3079Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M50.4072 23.0469L52.4939 21.0474H48.3872L50.4072 23.0469Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M47.9204 22.0886C47.9204 25.0007 50.2788 27.3592 53.1909 27.3592H56.4414C59.3484 27.3592 61.712 25.0007 61.712 22.0886V21.8271H47.9255V22.0886H47.9204Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M57.211 24.4719L60.605 21.2266H53.9297L57.211 24.4719Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M46.5158 23.0723C46.5055 22.2981 47.1259 21.6675 47.9 21.6675H62.0607C62.6401 21.6675 63.1118 22.1392 63.1118 22.7185C63.1118 23.2979 62.6401 23.7695 62.0607 23.7695H61.5019C61.184 23.7695 60.9225 23.5081 60.9225 23.1902C60.9225 22.8723 60.6611 22.6108 60.3432 22.6108H56.3031C55.7238 22.6108 55.2521 23.0825 55.2521 23.6619C55.2521 24.2412 54.7804 24.7129 54.2011 24.7129H51.7453C51.3864 24.7129 51.0993 24.4207 51.0993 24.0669C51.0993 23.7131 50.807 23.4209 50.4533 23.4209H49.9867C49.6893 23.4209 49.4484 23.6619 49.4484 23.9541C49.4484 24.2463 49.2074 24.4924 48.91 24.4924H47.9513C47.172 24.4924 46.5363 23.867 46.5209 23.0825L46.5158 23.0723Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M61.2303 20.5757C61.2303 21.1909 60.7278 21.6934 60.1126 21.6934H49.3921C48.7769 21.6934 48.2744 21.1961 48.2744 20.5757C48.2744 19.9553 48.7769 19.458 49.3921 19.458H60.1126C60.7278 19.458 61.2303 19.9553 61.2303 20.5757Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M50.4072 21.4575L52.4939 19.458H48.3872L50.4072 21.4575Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M60.1997 18.7964H57.9951V18.4375H56.2776V19.063H52.5503V19.5552C52.5503 20.1448 53.0322 20.6267 53.6218 20.6267H56.0571C56.1802 20.6267 56.2827 20.7293 56.2827 20.8472C56.2827 21.0933 56.4827 21.2932 56.7288 21.2932H57.3338C57.7029 21.2932 58.0054 20.9959 58.0054 20.6216C58.0054 20.437 58.1541 20.2883 58.3386 20.2883H59.1385C59.7332 20.2883 60.21 19.8064 60.21 19.2168V18.7913L60.1997 18.7964Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M61.7222 18.4939C61.7222 15.5357 59.3228 13.1362 56.3645 13.1362H53.0576C50.0994 13.1362 47.6948 15.5357 47.6948 18.4939V19.1194C47.6948 19.3142 47.8538 19.4783 48.0537 19.4783H61.3633C61.5582 19.4783 61.7222 19.3194 61.7222 19.1194V18.4939Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M53.9497 14.0544C53.9497 14.3518 53.7087 14.5877 53.4114 14.5877C53.114 14.5877 52.873 14.3467 52.873 14.0544C52.873 13.7622 53.114 13.5161 53.4114 13.5161C53.7087 13.5161 53.9497 13.7571 53.9497 14.0544Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M49.5818 17.2481C49.8791 17.2481 50.1201 17.007 50.1201 16.7097C50.1201 16.4124 49.8791 16.1714 49.5818 16.1714C49.2845 16.1714 49.0435 16.4124 49.0435 16.7097C49.0435 17.007 49.2845 17.2481 49.5818 17.2481Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M58.5081 14.4133C58.5081 14.7107 58.2671 14.9517 57.9697 14.9517C57.6724 14.9517 57.4365 14.7107 57.4365 14.4133C57.4365 14.116 57.6775 13.875 57.9697 13.875C58.262 13.875 58.5081 14.116 58.5081 14.4133Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M60.2918 17.5352C60.2918 17.8325 60.0508 18.0735 59.7534 18.0735C59.4561 18.0735 59.2202 17.8325 59.2202 17.5352C59.2202 17.2378 59.4612 17.002 59.7534 17.002C60.0457 17.002 60.2918 17.2429 60.2918 17.5352Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M56.4519 16.377C56.4519 16.6743 56.2109 16.9153 55.9136 16.9153C55.6162 16.9153 55.3804 16.6743 55.3804 16.377C55.3804 16.0796 55.6213 15.8438 55.9136 15.8438C56.2058 15.8438 56.4519 16.0847 56.4519 16.377Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M52.4526 18.6528C52.7471 18.6528 52.9858 18.4141 52.9858 18.1196C52.9858 17.8251 52.7471 17.5864 52.4526 17.5864C52.1582 17.5864 51.9194 17.8251 51.9194 18.1196C51.9194 18.4141 52.1582 18.6528 52.4526 18.6528Z"
                    fill="#BAE7FF"
                    stroke="#1890FF"
                    stroke-width="1.02539"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_180355_9290">
                    <rect
                      width="60.5393"
                      height="56.0071"
                      fill="white"
                      transform="translate(12.4927 12.6235)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <div className="product-info">
                <p>
                  <b>Branch : </b> {order.branch || "N/A"}{" "}
                </p>
                <p>
                  <b>Order ID : </b> {order.products[0]?.orderId || "N/A"}{" "}
                </p>
                <p>
                  <b>Delivery to : </b>
                  {order.deliveryDate && order.deliveryTime
                    ? moment(
                        `${order.deliveryDate} ${order.deliveryTime}`,
                        "YYYY-MM-DD HH:mm:ss"
                      ).format("DD/MM/YYYY @ hh:mm a")
                    : "Invalid date"}
                </p>
              </div>
            </div>
            <div className="order-action">
              <div className="order-price">Total: ₹{order.totalAmount}</div>
              <Button type="primary" className="view-order-button">
                View Order
              </Button>
              <div className="status">
                <span>
                  {order.isStockOrder ? "Stock Order" : "Regular Order"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BranchView;
