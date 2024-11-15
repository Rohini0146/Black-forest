import React, { useState, useEffect } from "react";
import { Layout, Input, Button, Checkbox, InputNumber } from "antd";
import { SearchOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../pages/BranchOrder.css";

const { Content } = Layout;

const BranchOrder = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [cart, setCart] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedFavourites =
      JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(savedFavourites);

    fetchCategories();
    fetchProducts(savedFavourites); // Pass saved favorites to initialize favorite status in products
  }, []);

  useEffect(() => {
    // Save favourites to localStorage whenever it changes
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://43.205.54.210:3001/productcategories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async (savedFavourites) => {
    try {
      const response = await axios.get("http://43.205.54.210:3001/pastries");
      const productsWithQuantity = response.data.map((product) => ({
        ...product,
        quantity: 0,
        inStockQuantity: undefined, // Start as undefined
        isFavourite: savedFavourites.some((fav) => fav._id === product._id),
      }));
      setProducts(productsWithQuantity);
      setFilteredProducts(productsWithQuantity);
      calculateCategoryCounts(productsWithQuantity);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };
  

  const calculateCategoryCounts = (products) => {
    const counts = {};
    products.forEach((product) => {
      const categoryName = product.category?.name;
      if (categoryName) {
        counts[categoryName] = (counts[categoryName] || 0) + 1;
      }
    });
    setCategoryCounts(counts);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategoryName(categoryName);
    setSearchTerm("");
    const filtered = products.filter(
      (product) => product.category && product.category.name === categoryName
    );
    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedCategoryName("");
    applyFilters(value, "");
  };

  const applyFilters = (search, categoryName) => {
    const searchLower = search.toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = categoryName
        ? product.category && product.category.name === categoryName
        : true;
      const matchesSearch = search
        ? product.name.toLowerCase().includes(searchLower)
        : true;
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  };

  const toggleCartItem = (product) => {
    const updatedCart = [...cart];
    const productIndex = updatedCart.findIndex(
      (item) => item._id === product._id
    );

    if (productIndex !== -1) {
      updatedCart.splice(productIndex, 1);
    } else {
      const currentProduct = products.find((item) => item._id === product._id);
      updatedCart.push({ ...product, quantity: currentProduct.quantity });
    }

    setCart(updatedCart);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = products.map((product) =>
      product._id === productId
        ? { ...product, quantity: Math.max(quantity, 0) }
        : product
    );
    setProducts(updatedProducts);

    const updatedCart = cart.map((item) =>
      item._id === productId
        ? { ...item, quantity: Math.max(quantity, 0) }
        : item
    );
    setCart(updatedCart);

    const updatedFilteredProducts = updatedProducts.filter((product) =>
      selectedCategoryName
        ? product.category && product.category.name === selectedCategoryName
        : true
    );
    setFilteredProducts(updatedFilteredProducts);
  };

  const toggleFavourite = (product) => {
    // Load existing favorites from localStorage
    const existingFavourites =
      JSON.parse(localStorage.getItem("favourites")) || [];

    // Check if the product is already in favorites
    const isFavourite = existingFavourites.some(
      (fav) => fav._id === product._id
    );

    let updatedFavourites;

    if (isFavourite) {
      // If the product is already a favorite, remove it
      updatedFavourites = existingFavourites.filter(
        (fav) => fav._id !== product._id
      );
    } else {
      // If the product is not a favorite, add it
      updatedFavourites = [
        ...existingFavourites,
        { ...product, isFavourite: true },
      ];
    }

    // Update the state and localStorage
    setFavourites(updatedFavourites);
    localStorage.setItem("favourites", JSON.stringify(updatedFavourites));

    // Update the products list to reflect the change in favorite status
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === product._id ? { ...p, isFavourite: !p.isFavourite } : p
      )
    );
    setFilteredProducts((prevFilteredProducts) =>
      prevFilteredProducts.map((p) =>
        p._id === product._id ? { ...p, isFavourite: !p.isFavourite } : p
      )
    );
  };

  // Initial setup to load favorites from localStorage when the component mounts
  useEffect(() => {
    const savedFavourites =
      JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(savedFavourites);

    // Fetch categories and products with saved favorites applied
    fetchCategories();
    fetchProducts(savedFavourites); // Pass saved favourites to apply to products
  }, []);

  const goToCartPage = () => {
    navigate("/dashboard/cart", { state: { cartItems: cart } });
  };

  const goToFavouritesPage = () => {
    navigate("/dashboard/favourites", {
      state: { favouriteItems: favourites },
    });
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 3,
    arrows: true,
    dotsClass: "slick-dots custom-dots",
  };

  const handleInStockChange = (productId, value) => {
    const updatedProducts = products.map((product) =>
      product._id === productId
        ? { ...product, inStockQuantity: value } // Update value directly, even if it's 0
        : product
    );
    setProducts(updatedProducts);
  
    const updatedFilteredProducts = updatedProducts.filter((product) =>
      selectedCategoryName
        ? product.category && product.category.name === selectedCategoryName
        : true
    );
    setFilteredProducts(updatedFilteredProducts);
  };
  

  return (
    <Layout className="layout">
      <Content style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="create-order">
            <h2>Create an Order</h2>
          </div>
          <div
            onClick={goToFavouritesPage}
            style={{
              cursor: "pointer",
              color: "red",
            }}
          >
            <HeartFilled />
          </div>
        </div>
        <Input
          className="search"
          placeholder="Search the Product"
          value={searchTerm}
          onChange={handleSearchChange}
          suffix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
          style={{ marginBottom: 25 }}
        />
        <div className="categories-container">
          <Slider {...sliderSettings}>
            {categories.map((category) => (
              <div key={category._id} className="category-card">
                <Button
                  onClick={() => handleCategorySelect(category.name)}
                  type={
                    selectedCategoryName === category.name
                      ? "primary"
                      : "default"
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <span>{category.name}</span>
                  <span
                    className="count-items"
                    style={{ fontSize: "12px", color: "#888" }}
                  >
                    {categoryCounts[category.name] || 0} items
                  </span>
                </Button>
              </div>
            ))}
          </Slider>
        </div>
        {(searchTerm || selectedCategoryName) && (
          <div className="product-container">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`product-card ${
                    cart.some((item) => item._id === product._id)
                      ? "selected"
                      : ""
                  }`}
                >
                  <Checkbox
                    className="check-box"
                    onChange={() => toggleCartItem(product)}
                    checked={cart.some((item) => item._id === product._id)}
                    disabled={
                      product.inStockQuantity === undefined ||
                      product.inStockQuantity === null
                    } // Disable only if inStockQuantity is undefined or null
                  />

                  <div
                    className="fav"
                    onClick={() => toggleFavourite(product)}
                    style={{
                      cursor: "pointer",
                      color: product.isFavourite ? "red" : "grey",
                    }}
                  >
                    {product.isFavourite ? <HeartFilled /> : <HeartOutlined />}
                  </div>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: "100%", height: "150px" }}
                  />
                  <div className="product-information">
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>₹{product.price} / pc</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "space-around",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "green", fontSize: "12px" }}>
                          Qty
                        </span>
                        <div className="quantity-controls-one">
                          <Button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                product.quantity - 1
                              )
                            }
                            disabled={product.quantity <= 0}
                            style={{
                              borderRadius: "0px",
                              backgroundColor: "#f5f5f5",
                              width: "32px",
                            }}
                          >
                            -
                          </Button>
                          <InputNumber
                            min={0}
                            value={product.quantity}
                            onChange={(value) =>
                              handleQuantityChange(product._id, value)
                            }
                            className="custom-input-number"
                            style={{
                              width: "80px",
                              textAlign: "center",
                              borderTop: "1px solid #D9D9D9",
                              borderBottom: "1px solid #D9D9D9",
                              borderRadius: "0px",
                            }}
                          />
                          <Button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                product.quantity + 1
                              )
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
                          value={product.inStockQuantity || undefined} // Start with empty input
                          onChange={(value) =>
                            handleInStockChange(product._id, value)
                          }
                          className="custom-input-number"
                          style={{
                            width: "50px",
                            textAlign: "center",
                            borderTop: "1px solid #D9D9D9",
                            borderBottom: "1px solid #D9D9D9",
                            borderRadius: "0px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        )}
        {cart.length > 0 && (
          <Button className="confirm-order" onClick={goToCartPage}>
            Confirm Order
          </Button>
        )}
      </Content>
    </Layout>
  );
};

export default BranchOrder;
