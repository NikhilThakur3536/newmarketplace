"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { debounce } from "lodash";

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
  electronicsmarketplace: {
    add: "/user/cart/addv2",
    list: "/user/cart/listv2",
    remove: "/user/cart/remove",
    edit: "/user/cart/edit",
  },
};

export const CartProvider = ({ children, marketplace = "foodmarketplace" }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCartHash, setLastCartHash] = useState(null); 
  const pathname = usePathname();
  const cartEndpoints = apiMap[marketplace];

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const getLang = () => {
    if(typeof window !== "undefined"){
      return localStorage.getItem("selectedLanguage")
    }
  }

  const fetchCartItems = useCallback(
    debounce(async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        const lang = getLang();
        if (!token) {
          console.warn(`No token found for ${marketplace} cart`);
          setCartItems([]);
          setCartCount(0);
          localStorage.setItem(`cartCount_${marketplace}`, "0");
          return;
        }

        // console.log(`Calling fetchCartItems for ${marketplace}`); 
        const response = await axios.post(
          `${baseUrl}${cartEndpoints.list}`,
          { languageId: lang || "2bfa9d89-61c4-401e-aae3-346627460558" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log(`Cart response for ${marketplace}:`, response.data);

        const items = response.data?.data?.rows || [];
        if (!Array.isArray(items)) {
          console.error(`Invalid cart items response for ${marketplace}:`, items);
          setCartItems([]);
          setCartCount(0);
          localStorage.setItem(`cartCount_${marketplace}`, "0");
          return;
        }
        const cartHash = JSON.stringify(
          items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            priceInfo: item.priceInfo,
          }))
        );

        if (cartHash === lastCartHash) {
          // console.log(`No changes in ${marketplace} cart, skipping update`);
          return;
        }

        const total = items.reduce((sum, item) => {
          const qty = Number(item.quantity) || 0;
          return sum + Math.floor(qty);
        }, 0);

        setCartItems(items);
        setCartCount(total);
        setLastCartHash(cartHash); 
        localStorage.setItem(`cartCount_${marketplace}`, total.toString());
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: { marketplace } }));
      } catch (error) {
        console.error(`Error fetching cart for ${marketplace}:`, error);
        setCartItems([]);
        setCartCount(0);
        localStorage.setItem(`cartCount_${marketplace}`, "0");
        if (error.response?.status === 401) {
          // Optionally redirect to login
          // router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [cartEndpoints, marketplace, lastCartHash,]
  );

  const addToCart = async (payload) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token");

      await axios.post(`${baseUrl}${cartEndpoints.add}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCartItems();
      toast.dismiss("cart-toast")
      toast.success("Item added to cart",{id:"cart-toast",duration:300});
    } catch (error) {
      console.error(`Add to cart error for ${marketplace}:`, error);
      toast.dismiss("cart-remove")
      toast.error("Failed to add to cart",{id:"cart-remove",duration:300});
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token");

      await axios.post(
        `${baseUrl}${cartEndpoints.remove}`,
        { cartId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCartItems();
      toast.dismiss("remove-toast")
      toast.custom(
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Item removed successfully
        </div>,
        { id: "remove-toast", duration: 250 }
      );
    } catch (error) {
      
    }
  };

  const updateCartQuantity = async ({ cartId, productId, quantity }) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token");

      const roundedQuantity = Math.max(1, Math.floor(Number(quantity)));

      await axios.post(
        `${baseUrl}${cartEndpoints.edit}`,
        { cartId, productId, quantity: roundedQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCartItems();
      toast.dismiss("quantity-toast")
      toast.custom(
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Quantity updated successfully
        </div>,
        { id: "quantity-toast", duration: 300 }
      );
    } catch (error) {
      console.error(`Update quantity error for ${marketplace}:`, error);
      await fetchCartItems();
      toast.custom(
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Quantity update failed
        </div>,
        { id: "quantity-toast", duration: 250 }
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setLastCartHash(null); 
    localStorage.setItem(`cartCount_${marketplace}`, "0");
  };

  useEffect(() => {
    const savedCount = localStorage.getItem(`cartCount_${marketplace}`);
    if (savedCount) setCartCount(parseInt(savedCount, 10));
    fetchCartItems();
  }, [pathname, marketplace, fetchCartItems]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `cartCount_${marketplace}`) {
        setCartCount(parseInt(e.newValue, 10) || 0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [marketplace]);

  return (
    <CartContext.Provider
      value={{
        clearCart,
        cartCount,
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        fetchCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);