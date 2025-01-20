import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  InputNumber,
  Checkbox,
  Modal,
  DatePicker,
  TimePicker,
  Select,
  message,
} from "antd";
import { CloseOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import "../pages/BranchOrder.css";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isStockOrder, setIsStockOrder] = useState(false);
  const [showDeliveryFields, setShowDeliveryFields] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [branch, setBranch] = useState(""); // State to store selected branch
  const [branches, setBranches] = useState([]); // State to store fetched branches

  useEffect(() => {
    const newItems = location.state?.cartItems || [];
    const oldItems = JSON.parse(localStorage.getItem("cart")) || [];
    const mergedCart = [
      ...oldItems,
      ...newItems.filter(
        (newItem) => !oldItems.some((oldItem) => oldItem._id === newItem._id)
      ),
    ];
    setCartItems(mergedCart);
    calculateTotal(mergedCart);
  }, [location]);

  // Fetch branches from the stores collection in the database
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://64.227.145.104:3001/stores");
        if (response.data) {
          setBranches(response.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        message.error("Failed to fetch branches");
      }
    };

    fetchBranches();
  }, []);

  const handleBranchChange = (value) => {
    setBranch(value);
    localStorage.setItem("branch", value); // Store selected branch in localStorage
  };

  const handleStockOrderChange = (e) => {
    setIsStockOrder(e.target.checked);
    setShowDeliveryFields(e.target.checked);
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    const updatedItems = cartItems.filter((item) => item._id !== productId);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce(
      (acc, item) => acc + (item.quantity || 1) * item.price,
      0
    );
    setTotalAmount(total);
  };

  const updateStockQuantity = (productId, inStockQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, inStockQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };


  const handlePlaceOrder = async () => {
    if (!branch) {
      message.error("Please select a branch before placing the order.");
      return;
    }
    console.log("Placing order...");
    try {
      const orderData = cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        inStockQuantity: item.inStockQuantity,
      }));
  
      console.log("Order Data:", orderData);
  
      const response = await axios.post("http://64.227.145.104:3001/orderplaceds", {
        products: orderData,
        totalAmount,
        isStockOrder,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
        deliveryTime: deliveryTime ? deliveryTime.format("HH:mm") : null,
        branch, // Include the branch field
      });
  
      if (response.status === 201) {
        console.log("Order placed successfully");
        setIsModalVisible(true);
        clearCart();
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  // const handlePlaceOrder = async () => {
  //   if (!branch) {
  //     message.error("Please select a branch before placing the order.");
  //     return;
  //   }
  
  //   try {
  //     const orderData = cartItems.map((item) => ({
  //       name: item.name,
  //       quantity: item.quantity,
  //       price: item.price,
  //       inStockQuantity: item.inStockQuantity,
  //     }));
  
  //     const response = await axios.post("http://64.227.145.104:3001/placeorders", {
  //       products: orderData,
  //       totalAmount,
  //       isStockOrder,
  //       deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
  //       deliveryTime: deliveryTime ? deliveryTime.format("HH:mm") : null,
  //       branch, // Include branch info here
  //     });
  
  //     if (response.status === 201) {
  //       setIsModalVisible(true);
  //       clearCart();
  //     } else {
  //       console.error("Unexpected response status:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Failed to place order:", error);
  //   }
  // };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate("/dashboard/branch-order");
  };

  const handleAddItems = () => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    navigate("/dashboard/branch-order");
  };

  return (
    <div className="cart-container">
      
      <div className="filter-container">
      <h2 className="cart-title">Cart</h2>
        <div className="filter-item">
          <label>Branch</label>
          <Select
            value={branch}
            onChange={handleBranchChange}
            className="filter-select"
            placeholder="Select a branch"
            
          >
            {branches.map((store) => (
              <Select.Option key={store._id} value={store.branch}>
                {store.branch}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Display the selected branch */}
      {branch && (
        <div className="selected-branch">
          <span>Selected Branch: {branch}</span>
        </div>
      )}

      {cartItems.length > 0 ? (
        <div className="order-select">
          <h4>Order You Selected</h4>
          {cartItems.map((product) => (
            <div className="order-select-products" key={product._id}>
              <span
                className="products-name"
                style={{ fontWeight: "bold", width: "15%" }}
              >
                {product.name} <br />
                <span style={{ fontSize: "12px", color: "#888" }}>
                  1 pcs: ₹{product.price}
                </span>
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ color: "green", fontSize: "12px" }}>Qty</span>
                <div className="quantity-controls">
                  <Button
                    onClick={() =>
                      handleQuantityChange(product._id, product.quantity - 1)
                    }
                    disabled={product.quantity <= 1}
                    style={{
                      borderRadius: "0px",
                      backgroundColor: "#f5f5f5",
                      width: "32px",
                    }}
                  >
                    -
                  </Button>
                  <InputNumber
                    min={1}
                    value={product.quantity}
                    onChange={(value) =>
                      handleQuantityChange(product._id, value)
                    }
                    className="custom-input-number"
                    style={{
                      width: "110px",
                      textAlign: "center",
                      borderTop: "1px solid #D9D9D9",
                      borderBottom: "1px solid #D9D9D9",
                      borderRadius: "0px",
                    }}
                  />
                  <Button
                    onClick={() =>
                      handleQuantityChange(product._id, product.quantity + 1)
                    }
                    style={{
                      borderRadius: "0px",
                      backgroundColor: "#f5f5f5",
                      width: "32px",
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ color: "red", fontSize: "12px" }}>In Stock</span>
                <InputNumber
                  min={0}
                  value={product.inStockQuantity}
                  onChange={(value) => updateStockQuantity(product._id, value)}
                  className="custom-input-number"
                  style={{
                    width: "110px",
                    textAlign: "center",
                    borderTop: "1px solid #D9D9D9",
                    borderBottom: "1px solid #D9D9D9",
                    borderRadius: "0px",
                  }}
                />
              </div>

              <span
                className="product-price"
                style={{
                  border: "1px solid #1890FF",
                  color: "#1890FF",
                  padding: "5px 10px",
                  fontWeight: "400",
                  textAlign: "center",
                  width: "15%",
                }}
              >
                Price: ₹{product.quantity * product.price}
              </span>
              <Button
                style={{ color: "#1890FF" }}
                onClick={() => handleRemoveProduct(product._id)}
                className="close-btn view-des"
              >
                Remove
              </Button>
              <Button
                icon={<CloseOutlined style={{ color: "#1890FF" }} />}
                onClick={() => handleRemoveProduct(product._id)}
                className="close-btn view-mob"
              />
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

      <Button type="primary" onClick={handleAddItems}>
        Add Item
      </Button>

      <div className="place-order">
        <Checkbox
          style={{ borderRadius: "0px" }}
          checked={isStockOrder}
          onChange={handleStockOrderChange}
        >
          Is a stock order?
        </Checkbox>
        {showDeliveryFields && (
          <>
            <span style={{ marginLeft: "20px" }}>
              Delivery Date:{" "}
              <DatePicker onChange={(date) => setDeliveryDate(date)} />
            </span>
            <span style={{ marginLeft: "20px" }}>
              Delivery Time:{" "}
              <TimePicker
                onChange={(time) => setDeliveryTime(time)}
                format="hh:mm a"
              />
            </span>
          </>
        )}
      </div>

      <div className="cart-summary" style={{ marginLeft: "20px", marginTop: "30px" }}>
        <span>Total Products: {cartItems.length}</span>
        <span>Total Amount: ₹{totalAmount}</span>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          style={{ padding: "8px 20px" }}
          onClick={handlePlaceOrder}
        >
          Place an Order
        </Button>
      </div>

      <Modal
        title="Order Success"
        open={isModalVisible}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <p>Your order has been placed successfully!</p>
      </Modal>
    </div>
  );
};

export default Cart;
