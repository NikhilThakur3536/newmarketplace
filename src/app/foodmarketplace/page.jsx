"use client";

import { Search, UserRound } from "lucide-react";
import CategoryTabs from "../components/foodmarketplace/CategoryTabs";
import FoodHeader from "../components/foodmarketplace/Header";
import FoodNavBar from "../components/foodmarketplace/NavBar";
import { CategoryProvider } from "../context/CategoryContext";
import StoreList from "../components/foodmarketplace/StoreList";
import { useState } from "react";

export default function FoodMarketPlace() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <CategoryProvider>
      <div className="min-h-screen flex justify-center overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-4 pb-20">
          <div className="w-full">
            <FoodHeader />
          </div>
          {/* Search Bar */}
          <div className="sticky top-2 z-20 w-full p-2 max-w-md mx-auto">
              <div className="relative w-[99%] bg-white py-2 rounded-lg border border-gray-200">
                <input
                  type="text"
                  placeholder="Search here"
                  className="w-full pl-10 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="text-lightpink absolute top-2 left-2"
                  size={25}
                />
              </div>
          </div>
          {/* Category Tabs */}
          <div className="w-full py-1 sticky top-[60px] z-35 bg-white flex gap-4 overflow-x-auto scrollbar-hide px-2">
            <CategoryTabs />
          </div>
          {/* Restaurant card */}
          <StoreList searchQuery={searchQuery} />
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white backdrop-blur-sm">
            <FoodNavBar />
          </div>
        </div>
      </div>
    </CategoryProvider>
  );
}