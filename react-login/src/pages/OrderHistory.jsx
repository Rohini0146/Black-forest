import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Tabs,
  Card,
  Row,
  Col,
  message,
  DatePicker,
  Select,
  Spin,
  Empty,
  Pagination,
  Button,
  Space,
  Menu,
  Dropdown,
  Modal,
  Input,
} from "antd";
import {
  DownOutlined,
  FacebookFilled,
  FilterOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneTwoTone,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import logo from "../images/Logo-bk.png";
import "./OrderInformation.css";
import "./OrderHistory.css";
import { debounce } from "lodash";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [filterType, setFilterType] = useState("orderDate");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState("Show All");
  const [branches, setBranches] = useState({});
  const [notes, setNotes] = useState({}); // To store notes for all orders

  const handleNotesChange = (orderId, value) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [orderId]: value, // Update notes for the specific order
    }));
  };

  // Save notes to the backend
  const handleSaveNotes = async (e, orderId) => {
    e.preventDefault(); // Prevent page refresh when saving notes
  
    try {
      const response = await axios.put(`http://64.227.145.104:3001/orders/${orderId}/notes`, {
        notes: notes[orderId], // Send the specific note for the order
      });
  
      if (response.status === 200) {
        message.success("Notes updated successfully!");
  
        // Optionally fetch updated orders or just update the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, notes: notes[orderId] } : order
          )
        );
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      message.error("Failed to save notes.");
    }
  };
  

  const phoneIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEiSURBVHgB1ZQxTgJBFEDfEKPVNlpBhY3YmJhAZcUFMKG1s0Ct0QN4AG5gYecBpNJqG2NjIgkVHAAqGkggSzPMz4bAkllgs0MCL9lk/uTvy8/8P6P6E50H3jWUcYGiFWiqqjfW/ya4xi2+6k20Zgdk2BH7Ix4F8NCE+le4jiPRGYuoZqTdQRhfnMFbBbwT0lX86i+kgqzr3/bcRGKpcJXRlPTixxJUCtG9y1MHYhvl84RiadSz6Xzjd7HX7ITfnJxnxHn7/0dx0uXuS+wdw0c7micTEYdVvNr95SrnyHlnPZKJh2sGX3i5gbur9TnWCyIjVPuMVi0Us/BkKi3m2EjszRN54wf++lAywtvCdsKN4rQc5rPp4xpNK6PgXha4ww8U1Rm922Jd4jL68gAAAABJRU5ErkJggg=="; // Replace '...' with actual base64 data
  const mailIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAH9SURBVHgBtVQ9TwJBEH1njDZcozZSaQM2GhOprLTRShNbrKywRmsJPdFWbKz0B0BjaKDRCiIJFTTaCI1YCJFAc85jjnjA8RE9X3K53b3dt/PezJxRa1krAG4tYAdewECxbeHIqH5ZzzLZhLfIGdWWZeEfMDvNpmpDnqaOzTkguDj5zFji+xKQLgPlev+63wQiW8BBcPRZVysabeAso4SBRZ2HluXd0TVzXlXwgss9nQ9ixu02kuarwM2BElzt6+EukYwr70B8ByjInmgGrhgipnSSnW8Dsax6+tlxqJGxTy6J5dSOSl0tG8SQx9cF4NT2jxc0xYbEoxB86HcqYeRMYCSkSlIVILw+hpgSa0IW8uucxMcbwJb4m8zrGsm4jwEQDCDxpOeWzRHElEzpqbLOmajsi0T5Jk/N3pRXO2hB77JuMpv9xK7J8wJ9EdM7RkO/GAUjptRuQzisoM+0iWO+k2KLb24CMes2bSeDc/pn4KdJCjWV7LdlFxzJHElMHAbUO0aefVVS1i69JnZXgYusjllmdyWtokEMeRze0KhJHt/VC0yHTEpudvQb1fh97q3t3tJyMPogJWRnmi29tqSk9Jf+syoCC6rGraXH/jbZhaxX1qgTVHQYHG6KqYl7YHSMmmCinPX6J+LfgMnLwWtYKM5IOZ1wAO+Qaxs4+gbfVtJqy9CYrgAAAABJRU5ErkJggg==";
  const emailIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADoSURBVHgB7ZShCsJAGIC/E8GiyRcwGcVqs1ksNsFk8AXUxxBfwbZmMmlxySQomrRomskkOJbOG0MGMrcdbAPBD4777477OP7/58TNlhVgJqFJEgj2jqQjrKfcqUWdZDGFZUtJCuRIid8T5z83zCsMl2gxbamWqkSIH443V8vQqxHK1oLFyb8TKn5zvsNJjXEj+Nw4etJvhObYOEDbgNvD33NfN1rBZEMokcWzlHSwgPXVi7tzFV+IJE8MXOFIFbRUCM5nEFrtFleqLdYhO3GxgDalgDv/3y0bsUnSSPY5AX03IDlMR9B5AcAhRyzfq0oyAAAAAElFTkSuQmCC";
  const locationIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAENSURBVHgB7ZSxagIxGIC/SGmX3tJNp5vaqVBw7HI+QAe30q1Ln6AP0D5An6Gbm5MPYCYXBQUnXXQ6F50E5VxiQhQRzjNKzskPDpIj+fLz/38iJksVAv8KInwg6CWKqogXqqsnL/hFinipFDlQICdyE9+k/az1dZLGOBGF8PHsKJYj6ExwwhTIWXyIUgC/EZRLMJzCe/3w2pPEb49W2om1eJa99uSIDX8tGBwRO3VFcGujLW7E5aItWhZOEQd3OreV3fz71aYjq3OcIp4n8NXYiX6a+pPZe9zEKxuhOcDQ1q0Yzz2Iz+GyV9pUPO3J23bF04NuvXs7roSkcn0298QS3yh6BQGfZoA/ZCKorgHSWkhHtCnc3gAAAABJRU5ErkJggg==";

  const limit = 3000; // Initial limit for data fetch

  // Fetch orders from the backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://64.227.145.104:3001/orders?limit=${limit}`
      );
      const newOrders = response.data.orders;
      setOrders(newOrders);
      applyTabFilter("recent", newOrders); // Apply "Recent" filter by default
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOrders();
    fetchBranches();
  }, [fetchOrders]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://64.227.145.104:3001/stores");
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

  // Apply the relevant filter based on the selected tab
  const applyTabFilter = (tabKey, ordersData = orders) => {
    const now = new Date();
    let filtered = [];

    const sortedOrders = [...ordersData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (tabKey === "recent") {
      filtered = sortedOrders.slice(0, 20); // Show the latest 20 orders
    } else if (tabKey === "lastWeek") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastWeek
      );
    } else if (tabKey === "lastMonth") {
      const lastMonth = new Date(now.setDate(now.getDate() - 30));
      filtered = sortedOrders.filter(
        (order) => new Date(order.created_at) >= lastMonth
      );
    }

    setFilteredOrders(filtered); // Update state with filtered orders
  };

  // Trigger filter when the tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setIsDateFilterActive(false);
    applyTabFilter(key); // Apply filter based on the new tab
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
        filterType === "deliveryDate" ? "delivery_date" : "created_at";
      let url = `http://64.227.145.104:3001/orders?startDate=${startDate}&endDate=${endDate}&dateField=${dateField}`;

      if (responseType !== "Show All") {
        url += `&response=${responseType}`;
      }

      const response = await axios.get(url);
      const { orders } = response.data;

      const filteredData = orders.filter((order) => {
        const dateValue =
          filterType === "deliveryDate"
            ? order.delivery_date
            : order.created_at;
        return (
          dateValue &&
          moment(dateValue).isBetween(startDate, endDate, null, "[]") &&
          (responseType === "Show All" || order.response === responseType)
        );
      });

      setFilteredOrders(filteredData);
    } catch (error) {
      console.error("Error fetching filtered customers:", error);
      message.error("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    if (!isDateFilterActive && activeTab) {
      applyTabFilter(activeTab); // Apply only on activeTab change
    }
  }, [activeTab, isDateFilterActive]);

  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    setDateRange(null); // Clear the date range in the RangePicker
    fetchOrders(); // Reload all orders when switching filter type
    setCurrentPage(1); // Reset pagination
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true); // Show the modal
  };

  const handleMenuClick = async (e, orderId) => {
    const newResponse = e.key;

    try {
      // Update the response in the backend
      await axios.put(`http://64.227.145.104:3001/orders/${orderId}/response`, {
        response: newResponse,
      });
      message.success(
        `Response for Order ${orderId} updated to: ${newResponse}`
      );

      // Update the specific order in both `orders` and `filteredOrders` arrays
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, response: newResponse } : order
        )
      );

      setFilteredOrders((prevFilteredOrders) =>
        prevFilteredOrders.map((order) =>
          order._id === orderId ? { ...order, response: newResponse } : order
        )
      );
    } catch (error) {
      console.error("Failed to update response:", error);
      message.error("Failed to update response");
    }
  };

  // Menu component for dropdown
  const menu = (orderId) => (
    <Menu onClick={(e) => handleMenuClick(e, orderId)}>
      {Object.keys(responseColors).map((key) => (
        <Menu.Item
          key={key}
          style={{
            color: key === selectedResponse ? responseColors[key] : "#000",
          }}
        >
          {key}
        </Menu.Item>
      ))}
    </Menu>
  );

  const colorMap = {
    "No Need": "red",
    "Not Interest": "#000",
    "Out of Station": "#000",
    "Not Reachable": "#000",
    "Not Answering": "red",
    "Other Shop": "#000",
    "Visit Come to Shop": "#000",
    Waiting: "orange",
    "Order Taken by Customer": "#000",
    "Customer need not possible": "#000",
    "Whatsapp Model": "darkgreen",
  };

  const responseColors = {
    "No Need": "red",
    "Not Interest": "#000",
    "Out of Station": "#000",
    "Not Reachable": "#000",
    "Not Answering": "red",
    "Other Shop": "#000",
    "Visit Come to Shop": "#000",
    Waiting: "orange",
    "Order Taken by Customer": "#000",
    "Customer need not possible": "#000",
    "Whatsapp Model": "darkgreen",
  };

  const responseOptions = ["Show All", ...Object.keys(responseColors)];

  // Adjust the handleFilterChange to prioritize client-side filtering and avoid unnecessary fetches
  const handleFilterChange = (value) => {
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
      setFilteredOrders(orders); // Reset to original data if no date range is selected
    }
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF("p", "mm", "a4");

    // Base64 encoded images for icons (placeholders here, replace with actual base64 strings)
    const phoneIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEiSURBVHgB1ZQxTgJBFEDfEKPVNlpBhY3YmJhAZcUFMKG1s0Ct0QN4AG5gYecBpNJqG2NjIgkVHAAqGkggSzPMz4bAkllgs0MCL9lk/uTvy8/8P6P6E50H3jWUcYGiFWiqqjfW/ya4xi2+6k20Zgdk2BH7Ix4F8NCE+le4jiPRGYuoZqTdQRhfnMFbBbwT0lX86i+kgqzr3/bcRGKpcJXRlPTixxJUCtG9y1MHYhvl84RiadSz6Xzjd7HX7ITfnJxnxHn7/0dx0uXuS+wdw0c7micTEYdVvNr95SrnyHlnPZKJh2sGX3i5gbur9TnWCyIjVPuMVi0Us/BkKi3m2EjszRN54wf++lAywtvCdsKN4rQc5rPp4xpNK6PgXha4ww8U1Rm922Jd4jL68gAAAABJRU5ErkJggg=="; // Replace '...' with actual base64 data
    const mailIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAH9SURBVHgBtVQ9TwJBEH1njDZcozZSaQM2GhOprLTRShNbrKywRmsJPdFWbKz0B0BjaKDRCiIJFTTaCI1YCJFAc85jjnjA8RE9X3K53b3dt/PezJxRa1krAG4tYAdewECxbeHIqH5ZzzLZhLfIGdWWZeEfMDvNpmpDnqaOzTkguDj5zFji+xKQLgPlev+63wQiW8BBcPRZVysabeAso4SBRZ2HluXd0TVzXlXwgss9nQ9ixu02kuarwM2BElzt6+EukYwr70B8ByjInmgGrhgipnSSnW8Dsax6+tlxqJGxTy6J5dSOSl0tG8SQx9cF4NT2jxc0xYbEoxB86HcqYeRMYCSkSlIVILw+hpgSa0IW8uucxMcbwJb4m8zrGsm4jwEQDCDxpOeWzRHElEzpqbLOmajsi0T5Jk/N3pRXO2hB77JuMpv9xK7J8wJ9EdM7RkO/GAUjptRuQzisoM+0iWO+k2KLb24CMes2bSeDc/pn4KdJCjWV7LdlFxzJHElMHAbUO0aefVVS1i69JnZXgYusjllmdyWtokEMeRze0KhJHt/VC0yHTEpudvQb1fh97q3t3tJyMPogJWRnmi29tqSk9Jf+syoCC6rGraXH/jbZhaxX1qgTVHQYHG6KqYl7YHSMmmCinPX6J+LfgMnLwWtYKM5IOZ1wAO+Qaxs4+gbfVtJqy9CYrgAAAABJRU5ErkJggg==";
    const emailIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADoSURBVHgB7ZShCsJAGIC/E8GiyRcwGcVqs1ksNsFk8AXUxxBfwbZmMmlxySQomrRomskkOJbOG0MGMrcdbAPBD4777477OP7/58TNlhVgJqFJEgj2jqQjrKfcqUWdZDGFZUtJCuRIid8T5z83zCsMl2gxbamWqkSIH443V8vQqxHK1oLFyb8TKn5zvsNJjXEj+Nw4etJvhObYOEDbgNvD33NfN1rBZEMokcWzlHSwgPXVi7tzFV+IJE8MXOFIFbRUCM5nEFrtFleqLdYhO3GxgDalgDv/3y0bsUnSSPY5AX03IDlMR9B5AcAhRyzfq0oyAAAAAElFTkSuQmCC";
    const locationIcon =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAENSURBVHgB7ZSxagIxGIC/SGmX3tJNp5vaqVBw7HI+QAe30q1Ln6AP0D5An6Gbm5MPYCYXBQUnXXQ6F50E5VxiQhQRzjNKzskPDpIj+fLz/38iJksVAv8KInwg6CWKqogXqqsnL/hFinipFDlQICdyE9+k/az1dZLGOBGF8PHsKJYj6ExwwhTIWXyIUgC/EZRLMJzCe/3w2pPEb49W2om1eJa99uSIDX8tGBwRO3VFcGujLW7E5aItWhZOEQd3OreV3fz71aYjq3OcIp4n8NXYiX6a+pPZe9zEKxuhOcDQ1q0Yzz2Iz+GyV9pUPO3J23bF04NuvXs7roSkcn0298QS3yh6BQGfZoA/ZCKorgHSWkhHtCnc3gAAAABJRU5ErkJggg==";
    const logoUrl = logo;

    // Add Logo
    doc.addImage(logoUrl, "PNG", 9, 2, 30, 15);

    // Basic Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Website, Email, and Social Handle with spacing
    const baseY = 20;
    doc.addImage(mailIcon, "PNG", 10, baseY, 5, 5);
    doc.text("www.theblackforestcakes.com", 20, baseY + 4);
    doc.addImage(emailIcon, "PNG", 10, baseY + 8, 5, 5);
    doc.text("theblackforestcakes.in@gmail.com", 20, baseY + 12);
    doc.addImage(locationIcon, "PNG", 10, baseY + 16, 5, 5);
    doc.text("blackforestcakesthoothukudi", 20, baseY + 20);

    // Contact Header with Icon
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.addImage(phoneIcon, 100, 6, 6, 6);
    doc.text("Contact", 110, 10);

    // Bottom border for "Contact" section
    doc.setDrawColor(213, 213, 213);
    doc.setLineWidth(0.3);
    doc.line(100, 14, 180, 14);

    // Setting up two columns for Contact Information
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const firstColY = 20;
    const colSpacing = 6;

    // First Column of Contact Details
    doc.text("Chidambaram Nagar: 9791470656", 100, firstColY);
    doc.text("V.V.D Signal: 9500542656", 100, firstColY + colSpacing);
    doc.text("Ettayapuram Road: 9597104066", 100, firstColY + colSpacing * 2);
    doc.text("Antony Church: 6385796656", 100, firstColY + colSpacing * 3);

    // Second Column of Contact Details
    const secondColX = 160;
    doc.text("Sawyer Puram: 7397566656", secondColX, firstColY);
    doc.text("Kamaraj College: 9500266656", secondColX, firstColY + colSpacing);
    doc.text("3rd Mile: 9600846656", secondColX, firstColY + colSpacing * 2);

    // Order Form Header
    doc.setFillColor(24, 144, 255);
    doc.rect(0, 45, 210, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Order Form", 105, 52, { align: "center" });
    // Reset text color for other elements
    doc.setTextColor(0, 0, 0);

    // Background for Details and Customer Info
    doc.setFillColor(230, 247, 255);
    doc.rect(0, 55, 210, 75, "F"); // Increased height for background

    // Adjust the Y position for "Details" and "Customer Info" header
    const headerSpacing = 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Details", 10, 57 + headerSpacing);
    doc.text("Customer Info", 110, 57 + headerSpacing);

    // Draw border below headers
    doc.setDrawColor(213, 213, 213);
    doc.setLineWidth(0.3);
    doc.line(10, 65, 100, 65);
    doc.line(110, 65, 200, 65);

    // Order Details and Customer Info Sections with spacing
    doc.setFontSize(12); // Set font size for labels to 12px
    doc.setFont("helvetica", "normal");

    // Positioning for Details Section
    const labelXDetails = 10; // X position for labels in Details
    const valueXDetails = 35; // X position for values in Details (after labels)
    const labelYIncrement = 12; // Increment for each label
    const detailsBaseY = 75; // Base Y position for details
    const inputBoxWidthDetails = 60; // Width of the input boxes in Details
    const inputBoxHeight = 7; // Height of the input boxes

    // Fields for Details
    const fields = [
      { label: "Form No:", value: order.form_no },
      { label: "Date:", value: moment(order.created_at).format("DD-MM-YYYY") },
      {
        label: "Delivery Date:",
        value: moment(order.delivery_date).format("DD-MM-YYYY"),
      },
      { label: "Delivery Time:", value: order.delivery_time },
      {
        label: "Order Time:",
        value: moment(order.created_at).format("hh:mm A"),
      },
    ];

    // Draw Details
    fields.forEach((field, index) => {
      const currentY = detailsBaseY + index * labelYIncrement;

      // Draw label
      doc.setFontSize(10); // Set font size for labels to 12px
      doc.setTextColor(0, 0, 0);
      doc.text(field.label, labelXDetails, currentY);

      // Draw background and border for the value
      doc.setFillColor(186, 231, 255);
      doc.rect(
        valueXDetails,
        currentY - 5,
        inputBoxWidthDetails,
        inputBoxHeight,
        "F"
      );
      doc.setDrawColor(24, 144, 255);
      doc.rect(
        valueXDetails,
        currentY - 5,
        inputBoxWidthDetails,
        inputBoxHeight
      );

      // Set font size for values to 8px
      doc.setFontSize(9); // Set font size for values to 8px
      doc.setTextColor(0, 0, 0);
      doc.text(field.value.toString(), valueXDetails + 2, currentY);
    });

    // Customer Info Section
    const customerInfoX = 100; // X position for Customer Info section
    const valueXCustomerInfo = 135; // X position for values in Customer Info (after labels)
    const inputBoxWidthCustomerInfo = 60; // Width of the input boxes in Customer Info

    // Fields for Customer Info
    const customerFields = [
      { label: "Customer Name:", value: order.customer_name },
      { label: "Customer Number:", value: order.customer_phone },
      { label: "Address:", value: order.address },
      { label: "Email:", value: order.email || "----------------" },
    ];

    // Draw Customer Info
    customerFields.forEach((field, index) => {
      const currentY = detailsBaseY + index * labelYIncrement;

      // Draw label
      doc.setFontSize(10); // Set font size for labels to 12px
      doc.setTextColor(0, 0, 0);
      doc.text(field.label, customerInfoX, currentY);

      // Draw background and border for the value
      doc.setFillColor(186, 231, 255);
      doc.rect(
        valueXCustomerInfo,
        currentY - 5,
        inputBoxWidthCustomerInfo,
        inputBoxHeight,
        "F"
      );
      doc.setDrawColor(24, 144, 255);
      doc.rect(
        valueXCustomerInfo,
        currentY - 5,
        inputBoxWidthCustomerInfo,
        inputBoxHeight
      );

      // Set font size for values to 8px
      doc.setFontSize(9); // Set font size for values to 8px
      doc.setTextColor(0, 0, 0);
      doc.text(field.value.toString(), valueXCustomerInfo + 2, currentY);
    });

    // Cake Details Section
    const cakeDetailsY = detailsBaseY + 50;

    // Draw background for cake details section
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 130, 210, 45, "F");

    // Draw lines for cake details
    const cakeDetailsBaseY = cakeDetailsY + 10;
    doc.setDrawColor(24, 144, 255);
    const detailsY = cakeDetailsBaseY + 2;

    // Two columns
    const leftColumnX = 10;
    const rightColumnX = 100;

    // Wordings in the Left Column
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10); // Set font size for labels to 10px
    doc.setTextColor(0, 0, 0); // Reset text color for other elements
    doc.text(`Wordings:`, leftColumnX, detailsY);
    doc.text(`Birthday Date: `, leftColumnX, detailsY + 10);
    doc.text(`Cake Model:`, leftColumnX, detailsY + 20);
    doc.text(`Weight: `, leftColumnX, detailsY + 30);

    // Information in the Right Column
    doc.setFontSize(10); // Set font size for labels to 10px
    doc.text(`Flavour: `, rightColumnX, detailsY);
    doc.text(`Type: `, rightColumnX, detailsY + 10);
    doc.text(`Alteration if any:`, rightColumnX, detailsY + 20);
    doc.text(`Special Care: `, rightColumnX, detailsY + 30);

    // Set font size for values to 9px
    doc.setFontSize(9); // Set font size for values to 9px
    doc.text(order.wordings, leftColumnX + 30, detailsY); // Adjust value position accordingly
    doc.text(
      moment(order.birthday_date).format("DD-MM-YYYY"),
      leftColumnX + 30,
      detailsY + 10
    ); // Adjust value position accordingly
    doc.text(order.cake_model, leftColumnX + 30, detailsY + 20); // Adjust value position accordingly
    doc.text(order.weight || "------------", leftColumnX + 30, detailsY + 30); // Adjust value position accordingly

    // Right Column Values
    doc.text(order.flavour, rightColumnX + 35, detailsY); // Adjust value position accordingly
    doc.text(
      order.type || "-------------------",
      rightColumnX + 35,
      detailsY + 10
    ); // Adjust value position accordingly
    doc.text(order.alteration || "------", rightColumnX + 35, detailsY + 20); // Adjust value position accordingly
    doc.text(
      order.special_care || "------------",
      rightColumnX + 35,
      detailsY + 30
    ); // Adjust value position accordingly

    // Payment Details Section
    const paymentBaseY = cakeDetailsBaseY + 45;

    // Set background color for the payment details section
    doc.setFillColor(230, 247, 255);
    doc.rect(0, paymentBaseY - 6, 210, 10, "F");

    // Set font size and color for text
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Ensure proper string concatenation with additional checks
    const advanceAmount = order.advance !== undefined ? order.advance : "0";
    const balanceAmount = order.balance !== undefined ? order.balance : "0";
    const totalAmount = order.amount !== undefined ? order.amount : "0";

    doc.text("Advance: ₹" + advanceAmount.toString(), 10, paymentBaseY);
    doc.text("Balance: ₹" + balanceAmount.toString(), 95, paymentBaseY);
    doc.text("Total: ₹" + totalAmount.toString(), 180, paymentBaseY, {
      align: "right",
    });

    // Footer with Terms
    const footerBaseY = paymentBaseY + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Your Attention!", 105, footerBaseY, { align: "center" });

    // Description below the title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const descriptionText =
      "Delivery Every cake we offer is handcrafted and since each chef has his/her own way of baking and designing a cake, there might be slight variation in the product in terms of design.";
    const descriptionX = 10;
    const descriptionY = footerBaseY + 8;
    doc.text(
      descriptionText,
      descriptionX,
      descriptionY,
      { maxWidth: 190 },
      { textAlign: "center" }
    );

    // List of terms
    const terms = [
      "1. Bring this receipt at the time of delivery please.",
      "2. Minimum amount of 50% of the total amount should be paid as advance.",
      "3. For wedding cakes 100% of the amount should be paid as advance.",
      "4. Advance once received will not be returned at any circumstances.",
      "5. The advance received against cancellation order will be adjusted in future orders or purchases of any of our outlet products.",
      "6. Cancellation of order should be intimated at the minimum time of 48 hrs before the time of delivery.",
      "7. Cancellation will not be done through phone. (Customer should come in person).",
      "8. For door delivery vehicle fare will be collected from the customer.",
      "9. Above 2Kg birthday cakes we haven't provided carry bag, sorry.",
      "10. Fresh cream cakes, choco truffle cakes can be kept in normal temperature for only two hours. After that it should be kept in chiller and it should not be kept in freezer.",
    ];

    // Position for the terms
    doc.setFontSize(8); // Set the font size to 8px
    doc.setFont("helvetica", "normal"); // Set the font type
    let termsBaseY = descriptionY + 12; // Keep it closer by reducing space

    // Loop through terms and add to PDF
    terms.forEach((term, index) => {
      doc.text(term, descriptionX, termsBaseY + index * 6);
    });

    // Additional Footer Information
    const finalFooterY = termsBaseY + terms.length * 6 + 6; // Adjust space for footer

    // Set background color for the footer
    doc.setFillColor(230, 247, 255); // Light blue color
    doc.rect(0, finalFooterY - 8, 210, 25, "F"); // Draw a rectangle for the background

    doc.setFontSize(10);

    // Create a table-like structure for the footer
    const footerBaseX = 10; // Starting X position for footer
    const columnWidth = 50; // Width for each column

    doc.text("Branch:", footerBaseX, finalFooterY);
    doc.text("Salesman:", footerBaseX + columnWidth, finalFooterY);
    doc.text("Customer Sign:", footerBaseX + columnWidth * 2, finalFooterY);
    doc.text("Delivery Type:", footerBaseX + columnWidth * 3, finalFooterY);

    // Values
    doc.text("ETTAYAPURAM ROAD", footerBaseX, finalFooterY + 10);
    doc.text("SUGADEESH", footerBaseX + columnWidth, finalFooterY + 10);
    doc.text(
      "---------------",
      footerBaseX + columnWidth * 2,
      finalFooterY + 10
    );
    doc.text("Shop", footerBaseX + columnWidth * 3, finalFooterY + 10);

    // Save the PDF
    doc.save(`Invoice_${order.form_no}.pdf`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        className="hist-od"
        style={{ padding: "24px", backgroundColor: "#fff" }}
      >
        <div
          className="head-tab"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "16px",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="tabs"
          >
            <TabPane tab="Recent" key="recent" />
            <TabPane tab="Last Week" key="lastWeek" />
            <TabPane tab="Last Month" key="lastMonth" />
          </Tabs>

          <Select
            style={{ width: 200, marginBottom: 20 }}
            value={selectedResponse}
            onChange={handleFilterChange}
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
              <Option value="deliveryDate">Delivery Date</Option>
            </Select>
            <RangePicker value={dateRange} onChange={handleRangeChange} />
          </div>
        </div>

        {loading ? (
          <Spin
            tip="Loading..."
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
            }}
          />
        ) : paginatedOrders.length === 0 ? (
          <Empty description="No Data" style={{ marginTop: "50px" }} />
        ) : (
          <Row gutter={[16, 16]}>
            {paginatedOrders.map((order) => (
              <Col span={24} key={order._id}>
                <Card>
                  <Row>
                    <Col
                      span={24}
                      className="order-avatar"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "25px",
                        rowGap: "10px",
                        padding: "5px",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      {/* Customer Avatar and Info */}
                      <div className="avatar">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Customer Avatar"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              marginRight: "10px",
                              float: "left",
                            }}
                          />
                          <div>
                            <div>
                              <p
                                style={{
                                  fontWeight: "500",
                                  color: "#BFBFBF",
                                }}
                              >
                                Name :{" "}
                                <span
                                  style={{
                                    fontWeight: "500",
                                    color: "#000",
                                  }}
                                >
                                  {order.customer_name}
                                </span>{" "}
                              </p>
                            </div>
                            <div>
                              <p
                                style={{
                                  fontWeight: "500",
                                  color: "#BFBFBF",
                                }}
                              >
                                Number :{" "}
                                <span
                                  style={{
                                    fontWeight: "500",
                                    color: "#000",
                                  }}
                                >
                                  {order.customer_phone}
                                </span>{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border"></div>

                      {/* Payment and Price Details */}
                      <Row
                        className="price-detail"
                        gutter={[16, 8]}
                        style={{ marginLeft: "10px" }}
                      >
                        <Col>
                          <div
                            style={{
                              backgroundColor: "#E6F7FF",
                              padding: "8px 12px",
                              borderRadius: "4px",
                              textAlign: "center",
                            }}
                          >
                            <b
                              style={{
                                fontWeight: "500",
                                color: "#1890FF",
                              }}
                            >
                              Price :
                            </b>{" "}
                            <span
                              style={{
                                color: "#1890FF",
                                fontWeight: "500",
                              }}
                            >
                              ₹{order.amount}
                            </span>
                          </div>
                        </Col>
                        <Col>
                          <div
                            style={{
                              backgroundColor: "#E6F7FF",
                              padding: "8px 12px",
                              borderRadius: "4px",
                            }}
                          >
                            <b
                              style={{
                                fontWeight: "500",
                                color: "#1890FF",
                              }}
                            >
                              Payment Method :
                            </b>{" "}
                            <span
                              style={{
                                color: "#1890FF",
                                fontWeight: "500",
                              }}
                            >
                              {order.payment_method}
                            </span>
                          </div>
                        </Col>
                      </Row>
                      <div className="border"></div>

                      <div
                        className="price-detail"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ marginRight: "8px", fontWeight: "bold" }}>
                          Invoice :
                        </div>
                        <Space
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <Button
                            onClick={() => handleViewOrder(order)}
                            style={{
                              border: "1px solid #1890FF",
                              padding: "3px 20px",
                            }}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => handleDownloadPDF(order)}
                            type="primary"
                            style={{
                              backgroundColor: "#1890FF",
                              color: "#fff",
                              padding: "3px 20px",
                              border: "1px solid #1890FF",
                            }}
                          >
                            Download
                          </Button>
                        </Space>
                      </div>
                    </Col>

                    <div className="bd-btm"></div>

                    <Col
                      span={24}
                      style={{ padding: "20px 0" }}
                      className="live-detail"
                    >
                      <Row gutter={[24, 25]}>
                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Order ID :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.form_no}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Order Date :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.created_at).format("DD-MM-YYYY")}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Delivery Date :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.delivery_date).format("DD-MM-YYYY")}
                          </span>
                        </Col>
                        <Col span={6}>
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Delivery Time :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(order.delivery_time).format("hh:mm A")}
                          </span>
                        </Col>
                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Cake Model :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.cake_model}
                          </span>
                        </Col>

                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Weight :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.weight}
                          </span>
                        </Col>

                        <Col span={6} className="live-order-filter">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Flavour :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {" "}
                            {order.flavour}
                          </span>
                        </Col>
                        <Col span={6} className="live-order-filter wordings">
                          <b style={{ fontWeight: "500", color: "#BFBFBF" }}>
                            Wordings :
                          </b>{" "}
                          <span style={{ fontWeight: "500" }}>
                            {order.wordings}
                          </span>
                        </Col>
                      </Row>

                      {/* Payment and Price Details */}
                      {/* <Row
                          className="price-detail-mob"
                          gutter={[16, 8]}
                          style={{ marginLeft: "10px" }}
                        >
                          <Col>
                            <div
                              style={{
                                backgroundColor: "#E6F7FF",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                textAlign: "center",
                              }}
                            >
                              <b
                                style={{
                                  fontWeight: "500",
                                  color: "#1890FF",
                                }}
                              >
                                Price :
                              </b>{" "}
                              <span
                                style={{
                                  color: "#1890FF",
                                  fontWeight: "500",
                                }}
                              >
                                ₹{order.amount}
                              </span>
                            </div>
                          </Col>
                          <Col>
                            <div
                              style={{
                                backgroundColor: "#E6F7FF",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                textAlign: "center",
                              }}
                            >
                              <b
                                style={{
                                  fontWeight: "500",
                                  color: "#1890FF",
                                }}
                              >
                                Payment Method :
                              </b>{" "}
                              <span
                                style={{
                                  color: "#1890FF",
                                  fontWeight: "500",
                                }}
                              >
                                {order.payment_method}
                              </span>
                            </div>
                          </Col>
                          <Col>
                            <div
                              style={{
                                backgroundColor: "#E6F7FF",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                textAlign: "center",
                              }}
                            >
                              <b
                                style={{
                                  fontWeight: "500",
                                  color: "#1890FF",
                                }}
                              >
                                Advance Paid :
                              </b>{" "}
                              <span
                                style={{
                                  color: "#1890FF",
                                  fontWeight: "500",
                                }}
                              >
                                ₹{order.advance}
                              </span>
                            </div>
                          </Col>
                          <Col>
                            <div
                              style={{
                                backgroundColor: "#E6F7FF",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                textAlign: "center",
                              }}
                            >
                              <b
                                style={{
                                  fontWeight: "500",
                                  color: "#1890FF",
                                }}
                              >
                                Balance :
                              </b>{" "}
                              <span
                                style={{
                                  color: "#1890FF",
                                  fontWeight: "500",
                                }}
                              >
                                ₹{order.balance}
                              </span>
                            </div>
                          </Col>
                        </Row> */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: 'space-between',
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div  
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}>
                          {/* Dropdown for Response */}
                        <Dropdown overlay={menu(order._id)} trigger={["click"]}>
                          <div
                            style={{ cursor: "pointer", marginRight: "16px" }}
                          >
                            <span style={{ color: "#1890ff", fontWeight: 500 }}>
                              Response
                            </span>
                            <DownOutlined
                              style={{ marginLeft: "8px", color: "#1890ff" }}
                            />
                          </div>
                        </Dropdown>

                        {/* Display the selected response */}
                        {order.response && (
                          <span
                            style={{
                              color: colorMap[order.response] || "#000",
                              fontWeight: "bold",
                              marginRight: "16px",
                            }}
                          >
                            {order.response}
                          </span>
                        )}
                        </div>
                        

                        {/* Ant Design Input for Notes */}
                        {/* Notes Input */}
                        <div className="notes-box" style={{display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap'}}>
                          {/* Show Existing Notes */}
                        {order.notes && (
                          <div
                            style={{
                              marginTop: "10px",
                              fontStyle: "italic",
                              color: "#595959",
                            }}
                          >
                           <b>Notes : </b> {notes[order._id] || order.notes}
                          </div>
                        )}
                        <Input
                          placeholder="Enter notes here"
                          value={notes[order._id] || ""} // Display the current input or existing notes
                          onChange={(e) =>
                            handleNotesChange(order._id, e.target.value)
                          } // Update local state
                          style={{width: '200px'}}
                          
                        />
                        <Button
                          type="primary"
                          onClick={(e) => handleSaveNotes(e, order._id)} // Pass the event to prevent page refresh
                          className="save-btn"
                        >
                          Save
                        </Button>

                        
                        </div>
                        
                      </div>

                      <div
                        className="price-detail-mob"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ marginRight: "8px", fontWeight: "bold" }}>
                          Invoice :
                        </div>
                        <Space
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <Button
                            onClick={() => handleViewOrder(order)}
                            style={{
                              border: "1px solid #1890FF",
                              padding: "3px 20px",
                            }}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => handleDownloadPDF(order)}
                            type="primary"
                            style={{
                              backgroundColor: "#1890FF",
                              color: "#fff",
                              padding: "3px 20px",
                              border: "1px solid #1890FF",
                            }}
                          >
                            Download
                          </Button>
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredOrders.length}
          onChange={handlePaginationChange}
          showTotal={(total) => `Total ${total} items`}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e6f7ff",
            display: "flex",
            alignItems: "end",
            justifyContent: "end",
            width: "100%",
          }}
        />

        <Modal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={"70%"}
        >
          {selectedOrder && (
            <>
              {/* Header Section */}
              <div style={{ position: "relative" }}>
                <div>
                  <p className="order-head" style={{ margin: "0" }}>
                    <img src={logo} alt="Logo" style={{ width: "160px" }} />
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    padding: "15px 20px",
                    fontSize: "15px",
                  }}
                >
                  {/* Left Section */}
                  <div style={{ width: "50%" }}>
                    <p
                      style={{
                        margin: "5px 0 10px",
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "start",
                        width: "fit-content",
                      }}
                    >
                      <img
                        src={mailIcon}
                        alt="Phone"
                        style={{ width: "25px", marginRight: "10px" }}
                      />
                      www.theblackforestcakes.com
                    </p>
                    <p
                      style={{
                        margin: "5px 0 10px",
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "start",
                        width: "fit-content",
                      }}
                    >
                      <img
                        src={emailIcon}
                        alt="Mail"
                        style={{ width: "25px", marginRight: "10px" }}
                      />
                      theblackforestcakes@gmail.com
                    </p>
                    <p
                      style={{
                        margin: "5px 0 10px",
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "start",
                        width: "fit-content",
                      }}
                    >
                      <img
                        src={locationIcon}
                        alt="Facebook"
                        style={{ width: "25px", marginRight: "10px" }}
                      />
                      facebook.com/theblackforestcakes
                    </p>
                  </div>

                  <div
                    style={{
                      width: "2px",
                      height: "90%",
                      background: "#aaa",
                      position: "absolute",
                      top: "0px",
                      left: "47%",
                    }}
                  ></div>

                  {/* Right Contact Information */}
                  <div style={{ marginTop: "-40px", width: "48%" }}>
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontWeight: "500",
                        fontSize: "18px",
                        borderBottom: "1px solid #D5D5D5",
                        paddingBottom: "10px",
                        marginBottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "start",
                        gap: "10px",
                      }}
                    >
                      <img
                        src={phoneIcon}
                        alt="Facebook"
                        style={{ width: "25px", margin: "0px" }}
                      />
                      Contact
                    </p>
                    <div style={{ display: "flex", gap: "40px" }}>
                      <div>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          CHIDAMBARAM NAGAR : 9791470656
                        </p>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          VVD Signal : 9500542656
                        </p>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          Ettayapuram Road : 7502914688
                        </p>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          Amroy church : 6381673966
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          Sankar Pulam : 7537933164
                        </p>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          Kamaraj college : 9514466455
                        </p>
                        <p
                          style={{
                            margin: "5px 0",
                            textTransform: "uppercase",
                            fontSize: "12px",
                          }}
                        >
                          3rdmile : 9003466606
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order and Customer Information Section */}
              <div className="order-form">Order Form</div>
              <div
                className="details"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 20px",
                  fontSize: "16px",
                  background: "#E6F7FF",
                  position: "relative",
                }}
              >
                {/* Order Information */}
                <div style={{ width: "44%" }}>
                  <div>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        borderBottom: "1px solid #BFBFBF",
                        paddingBottom: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      Details
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "120px" }}>Form No :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                        color: "#003A8C",
                      }}
                    >
                      {selectedOrder.form_no}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "120px" }}>Date :</p>
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {moment(selectedOrder.created_at).format("DD-MM-YYYY")}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "120px" }}>Delivery Date :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {moment(selectedOrder.delivery_date).format(
                          "DD-MM-YYYY"
                        )}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "120px" }}>Delivery Time :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {moment(selectedOrder.delivery_time).format("hh:mm A")}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "120px" }}>Order Time :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "50%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {moment(selectedOrder.created_at).format("hh:mm A")}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    width: "2px",
                    height: "90%",
                    background: "#aaa",
                    position: "absolute",
                    top: "5%",
                    left: "47%",
                  }}
                ></div>

                {/* Customer Information */}
                <div style={{ width: "50%" }}>
                  <div>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        borderBottom: "1px solid #BFBFBF",
                        paddingBottom: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      Customer Info
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "150px" }}>Customer Name :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {selectedOrder.customer_name}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "150px" }}>Customer Number :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {selectedOrder.customer_phone}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "150px" }}>Address :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {selectedOrder.address}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "150px" }}>Email :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {selectedOrder.email || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ width: "150px" }}>Delivery Location :</p>{" "}
                    <p
                      style={{
                        fontWeight: "500",
                        border: "1px solid #1890FF",
                        background: "#BAE7FF",
                        padding: "3px 0",
                        margin: "auto",
                        width: "45%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "500", color: "#003A8C" }}>
                        {selectedOrder.location || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cake Details Section */}

              <div
                className="details"
                style={{
                  background: "#F0F0F0",
                  padding: "15px 20px",
                  fontSize: "16px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#F0F0F0",
                  }}
                >
                  {/* Order Information */}
                  <div style={{ width: "44%", padding: "40px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Wordings :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.wordings}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Birthday Date :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {moment(selectedOrder.birthday_date).format(
                            "DD-MM-YYYY"
                          )}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Cake Model :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.cake_model}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Weight :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.weight || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "2px",
                      height: "90%",
                      background: "#aaa",
                      position: "absolute",
                      top: "5%",
                      left: "47%",
                    }}
                  ></div>

                  {/* Customer Information */}
                  <div style={{ width: "50%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Flavour :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.flavour}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>Type :</p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.type || "N/A"}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "25px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Alteration if any :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.alteration || "N/A"}
                        </span>
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <p style={{ width: "150px", color: "#595959" }}>
                        Special Care :
                      </p>{" "}
                      <p
                        style={{
                          fontWeight: "500",
                          margin: "auto",
                          width: "45%",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {selectedOrder.special_care || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div
                className="details"
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "20px 0",
                  fontSize: "16px",
                  background: "#E6F7FF",
                }}
              >
                <p>
                  <p>
                    Amount :{" "}
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.amount}
                    </span>
                  </p>
                </p>
                <p>
                  <p>
                    Advance :{" "}
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.advance}
                    </span>
                  </p>
                </p>
                <p>
                  <p>
                    Balance :{" "}
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.balance || "N/A"}
                    </span>
                  </p>
                </p>
                <p>
                  <p
                    style={{
                      color: "#fff",
                      background: "#1890FF",
                      padding: "5px 20px",
                    }}
                  >
                    Total :{" "}
                    <span style={{ fontWeight: "500" }}>
                      {selectedOrder.amount}
                    </span>
                  </p>
                </p>
              </div>

              {/* Attention Notice Section */}
              <div
                style={{
                  padding: "15px 20px",
                  textAlign: "center",
                  borderBottom: "1px solid #6a1b1a",
                }}
              >
                <p style={{ fontSize: "30px", margin: "0" }}>
                  <p>Your Attention!</p>
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    width: "80%",
                    marginInline: "auto",
                  }}
                >
                  Delivery Every cake we offer is handcrafted and since each
                  chef has his/her own way of baking and designing a cake, there
                  might be slight variation in the product in terms of design.
                </p>
              </div>
              {/* Terms and Conditions Section */}
              <div
                style={{
                  padding: "10px 20px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                <ol style={{ paddingLeft: "20px", color: "#002766" }}>
                  <li>Bring this receipt at the time of delivery please.</li>
                  <li>
                    Minimum amount of 50% of the total amount should be paid as
                    advance.
                  </li>
                  <li>
                    For wedding cakes 100% of the amount should be paid as
                    advance.
                  </li>
                  <li>
                    Advance once received will not be returned at any
                    circumstances.
                  </li>
                  <li>
                    The advance received against cancellation order will be
                    adjusted in future orders or purchases of any of our outlet
                    products.
                  </li>
                  <li>
                    Cancellation of order should be intimated at the minimum
                    time of 48 hrs before the time of delivery.
                  </li>
                  <li>
                    Cancellation will not be done through phone. (Customer
                    should come in person).
                  </li>
                  <li>
                    For door delivery vehicle fare will be collected from the
                    customer.
                  </li>
                  <li>
                    Above 2Kg birthday cakes we haven’t provided carry bag,
                    sorry.
                  </li>
                  <li>
                    Fresh cream cakes, choco truffle cakes can be kept in normal
                    temperature for only two hours. After that, it should be
                    kept in chiller and it should not be kept in freezer.
                  </li>
                </ol>
              </div>

              {/* Footer Information Section */}
              <div
                className="details"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#E6F7FF",
                  padding: "15px 20px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <div>
                  <p style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <p>Branch :</p>
                  </p>
                  <span>
                    {branches[selectedOrder.branch] || "Unknown Branch"}
                  </span>
                </div>
                <div>
                  <p style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <p>Salesman :</p>{" "}
                  </p>
                  <span>{selectedOrder.sales_man}</span>
                </div>
                <div>
                  <p style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <p>Customer Sign :</p>
                  </p>
                  <img
                    src={selectedOrder.customer_signature}
                    style={{ width: "80px" }}
                  />
                </div>
                <div>
                  <p style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <p>Delivery Type :</p>{" "}
                  </p>
                  <span>{selectedOrder.delivery_type}</span>
                </div>
              </div>
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default OrderHistory;
