"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FavoriteContext = createContext();

export const useFavorite = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(null);

  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (!token) {
      console.log("No token, redirecting to login");
      setShowPopup({
        type: "error",
        message: "Please log in to view your favorites.", 
      });
      setTimeout(() => {
        setShowPopup(null);
        router.push("/foodmarketplace/login");
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      const payload = { languageId: "2bfa9d89-61c4-401e-aae3-346627460558" };
      console.log("Fetching favorites with payload:", payload);
      const response = await axios.post(`${BASE_URL}/user/favoriteProduct/listv1`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("API Response:", response.data);

      const items = response.data?.data?.rows?.map((item) => ({
        id: item.id || item.productId || "unknown-id",
        productLanguages: item.productLanguages || [{ name: "Unknown Product", longDescription: "No description" }],
        varients: item.varients || [{
          productVarientUoms: [{
            id: "default-uom-id",
            inventory: { price: 0 },
          }],
        }],
        media: item.media || [{ url: "/placeholder.jpg" }],
        addons: item.addons || [],
      })) || [];
      console.log("Mapped Items:", items);

      setFavoriteItems(items);
    } catch (error) {
      console.error("Error details:", error.response?.data, error.message);
      setShowPopup({
        type: "error",
        message: error.response?.data?.message || "Failed to load favorites.",
      });
      setTimeout(() => setShowPopup(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    console.log("Updated favoriteItems:", favoriteItems);
  }, [favoriteItems]);

  const toggleFavorite = async ({ productId, productVarientUomId, name, isFavorite }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectUrl", "/foodmarketplace/login");
      setShowPopup({
        type: "error",
        message: "Please log in to add or remove from favorites.",
      });
      setTimeout(() => {
        setShowPopup(null);
        router.push("/foodmarketplace/login");
      }, 500);
      return;
    }

    try {
      if (isFavorite) {
        const response = await axios.post(
          `${BASE_URL}/user/favoriteProduct/remove`,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Remove Favorite Response:", response.data);
        toast.custom(
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          {name} removed from favorites!
        </div>,
        { id: "quantity-toast", duration: 300 }
        ); 
        } else {
        const response = await axios.post(
          `${BASE_URL}/user/favoriteProduct/add`,
          { productId, productVarientUomId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Add Favorite Response:", response.data);
        toast.custom(
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          {name}adde to favorites!
        </div>,
        { id: "quantity-toast", duration: 300 }
        )
      }

      fetchFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setShowPopup({
        type: "error",
        message: error.response?.data?.message || "Failed to update favorites.",
      });
      setTimeout(() => setShowPopup(null), 300);
    }
  };

  return (
    <FavoriteContext.Provider
      value={{ favoriteItems, fetchFavorites, toggleFavorite, loading, showPopup }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};