// /foodmarketplace/search/page.js
import { Suspense } from "react";
import axios from "axios";
import FoodItemCard from "@/app/components/foodmarketplace/FoodItemCard";
import FoodNavBar from "@/app/components/foodmarketplace/NavBar";
import SearchInput from "./SearchInput";

async function fetchProducts({ searchKey, categoryId }) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = process.env.TOKEN; // Adjust token retrieval as needed
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
    return res.data.data.rows || [];
  } catch (err) {
    console.error("Error fetching products", err);
    return [];
  }
}

export default async function SearchPage({ searchParams }) {
  const categoryId = searchParams.categoryId || null;
  const products = await fetchProducts({ categoryId });

  return (
    <div className="min-h-screen flex justify-center">
      <div className="max-w-md w-full flex flex-col relative min-h-screen">
        <div className="sticky top-0 p-2 w-full bg-white shadow-sm z-50">
          <Suspense fallback={<div>Loading search...</div>}>
            <SearchInput
              initialCategoryId={categoryId}
              onSearch={async (searchKey, categoryId) => {
                "use server";
                return await fetchProducts({ searchKey, categoryId });
              }}
            />
          </Suspense>
        </div>
        <div className="p-server space-y-4 max-w-md">
          {products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            products.map((product) => (
              <FoodItemCard key={product.id} item={product} />
            ))
          )}
        </div>
        <div className="w-full max-w-full sticky">
          <FoodNavBar />
        </div>
      </div>
    </div>
  );
}