import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Button, InputNumber, Checkbox, Modal, message } from "antd";
import { CloseOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { DatePicker, TimePicker } from "antd";
import axios from "axios";
import './BranchOrder.css'

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCartItems = location.state?.cartItems || [];

  const [selectedProducts, setSelectedProducts] = useState(
    initialCartItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
      inStockQuantity: item.inStockQuantity || 10,
    }))
  );

  const [totalAmount, setTotalAmount] = useState(0);
  const [isStockOrder, setIsStockOrder] = useState(false);
  const [showDeliveryFields, setShowDeliveryFields] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleStockOrderChange = (e) => {
    setIsStockOrder(e.target.checked);
    setShowDeliveryFields(e.target.checked);
  };

  useEffect(() => {
    calculateTotal(selectedProducts);
  }, [selectedProducts]);

  const handleQuantityChange = (name, quantity) => {
    if (quantity < 1) return;
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.name === name ? { ...product, quantity } : product
      )
    );
  };

  const handleRemoveProduct = (name) => {
    const updatedProducts = selectedProducts.filter(
      (product) => product.name !== name
    );
    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  const calculateTotal = (products) => {
    const total = products.reduce(
      (acc, product) => acc + (product.quantity || 1) * product.price,
      0
    );
    setTotalAmount(total);
  };

  const updateStockQuantity = (name, inStockQuantity) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.name === name ? { ...product, inStockQuantity } : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = selectedProducts.map((product) => ({
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        inStockQuantity: product.inStockQuantity,
      }));

      const response = await axios.post("http://43.205.54.210:3001/placeorders", {
        products: orderData,
        totalAmount,
        isStockOrder,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
        deliveryTime: deliveryTime ? deliveryTime.format("HH:mm") : null,
      });

      if (response.status === 200) {
        // Show the success modal
        setIsModalVisible(true);

        // Set the flag to signal BranchOrder to clear selected products
        localStorage.setItem("orderCompleted", "true");
        message.success("orderCompleted")
        navigate('/profile')
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate("/profile/branch-order");
  };
  return (
    <div className="cart-container">
      <h2 className="cart-title">Cart</h2>

      {selectedProducts.length > 0 ? (
        <div className="order-select">
          <h4>Order You Selected</h4>
          {selectedProducts.map((product) => (
            <div className="order-select-products" key={product.name}>
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
                      handleQuantityChange(product.name, product.quantity - 1)
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
                      handleQuantityChange(product.name, value)
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
                      handleQuantityChange(product.name, product.quantity + 1)
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
                  onChange={(value) => updateStockQuantity(product.name, value)}
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
                onClick={() => handleRemoveProduct(product.name)}
                className="close-btn view-des"
              >
                Remove
              </Button>
              <Button
                icon={<CloseOutlined style={{ color: "#1890FF" }} />}
                onClick={() => handleRemoveProduct(product.name)}
                className="close-btn view-mob"
              />
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

      {selectedProducts.length > 0 ? (
        <div className="order-select-mob">
          <h4>Order You Selected</h4>
          {selectedProducts.map((product) => (
            <div className="order-select-products-mob" key={product.name}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "40px",
                }}
              >
                <span
                  className="products-name"
                  style={{ fontWeight: "bold", width: "15%" }}
                >
                  {product.name} <br />
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    1 pcs: ₹{product.price}
                  </span>
                </span>

                <div style={{ display: "flex", gap: "10px" }}>
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
                    icon={<CloseOutlined style={{ color: "#1890FF" }} />}
                    onClick={() => handleRemoveProduct(product.name)}
                    className="close-btn "
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
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
                        handleQuantityChange(product.name, product.quantity - 1)
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
                        handleQuantityChange(product.name, value)
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
                        handleQuantityChange(product.name, product.quantity + 1)
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
                  <span style={{ color: "red", fontSize: "12px" }}>
                    In Stock
                  </span>
                  <InputNumber
                    min={0}
                    value={product.inStockQuantity}
                    onChange={(value) =>
                      updateStockQuantity(product.name, value)
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

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
      <div
        className="cart-summary"
        style={{ marginLeft: "20px", marginTop: "30px" }}
      >
        <span>Total Products: {selectedProducts.length}</span>
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

      {/* Success Modal */}
      <Modal
        title="Order Success"
        open={isModalVisible} // updated to "open" instead of "visible"
        onOk={handleModalClose}
        onCancel={handleModalClose}
      >
        <p>Your order has been placed successfully!</p>
      </Modal>
    </div>
  );
};

export default Cart;