"use client";

import { useState } from "react";
import { useProduct } from "../context/ProductContext";
import { useRouter } from "next/navigation";
import { Menu, User, Search, Heart } from "lucide-react";
import FilterModal from "../components/electronicsmarketplcae/FilterModal";
import BottomNavigation from "../components/electronicsmarketplcae/BottomNavigation";

export default function HomePage() {
  const {
    categories,
    products,
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
  } = useProduct();

  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    setPage(1);
    fetchProducts(selectedCategories, value, 1);
  };

  const handleCategorySelect = (categoryId) => {
    // Toggle category in selectedCategories array
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId) // Remove if already selected
        : [...prev, categoryId] // Add if not selected
    );
    setPage(1);
    // Fetch products with updated categories
    fetchProducts(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId],
      searchKey,
      1
    );
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative max-w-md mx-auto">
        {/* Fixed Header */}
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Menu className="w-6 h-6 text-gray-700" />
              <div>
                <p className="text-gray-500 text-sm">Welcome</p>
                <p className="font-semibold text-lg">Electronics Store</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Electronics"
              value={searchKey}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pt-40 pb-28">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedCategories.includes(category.id)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.categoryLanguages[0]?.name || "Unnamed"}
                </button>
              ))}
            </div>
          )}

          {/* Error / Loading / Products */}
          {loading && <p className="text-center text-gray-500">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="relative mb-3">
                    <img
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/electronicsmarketplace/product/${product.id}`)
                    }
                    className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-500">No products found.</p>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="self-center">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Modals & Bottom Nav */}
        <FilterModal />
        <BottomNavigation />
      </div>
    </div>
  );
}