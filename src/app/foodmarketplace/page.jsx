"use client";

import Image from "next/image";
import CategoryTabs from "../components/foodmarketplace/CategoryTabs";
import FoodHeader from "../components/foodmarketplace/Header";
import FoodNavBar from "../components/foodmarketplace/NavBar";
import { CategoryProvider } from "../context/CategoryContext";
import { Timer } from "lucide-react";
import StoreList from "../components/foodmarketplace/StoreList";

export default function FoodMarketPlace() {
  return (
    <CategoryProvider>
      <div className="min-h-screen flex justify-center overflow-y-auto ">
        <div className="w-full max-w-md flex flex-col gap-4 pb-20">
            <div className="w-full">
                <FoodHeader />
            </div>
            <div className="w-full py-1 sticky top-0 z-10 bg-white flex gap-4 overflow-x-auto scrollbar-hide px-2">
              <CategoryTabs />
            </div>
            {/* Restaurant card  */}
            <StoreList/>
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 bg-white backdrop-blur-sm">
                <FoodNavBar />
            </div>
        </div>
      </div>
    </CategoryProvider>
  );
}