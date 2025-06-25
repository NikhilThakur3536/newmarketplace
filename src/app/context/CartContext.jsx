"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CartContext = createContext();
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const apiMap = {
  foodmarketplace: {
    add: "/user/cart/addv1",
    list: "/user/cart/listv1",
    remove: "/user/cart/remove",
    edit: "/user/cart/edit",
  },
  autopartsmarketplace: {
    add: "/autoparts/cart/add",
    list: "/autoparts/cart/list",
    remove: "/autoparts/cart/remove",
    edit: "/autoparts/cart/edit",
  },
  electronicsmarketplace:{
    add:"/user/cart/addv2",
    list:"/user/cart/listv2",
    remove:"/user/cart/remove",
    edit: "/user/cart/edit",
  }
};

export const CartProvider = ({ children, marketplace = "foodmarketplace" }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const cartEndpoints = apiMap[marketplace];

  if (!cartEndpoints) {
    console.error(`Invalid marketplace "${marketplace}" passed to CartProvider.`);
    return children;
  }

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchCartItems = async () => {
    try {
      const token = getToken();
      const res = await axios.post(
        `${baseUrl}${cartEndpoints.list}`,
        {
          languageId: "2bfa9d89-61c4-401e-aae3-346627460558",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res.data?.data?.rows)
      const items = res.data?.data?.rows || [];
      setCartItems(items);

      const total = items.reduce((acc, item) => acc + Math.floor(item.quantity), 0);
      setCartCount(total);
    } catch (err) {
      console.error("Error fetching cart items:", err);
    }
  };

  const fetchCartCount = async () => {
    await fetchCartItems();
  };

  const addToCart = async (payload) => {
    try {
      const token = getToken();
      const res = await axios.post(`${baseUrl}${cartEndpoints.add}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCartItems();
      return res.data;
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${baseUrl}${cartEndpoints.remove}`,
        { cartId: itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCartItems();
      toast.custom(
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Item removed from cart successfully
        </div>
      );
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  const updateCartQuantity = async ({ cartId, productId, quantity }) => {
  try {
    const token = getToken();
    const roundedQuantity = Math.max(1, Math.floor(quantity));

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartId ? { ...item, quantity: roundedQuantity } : item
      )
    );

    const response = await axios.post(
      `${baseUrl}${cartEndpoints.edit}`,
      {
        cartId,
        productId,
        quantity: roundedQuantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Update cart response:", response.data);

    await fetchCartItems();

    toast.dismiss("quantity-toast"); 
    toast.custom(
      <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
        Quantity updated successfully
      </div>,
      { id: "quantity-toast",duration:500 }
    );
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    await fetchCartItems(); 
    toast.dismiss("quantity-toast"); 
    toast.custom(
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
        Quantity updation error
      </div>,
      { id: "quantity-toast",duration:500 }
    );
    throw err; 
  }
};

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        addToCart,
        removeFromCart,
        fetchCartItems,
        fetchCartCount,
        updateCartQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
