"use client";

import { Search, UserRound } from "lucide-react";
import CategoryTabs from "../components/foodmarketplace/CategoryTabs";
import FoodHeader from "../components/foodmarketplace/Header";
import { CategoryProvider } from "../context/CategoryContext";
import StoreList from "../components/foodmarketplace/StoreList";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";

const FoodNavBar = dynamic(() => import("@/app/components/foodmarketplace/NavBar"), {
  ssr: false,
});

export default function FoodMarketPlace() {
  const [searchQuery, setSearchQuery] = useState("");

  // // Function to call the guest login API using axios
  // const guestLogin = async () => {
  //   try {
  //     const response = await axios.post("/user/auth/guest-login", {
  //       domainId: process.env.NEXT_PUBLIC_DOMAIN_ID,
  //       deviceId: process.env.NEXT_PUBLIC_DEVICE_ID,
  //       deviceToken: process.env.NEXT_PUBLIC_DEVICE_TOKEN,
  //     });

  //     console.log("Guest Login Response:", response.data);
  //     // Handle the response data (e.g., store token in localStorage or state)
  //     // Example: localStorage.setItem("guestToken", response.data.token);
  //   } catch (error) {
  //     console.error("Error during guest login:", error.response?.data || error.message);
  //   }
  // };

  // // Call the API when the component mounts
  // useEffect(() => {
  //   guestLogin();
  // }, []); // Empty dependency array ensures it runs once on mount

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