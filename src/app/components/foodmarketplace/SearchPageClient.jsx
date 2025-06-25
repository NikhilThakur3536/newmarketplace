"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { SearchIcon } from "lucide-react";
import FoodItemCard from "./FoodItemCard";
import FoodNavBar from "./NavBar";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId"));
  const [searchKey, setSearchKey] = useState(searchParams.get("searchKey") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const catId = searchParams.get("categoryId");
    const sKey = searchParams.get("searchKey");

    if (sKey) {
      setSearchKey(sKey);
      setCategoryId(undefined);
    } else if (catId) {
      setCategoryId(catId);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/user/product/listv1`,
        {
          limit: 4000,
          offset: 0,
          languageId: "2bfa9d89-61c4-401e-aae3-346627460558",
          searchKey: searchKey || undefined,
          categoryId: searchKey ? undefined : categoryId || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data?.data?.rows || []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId, searchKey]);

  const handleSearch = () => {
    if (searchKey) {
      router.replace(`/foodmarketplace/search?searchKey=${encodeURIComponent(searchKey)}`);
    } else {
      fetchProducts();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="max-w-md w-full flex flex-col relative min-h-screen">
        {/* Search Bar */}
        <div className="sticky top-0 p-2 w-full bg-white shadow-sm z-50">
          <div className="relative w-full">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-white border border-lightpink rounded-lg w-full py-2 pr-10 pl-8 outline-none"
              placeholder="Search Here"
            />
            <SearchIcon
              onClick={handleSearch}
              className="text-lightpink absolute top-2.5 right-2 cursor-pointer"
              size={20}
            />
            <SearchIcon
              className="text-lightpink absolute top-2.5 left-1"
              size={20}
            />
          </div>
        </div>

        {/* Product Results */}
        <div className="p-4 space-y-4 max-w-md">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            products.map((product) => (
              <FoodItemCard key={product.id} item={product} />
            ))
          )}
        </div>

        {/* Bottom Nav */}
        <div className="w-full max-w-full sticky">
          <FoodNavBar />
        </div>
      </div>
    </div>
  );
}
