"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { useProduct } from "@/app/context/ProductContext";

export default function FilterModal() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  const {
    categories,
    selectedCategories,
    setSelectedCategories,
    setSearchKey,
    setPage,
    fetchProducts,
  } = useProduct();

  const brands = ["Sony", "Samsung", "JBL", "Boat", "Philips"];
  const priceRanges = [
    { label: "Below $50" },
    { label: "$50 - $100" },
    { label: "$100 - $200" },
    { label: "Above $200" },
  ];

  const handleApplyFilters = () => {
    // Combine brand and price range into searchKey
    let searchComponents = [];

    if (selectedBrands.length > 0) {
      searchComponents.push(...selectedBrands);
    }

    if (selectedPriceRange) {
      searchComponents.push(selectedPriceRange);
    }

    const combinedSearchKey = searchComponents.join(" ").trim();
    setSearchKey(combinedSearchKey);
    setPage(1);
    fetchProducts(selectedCategories, combinedSearchKey, 1);

    setShowFilterModal(false);
  };

  return (
    <div className="max-w-md mx-auto relative">
      <button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-24 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <Filter className="w-6 h-6" />
      </button>

      {showFilterModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowFilterModal(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(category.id)
                            ? prev.filter((id) => id !== category.id)
                            : [...prev, category.id]
                        )
                      }
                      className={`px-4 py-2 rounded-full border text-sm ${
                        selectedCategories.includes(category.id)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {category.categoryLanguages[0]?.name || "Unnamed"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands (future use) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() =>
                        setSelectedBrands((prev) =>
                          prev.includes(brand)
                            ? prev.filter((b) => b !== brand)
                            : [...prev, brand]
                        )
                      }
                      className={`px-4 py-2 rounded-full border text-sm ${
                        selectedBrands.includes(brand)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range (future use) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range.label)}
                      className={`w-full text-left px-4 py-3 rounded-lg border ${
                        selectedPriceRange === range.label
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setSelectedPriceRange("");
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}