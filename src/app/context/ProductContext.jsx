"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ProductContext = createContext();
export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

  // 🔐 Read token for secure APIs
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user/category/list`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ limit: 20, offset: 0, languageId }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.rows);
      } else {
        setError("Failed to fetch categories");
      }
    } catch {
      setError("Error fetching categories");
    }
  };

  const fetchProducts = async (
    categoryIds = selectedCategories,
    search = searchKey,
    currentPage = page
  ) => {
    const offset = (currentPage - 1) * limit;
    try {
      setLoading(true);

      const body = {
        limit,
        offset,
        languageId,
      };

      if (categoryIds && categoryIds.length > 0) {
        body.categoryIds = categoryIds;
      }

      if (search && search.trim() !== "") {
        body.searchKey = search.trim();
      }

      const res = await fetch(`${BASE_URL}/user/product/listv2`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("products",data)
      if (data.success) {
        setProducts(
          data.data.rows.map((product) => ({
            id: product.id,
            name: product.productLanguages[0]?.name || "Unnamed Product",
            price: product.varients?.[0]?.inventory?.price || 0,
            image: product.productImages[0]?.url || "/placeholder.svg",
            categoryId: product.categoryId,
            productVarientUomId: product.varients?.[0]?.id
          }))
        );
        setTotalCount(data.data.count || 0);
      } else {
        setError("Failed to fetch products");
      }
    } catch {
      setError("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts([], ""); 
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategories, searchKey, page);
  }, [page, searchKey, selectedCategories]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        selectedCategories,
        setSelectedCategories,
        searchKey,
        setSearchKey,
        fetchProducts,
        page,
        setPage,
        limit,
        totalCount,
        loading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};