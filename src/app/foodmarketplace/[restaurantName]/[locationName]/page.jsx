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
} from "lucide-react";
import FoodItemCard from "@/app/components/foodmarketplace/FoodItemCard";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const lang= localStorage.getItem("selectedLanguage")

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

        // console.log("restaurantName from URL:", restaurantName);
        // console.log("locationName from URL:", locationName);

        const matchedStore = stores.find((store) => {
          const slugName = store.name.toLowerCase().replace(/\s+/g, "-");
          const slugLocationName = store.location?.name?.toLowerCase().replace(/\s+/g, "-");
          const slugLocationAddress = store.location?.address?.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-");

          // console.log("Checking store:", slugName, slugLocationName, slugLocationAddress);

          return (
            slugName === restaurantName.toLowerCase() &&
            (
              locationName.toLowerCase().includes(slugLocationName) ||
              locationName.toLowerCase().includes(slugLocationAddress)
            )
          );
        });

        if (!matchedStore) {
          alert("No matching store found!");
          console.warn("Store not matched for:", restaurantName, locationName);
          return;
        }

        const storeId = matchedStore.id;

        // Build payload conditionally
        const payload = {
          limit: 4000,
          offset: 0,
          storeId,
          languageId: lang,
        };

        // Only include searchKey if searchQuery is not empty
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
          // console.log("items structured",res.data.data.rows)
          const structured = formatCategories(res.data.data.rows);
          setCategoriesData(structured);
          const initialExpanded = Object.keys(structured).reduce((acc, cat) => {
            acc[cat] = true;
            return acc;
          }, {});
          // console.log("initial expanded",initialExpanded)
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

  return (
    <MenuContext.Provider value={{ categoriesData, expandedCategories }}>
      <div className="flex justify-center min-h-screen overflow-x-hidden">
        <div className="max-w-md w-full flex flex-col relative bg-white min-h-screen overflow-x-hidden">
          {/* Header */}
          <div className="fixed w-full max-w-md px-4 flex gap-4 py-3 bg-lightpink items-center z-30">
            <ChevronLeft size={20} strokeWidth={3} className="text-white" onClick={() => router.push("/foodmarketplace")} />
            <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
              {unslugify(restaurantName)}
            </span>
          </div>

          {/* Info */}
          <div className="w-full max-w-md bg-lightpink px-2 flex justify-between pt-16">
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
          <hr className="border-0 bg-gray-300 h-2 w-full" />
          <div className="w-full h-fit flex items-center p-2">
            <div className="w-fit h-fit px-2 py-1 flex items-center justify-center gap-1 border border-gray-200 rounded-lg">
              <SlidersHorizontal size={15} color="black" />
              <p className="text-black text-sm font-medium">Filters</p>
              <ChevronDown size={15} color="black" />
            </div>
          </div>
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
        </div>
      </div>
    </MenuContext.Provider>
  );
}