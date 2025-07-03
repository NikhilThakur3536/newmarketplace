"use client"

import { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useLocation } from "../../context/LocationContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import CouponList from "@/app/components/foodmarketplace/CouponList";
import { useCategories } from "@/app/context/CategoryContext";
import SelectionwiseProductCards from "@/app/components/foodmarketplace/SelectionwiseProductCards";
import PopularProductCards from "@/app/components/foodmarketplace/ProductCards";

export default function Home() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const { categories, categoryLoading } = useCategories();
  const { languages, loading: languageLoading, error } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLanguage") || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Wait for all data to be ready
  useEffect(() => {
    if (!categoryLoading && !languageLoading && locations.length > 0 && categories.length > 0) {
      setIsLoading(false);
    }
  }, [categoryLoading, languageLoading, locations, categories]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.id);
    localStorage.setItem("selectedLanguage", language.id);
    setLanguageDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-black">
      <div className="max-w-md w-full px-4 pt-4 bg-white flex flex-col gap-4 relative overflow-hidden">
        {/* Flow SVG */}
        <div className="absolute top-0 right-0 w-40 h-36">
          <svg width="160" height="146" viewBox="0 0 160 146">
            <motion.path
              d="M 10,0 L 30,60 L 80,35 L 100,120 L 120,40 L 160,70"
              stroke="#FEE8ED"
              strokeWidth={15}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              fill="none"
            />
          </svg>
        </div>
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="w-[60%] flex flex-col gap-1 justify-center relative">
            <div
              className="flex gap-2 items-center w-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center justify-center p-1 bg-[#F4F4F6] rounded-full h-fit w-fit">
                <svg width="18" height="18" viewBox="0 0 14 18" fill="none">
                  <path
                    d="M13.6673 7.33329C13.6673 11.4941 9.05148 15.8275 7.50148 17.1658C7.35709 17.2744 7.18132 17.3331 7.00065 17.3331C6.81999 17.3331 6.64421 17.2744 6.49982 17.1658C4.94982 15.8275 0.333984 11.4941 0.333984 7.33329C0.333984 5.56518 1.03636 3.86949 2.28661 2.61925C3.53685 1.36901 5.23254 0.666626 7.00065 0.666626C8.76876 0.666626 10.4645 1.36901 11.7147 2.61925C12.9649 3.86949 13.6673 5.56518 13.6673 7.33329Z"
                    fill="#8E64B3"
                  />
                  <path
                    d="M7 9.83337C8.38071 9.83337 9.5 8.71409 9.5 7.33337C9.5 5.95266 8.38071 4.83337 7 4.83337C5.61929 4.83337 4.5 5.95266 4.5 7.33337C4.5 8.71409 5.61929 9.83337 7 9.83337Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-black font-medium text-md line-clamp-1">
                {selectedLocation?.name || "Home"}
              </span>
              <ChevronDown color="black" size={20} />
            </div>
            {dropdownOpen && (
              <div className="z-[80] absolute top-full mt-1 left-0 bg-white rounded shadow w-64 max-h-60 overflow-auto">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="font-medium line-clamp-1">{loc.name}</div>
                    <div className="text-sm text-gray-500">{loc.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-6 h-6 rounded-full relative">
            <Image src="/profile.png" alt="image" fill className="object-cover" />
          </div>
        </div>
        <h1 className="font-semibold text-3xl w-[65%]">What are you going to eat today?</h1>
        <div className="w-full rounded-xl py-3 px-2 bg-[#F4F4F6] relative">
          <input
            type="text"
            placeholder="Search here..."
            className="w-full rounded-xl pl-4 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-2.5" fill="#D1BFE7" color="#D1BFE7" />
        </div>
        <CouponList totalAmount={500} />
        <h1 className="font-bold text-xl">Category</h1>
        <div className="flex overflow-x-scroll gap-2 scrollbar-hide">
          {categories.map((cat) => (
            <motion.div
              className={`flex gap-1 w-fit h-fit p-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                selectedCategory === cat.id ? "bg-black text-white" : "bg-white text-black"
              }`}
              key={cat.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedCategory(cat.id)}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-full relative w-6 h-6">
                <Image src="/placeholder.jpg" alt="placeholder" fill className="object-cover rounded-full" />
              </div>
              <h3 className="font-bold">{cat.code}</h3>
            </motion.div>
          ))}
        </div>
        <SelectionwiseProductCards selectedCategoryId={selectedCategory} />
        <h1 className="font-bold text-xl">Popular Items</h1>
        <div className="w-full overflow-x-scroll space-x-2 flex overflow-y-hidden scrollbar-hidden">
            <PopularProductCards />
        </div>
      </div>
    </div>
  );
}