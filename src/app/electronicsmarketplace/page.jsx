"use client";

import { useState } from "react";
import { useProduct } from "../context/ProductContext";
import { useFavorite } from "../context/FavouriteContext";
import { useLanguage } from "../context/LanguageContext"; // Import useLanguage hook
import { useRouter } from "next/navigation";
import { Menu, User, Search, Heart, Globe } from "lucide-react"; // Add Globe icon
import FilterModal from "../components/electronicsmarketplcae/FilterModal";
import BottomNavigation from "../components/electronicsmarketplcae/BottomNavigation";
import toast from "react-hot-toast";

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
    setLanguage
  } = useProduct();

  const { favoriteItems, toggleFavorite } = useFavorite();
  const { languages, loading: languageLoading, error: languageError } = useLanguage(); // Access language context
  const router = useRouter();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false); // State for dropdown

  
  const handleLanguageSelect = (language) => {
    localStorage.setItem("selectedLanguage", language.id);
    setLanguage(language.id); // Update language state in ProductContext
    setIsLanguageDropdownOpen(false); // Close dropdown
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    setPage(1);
    fetchProducts(selectedCategories, value, 1);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setPage(1);
    fetchProducts(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId],
      searchKey,
      1
    );
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  const totalPages = Math.ceil(totalCount / limit);

  const handleFavoriteClick = (product) => {
    const isFavorite = favoriteItems.some(
      (item) => item.id === product.id || item.productId === product.id
    );
    const name = product.name || "Item";

    toggleFavorite({
      productId: product.id,
      name,
      isFavorite,
    });
  };


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
            <div className="flex items-center gap-3">
              {/* Globe Icon for Language Selection */}
              <div className="relative">
                <Globe
                  className="w-5 h-5 text-orange-600 cursor-pointer"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                />
                {/* Language Dropdown */}
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languageLoading ? (
                      <div className="p-2 text-center text-gray-500">Loading...</div>
                    ) : languageError ? (
                      <div className="p-2 text-center text-red-500">{languageError}</div>
                    ) : languages.length > 0 ? (
                      <ul className="py-1">
                        {languages.map((language) => (
                          <li
                            key={language.id} // Assuming language has an 'id' field
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                            onClick={() => handleLanguageSelect(language)}
                          >
                            {language.name} {/* Adjust based on your language object structure */}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2 text-center text-gray-500">No languages available</div>
                    )}
                  </div>
                )}
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
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
              {products.map((product) => {
                const isFavorite = favoriteItems.some(
                  (item) => item.id === product.id || item.productId === product.id
                );
                return (
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
                        onClick={() => handleFavoriteClick(product)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={isFavorite ? "red" : "white"}
                          stroke={isFavorite ? "red" : "black"}
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
                );
              })}
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