"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ProductContext = createContext();
export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children, marketplace = "electronicsmarketplace" }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedLanguage") || "2bfa9d89-61c4-401e-aae3-346627460558"
      : "2bfa9d89-61c4-401e-aae3-346627460558"
  );

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/category/list`,
        { limit: 20, offset: 0, languageId: language },
        { headers: getAuthHeaders() }
      );
      const data = response.data;
      if (data.success) {
        setCategories(data.data.rows || []);
      } else {
        setError(`Failed to fetch categories for ${marketplace} marketplace`);
      }
    } catch (err) {
      //setError(`Error fetching categories for ${marketplace} marketplace: ${err.message}`);
    }
  };

  const fetchProducts = async (
    categoryIds = selectedCategories,
    search = searchKey,
    currentPage = page,
    filters = {} 
  ) => {
    const offset = (currentPage - 1) * (filters.limit || limit); 
    try {
      setLoading(true);
      const body = {
        limit: filters.limit || limit, 
        offset: filters.offset || offset, 
        languageId: filters.languageId || language, 
      };
      if (categoryIds && categoryIds.length > 0) {
        body.categoryIds = categoryIds;
      }
      if (search && search.trim() !== "") {
        body.searchKey = search.trim();
      }
      if (filters.manufacturerId) {
        body.manufacturerId = filters.manufacturerId;
      }
      if (filters.productModelId) {
        body.productModelId = filters.productModelId; 
      }


      const endpoint = marketplace === "foodmarketplace" ? "listv1" : "listv2";
      const response = await axios.post(
        `${BASE_URL}/user/product/${endpoint}`,
        body,
        { headers: getAuthHeaders() }
      );
      const data = response.data;
      console.log("data",data)
      if (data.success) {
        setProducts(
          (data.data.rows || []).map((product) => ({
            id: product.id,
            name: product.productLanguages?.[0]?.name || "Unnamed Product",
            price: product.varients?.[0]?.inventory?.price || product.variants?.[0]?.inventory?.price || 0,
            image: product.productImages?.[0]?.media?.url || "/placeholder.svg",
            categoryId: product.categoryId,
            productVarientUomId: product.varients?.[0]?.id || product.variants?.[0]?.id,
            productLanguages: product.productLanguages || [],
            varients: product.varients || product.variants || [],
          }))
        );
        setTotalCount(data.data.count || 0);
      } else {
        setError(`Failed to fetch products for ${marketplace} marketplace`);
      }
    } catch (err) {
      setError(`Error fetching products for ${marketplace} marketplace: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularProducts = async () => {
    if (marketplace !== "foodmarketplace") return;
    try {
      const response = await axios.post(
        `${BASE_URL}/user/product/listv1`,
        {
          limit: 10,
          offset: 0,
          languageId: language,
        },
        { headers: getAuthHeaders() }
      );
      const data = response.data;
      if (data.success) {
        setPopularProducts(
          (data.data.rows || []).map((product) => ({
            id: product.id,
            name: product.productLanguages?.[0]?.name || "Unnamed Product",
            price: product.varients?.[0]?.inventory?.price || product.variants?.[0]?.inventory?.price || 0,
            image: product.productImages?.[0]?.url || "/placeholder.svg",
            categoryId: product.categoryId,
            productVarientUomId: product.varients?.[0]?.id || product.variants?.[0]?.id,
            productLanguages: product.productLanguages || [],
            varients: product.varients || product.variants || [],
          }))
        );
      } else {
        setError("Failed to fetch popular products for food marketplace");
      }
    } catch (err) {
      setError(`Error fetching popular products for food marketplace: ${err.message}`);
    }
  };

  const addToCart = async (productId, productVarientUomId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/cart/add`,
        {
          productId,
          productVarientUomId,
          quantity: 1,
        },
        { headers: getAuthHeaders() }
      );
      const data = response.data;
      if (!data.success) {
        setError(`Failed to add product to cart: ${data.message || "Unknown error"}`);
      }
      return data;
    } catch (err) {
      setError(`Error adding product to cart: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchPopularProducts();
  }, [language]);

  useEffect(() => {
    fetchProducts(selectedCategories, searchKey, page);
  }, [page, searchKey, selectedCategories]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("selectedLanguage");
      if (newLang && newLang !== language) {
        setLanguage(newLang);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  return (
    <ProductContext.Provider
      value={{
        products,
        popularProducts,
        categories,
        selectedCategories,
        setSelectedCategories,
        searchKey,
        setSearchKey,
        fetchProducts,
        fetchPopularProducts,
        addToCart,
        page,
        setPage,
        limit,
        totalCount,
        loading,
        error,
        language,
        setLanguage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};