"use client";

import { useState, Suspense, useEffect, Component } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useLocation } from "../../context/LocationContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCategories } from "@/app/context/CategoryContext";
import { Skeleton } from "@/app/components/ui/skeleton";
import NewRestaurantCards from "@/app/components/foodmarketplace/NewRestaurantCards";

// Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error in component:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

// Wrapper component to track loading state
const LoadTracker = ({ children, onLoad, name }) => {
  useEffect(() => {
    console.log(`${name} LoadTracker mounted, calling onLoad`);
    onLoad();
  }, [onLoad, name]);
  return <>{children}</>;
};

// Dynamic imports with loading fallbacks
const CouponList = dynamic(() => import("@/app/components/foodmarketplace/CouponList"), {
  loading: () => <Skeleton className="h-32 w-full rounded-xl" />,
  ssr: false,
});
const SelectionwiseProductCards = dynamic(
  () => import("@/app/components/foodmarketplace/SelectionwiseProductCards"),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" />, ssr: false }
);
const PopularProductCards = dynamic(() => import("@/app/components/foodmarketplace/ProductCards"), {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  ssr: false,
});

export default function Home() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const { categories, categoryLoading = false } = useCategories();
  const { languages, loading: languageLoading = false } = useLanguage();
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
  const [componentLoading, setComponentLoading] = useState({
    couponList: true,
    selectionCards: true,
    popularCards: true,
  });
  const router = useRouter();

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.id);
    localStorage.setItem("selectedLanguage", language.id);
    setLanguageDropdownOpen(false);
  };

 const handleComponentLoad = (component) => {
  console.log(`${component} loaded, updating componentLoading`);
  setComponentLoading((prev) => {
    if (prev[component]) {
      const newState = { ...prev, [component]: false };
      console.log("New componentLoading:", newState);
      return newState;
    }
    return prev; 
  });
};

  useEffect(() => {
    console.log("componentLoading:", componentLoading);
    console.log("categoryLoading:", categoryLoading, "languageLoading:", languageLoading);
  }, [componentLoading, categoryLoading, languageLoading]);

  const isLoading =
    (categoryLoading || false) ||
    (languageLoading || false) ||
    componentLoading.couponList ||
    componentLoading.selectionCards ||
    componentLoading.popularCards;
  console.log("isLoading:", isLoading);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("Forcing componentLoading to false due to timeout");
      setComponentLoading({
        couponList: false,
        selectionCards: false,
        popularCards: false,
      });
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center bg-black">
        <div className="max-w-md w-full px-4 pt-4 bg-white flex flex-col gap-4">
          {/* Header Skeleton */}
          <div className="w-full flex items-center justify-between">
            <div className="w-[60%] flex flex-col gap-2">
              <Skeleton className="h-8 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          {/* Title Skeleton */}
          <Skeleton className="h-10 w-[65%] rounded" />
          {/* Search Bar Skeleton */}
          <Skeleton className="h-12 w-full rounded-xl" />
          {/* Coupon Section Skeleton */}
          <Skeleton className="h-32 w-full rounded-xl" />
          {/* Category Title Skeleton */}
          <Skeleton className="h-6 w-1/4 rounded" />
          {/* Categories Skeleton */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-24 rounded-2xl" />
            ))}
          </div>
          {/* Selection Cards Skeleton */}
          <Skeleton className="h-48 w-full rounded-xl" />
          {/* Popular Items Title Skeleton */}
          <Skeleton className="h-6 w-1/4 rounded" />
          {/* Popular Items Skeleton */}
          <div className="flex gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-64 w-40 rounded-xl" />
            ))}
          </div>
          {/* Restaurants Title Skeleton */}
          <Skeleton className="h-6 w-1/4 rounded" />
          {/* Restaurants Skeleton */}
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
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
        {/* Wrap dynamic components in Suspense with LoadTracker */}
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
          <ErrorBoundary>
            <LoadTracker name="CouponList" onLoad={() => handleComponentLoad("couponList")}>
              <CouponList totalAmount={500} />
            </LoadTracker>
          </ErrorBoundary>
        </Suspense>
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
                <Image src="/burger.png" alt="placeholder" fill className="object-cover rounded-full" />
              </div>
              <h3 className="font-bold">{cat.code}</h3>
            </motion.div>
          ))}
        </div>
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
          <ErrorBoundary>
            <LoadTracker name="SelectionwiseProductCards" onLoad={() => handleComponentLoad("selectionCards")}>
              <SelectionwiseProductCards selectedCategoryId={selectedCategory} />
            </LoadTracker>
          </ErrorBoundary>
        </Suspense>
        <h1 className="font-bold text-xl">Popular Items</h1>
        <div className="w-full overflow-x-scroll gap-4 flex overflow-y-hidden scrollbar-hidden px-4">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <ErrorBoundary>
              <LoadTracker name="PopularProductCards" onLoad={() => handleComponentLoad("popularCards")}>
                <PopularProductCards />
              </LoadTracker>
            </ErrorBoundary>
          </Suspense>
        </div>
        <h1 className="font-bold text-xl">Restaurants</h1>
        <NewRestaurantCards searchQuery={searchQuery} />
      </div>
    </div>
  );
}