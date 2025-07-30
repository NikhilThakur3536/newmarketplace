"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  ChevronDown,
  ChevronLeft,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  MessageCircle,
  X,
} from "lucide-react";
import FoodItemCard from "@/app/components/foodmarketplace/FoodItemCard";
import { useCart } from "@/app/context/CartContext";
import { useChat } from "@/app/context/ChatContext";
import MobileChatUI from "@/app/components/foodmarketplace/ChatInterface";
import BreadcrumbContext from "@/app/context/BreadCrumbContext";
import Link from "next/link";
import BreadCrumbs from "@/app/components/foodmarketplace/BreadCrumbs";

const MenuContext = createContext();

export function useMenu() {
  return useContext(MenuContext);
}

function formatCategories(products) {
  const categoriesMap = {};
  products.forEach((product) => {
    const category = product.category?.categoryLanguages?.[0]?.name || "Other";
    if (!categoriesMap[category]) categoriesMap[category] = [];
    categoriesMap[category].push(product);
  });
  return categoriesMap;
}

function unslugify(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function RestaurantPage() {
  const { restaurantName, locationName } = useParams();
  const [categoriesData, setCategoriesData] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { initiateChat } = useChat();
  const [storeId, setStoreId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Access breadcrumbs from BreadcrumbContext
  const { breadcrumbs } = useContext(BreadcrumbContext);

  useEffect(() => {
    setIsMounted(true); // Set to true after component mounts on client
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const lang = localStorage.getItem("selectedLanguage");

    async function fetchMenu() {
      try {
        const storeRes = await axios.post(
          `${BASE_URL}/user/store/list`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const stores = storeRes.data.data.rows;

        const matchedStore = stores.find((store) => {
          const slugName = store.name.toLowerCase().replace(/\s+/g, "-");
          const slugLocationName = store.location?.name
            ?.toLowerCase()
            .replace(/\s+/g, "-");
          const slugLocationAddress = store.location?.address
            ?.toLowerCase()
            .replace(/,/g, "")
            .replace(/\s+/g, "-");

          return (
            slugName === restaurantName.toLowerCase() &&
            (locationName.toLowerCase().includes(slugLocationName) ||
              locationName.toLowerCase().includes(slugLocationAddress))
          );
        });

        if (!matchedStore) {
          alert("No matching store found!");
          console.warn("Store not matched for:", restaurantName, locationName);
          return;
        }

        setStoreId(matchedStore.id);

        const payload = {
          limit: 4000,
          offset: 0,
          storeId: matchedStore.id,
          languageId: lang || "2bfa9d89-61c4-401e-aae3-346627460558",
        };

        if (searchQuery.trim() !== "") {
          payload.searchKey = searchQuery;
        }

        const res = await axios.post(
          `${BASE_URL}/user/product/listv1`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          const structured = formatCategories(res.data.data.rows);
          setCategoriesData(structured);
          const initialExpanded = Object.keys(structured).reduce((acc, cat) => {
            acc[cat] = true;
            return acc;
          }, {});
          setExpandedCategories(initialExpanded);
        } else {
          console.warn("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error loading menu:", error);
      }
    }

    if (restaurantName && locationName) fetchMenu();
  }, [restaurantName, locationName, searchQuery]);

  function toggleCategory(cat) {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }

  const handleChatClick = async () => {
    if (!storeId) {
      alert("Store not found. Please try again.");
      return;
    }

    const products = Object.values(categoriesData).flat();
    const productId = products.length > 0 ? products[0].id : null;

    try {
      const newChatId = await initiateChat(storeId);
      if (newChatId) {
        setChatId(newChatId);
        setShowChat(true);
      } else {
        console.error("api not triggered");
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  return (
    <MenuContext.Provider value={{ categoriesData, expandedCategories }}>
      <div className="flex justify-center min-h-screen overflow-x-hidden">
        <div className="max-w-md w-full flex flex-col relative bg-white min-h-screen overflow-x-hidden">
          <BreadCrumbs />
          {/* Header (non-fixed) */}
          <div className="w-full max-w-md px-4 flex gap-4 py-3 bg-lightpink items-center justify-between">
            <div className="flex items-center gap-4">
              <ChevronLeft
                size={20}
                strokeWidth={3}
                className="text-white"
                onClick={() => window.history.back()}
              />
              <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                {unslugify(restaurantName)}
              </span>
            </div>
            <button
              onClick={() => (window.location.href = "/foodmarketplace/cart")}
              className="relative flex items items-center"
            >
              <ShoppingCart size={20} strokeWidth={2} className="text-white" />
              {isMounted && cartCount > 0 && ( // Render badge only on client
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          {/* Info */}
          <div className="w-full max-w-md bg-lightpink px-2 flex justify-between pt-2">
            <div className="flex flex-col gap-1 mb-2">
              <h2 className="font-bold text-2xl text-white">
                {unslugify(restaurantName)}
              </h2>
              <div className="flex gap-1 items-center">
                <MapPin color="white" size={15} />
                <span className="text-white">{unslugify(locationName)}</span>
                <ChevronDown color="white" size={20} />
              </div>
              <div className="flex gap-1 items-center">
                <Clock color="white" size={15} />
                <span className="text-white">Delivery Time</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <div className="w-fit h-fit p-2 bg-black text-white rounded-xl font-bold text-[0.6rem]">
                ₹ Price for two
              </div>
            </div>
          </div>

          {/* Filters */}
          {/* <hr className="border-0 bg-gray-300 h-2 w-full" />
          <div className="w-full h-fit flex items-center p-2">
            <div className="w-fit h-fit px-2 py-1 flex items-center justify-center gap-1 border border-gray-200 rounded-lg">
              <SlidersHorizontal size={15} color="black" />
              <p className="text-black text-sm font-medium">Filters</p>
              <ChevronDown size={15} color="black" />
            </div>
          </div> */}
          <hr className="border-0 bg-gray-200 h-0.5 w-full" />

          {/* Menu */}
          <div className="p-4 flex flex-col w-full max-w-md overflow-x-hidden mb-12 gap-4">
            {Object.entries(categoriesData).map(([cat, items]) => (
              <div key={cat} className="rounded-lg overflow-hidden dropshadow-md">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full max-w-md px-4 py-2 bg-gray-100 text-left font-medium text-lg flex justify-between items-center"
                >
                  {cat}
                  <ChevronDown color="black" size={20} />
                </button>
                <hr className="h-2 border-0 bg-gray-400" />
                {expandedCategories[cat] && (
                  <div className="p-2 flex flex-col gap-2">
                    {items.map((item) => (
                      <FoodItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="fixed bottom-0 w-full max-w-md flex gap-2 bg-white p-2 items-center shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.2)]">
            <input
              type="text"
              placeholder="Search"
              className="rounded-lg border border-lightpink w-full pl-8 p-2 bg-blue-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="text-lightpink absolute ml-2" size={20} />
          </div>

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className="fixed bottom-16 bg-lightpink text-white rounded-full p-3 shadow-lg hover:bg-[#E72068] transition-colors duration-200 z-40"
            style={{ right: "calc((100% - 28rem) / 2 + 1rem)" }}
            title="Chat with restaurant"
          >
            <MessageCircle size={24} />
          </button>

          {/* Chat Modal */}
          {showChat && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                <button
                  onClick={() => setShowChat(false)}
                  className="absolute top-6 bg-lightpink/30 rounded-full w-fit h-fit p-1 right-4 text-slate-600 hover:text-slate-900 z-50"
                >
                  <X size={24} color="white" />
                </button>
                <MobileChatUI chatId={chatId} participantId={storeId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MenuContext.Provider>
  );
}