"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Create context
const CartContext = createContext();
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Marketplace-specific API endpoints
const apiMap = {
  foodmarketplace: {
    add: "/user/cart/addv1",
    list: "/user/cart/listv1",
    remove: "/user/cart/removev1",
  },
  autopartsmarketplace: {
    add: "/autoparts/cart/add",
    list: "/autoparts/cart/list",
    remove: "/autoparts/cart/remove",
  },
};

// Provider
export const CartProvider = ({ children, marketplace = "foodmarketplace" }) => {
  const [cartCount, setCartCount] = useState(0);

  const cartEndpoints = apiMap[marketplace];

  if (!cartEndpoints) {
    console.error(`Invalid marketplace "${marketplace}" passed to CartProvider.`);
    return children;
  }

  // Get token
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = getToken();
      const res = await axios.post(`${baseUrl}${cartEndpoints.list}`,{
        languageId:"2bfa9d89-61c4-401e-aae3-346627460558"
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data?.data || [];
      const total = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(total);
    } catch (err) {
      console.error("Error fetching cart list:", err);
    }
  };

  // Add to cart
  const addToCart = async (payload) => {
    try {
      const token = getToken();
      const res = await axios.post(`${baseUrl}${cartEndpoints.add}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCartCount();
      return res.data;
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  // Remove from cart (optional if needed)
  const removeFromCart = async (itemId) => {
    try {
      const token = getToken();
      await axios.delete(`${baseUrl}${cartEndpoints.remove}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCartCount();
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, fetchCartCount, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => useContext(CartContext);
