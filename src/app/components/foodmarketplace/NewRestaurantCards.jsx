"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation } from "../../context/LocationContext";
import Image from "next/image";
import { Star, MapPin, Timer, Truck } from "lucide-react";

export default function NewRestaurantCards({ searchQuery }) {
  const { selectedLocation } = useLocation();
  const [stores, setStores] = useState([]);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const formatStoreTiming = (openingTime, closingTime) => {
    if (!openingTime || !closingTime) return "Timing not available";

    try {
      const open = dayjs(`1970-01-01T${openingTime}`).format("h:mm A");
      const close = dayjs(`1970-01-01T${closingTime}`).format("h:mm A");
      return `${open} - ${close}`;
    } catch {
      return "Timing not available";
    }
  };

useEffect(() => {
  const token = localStorage.getItem("token");
  async function fetchStores() {
    if (!selectedLocation?.id) return;

    try {
      const payload = {
        limit: 4,
        offset: 0,
        locationId: selectedLocation.id,
      };

      if (searchQuery && searchQuery.trim() !== "") {
        payload.searchKey = searchQuery;
      }

      const response = await axios.post(
        `${BASE_URL}/user/store/list`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setStores(response.data.data.rows);
      }
    } catch (error) {
      console.error("Failed to fetch stores", error);
    }
  }

  fetchStores();
}, [selectedLocation, BASE_URL, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-4 rounded-lg mt-2 mb-4">
      {stores.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No stores found for this location.
        </p>
      ) : (
        stores.map((store) => (
          <div
            key={store.id}
            className="w-full rounded-lg flex gap-2 h-44 bg-white shadow-md"
          >
            <div className="w-[40%] relative h-full rounded-lg">
              <Image
                src={store.coverImage || "/placeholder.jpg"}
                alt={store.name}
                fill
                className="object-center rounded-tl-lg rounded-bl-lg"
              />
            </div>
            <div className="flex flex-col gap-1 w-[60%]">
              <div className="flex w-full justify-between">  
                <h1 className="font-bold text-sm">{store.name}</h1>
                <div className="w-fit h-fit p-1 font-bold text-[0.6rem] bg-[#FF89A6] rounded-lg text-white flex item-center">
                    Cost for 2: ₹{store.costForTwo}
                </div>
              </div>  
              <div className="flex gap-4">
                <div className="flex gap-1 items-center">
                  <Star stroke="none" fill="#FFCF54" size={15} />
                  <span className="text-[0.6rem] text-gray-400">
                    {store.ratings || "3.8"} ({store.reviewCount || 100} reviews)
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <MapPin stroke="none" fill="#EE6416" size={15} />
                  <span className="text-[0.6rem] text-gray-400">
                    {store.distance || "N/A"}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-[0.3rem]">
                {store.address || "Full Description"}
              </p>
              <div className="flex gap-2 items-center">
                <Timer size={15} color="#64C058" />
                <span className="font-medium text-sm text-gray-500">
                  {formatStoreTiming(store.openingTime, store.closingTime)}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Truck size={15} color="#64C058" />
                <span className="font-medium text-sm text-gray-500">
                  Free delivery. 25 - 35 min
                </span>
              </div>
              <button className="w-fit h-fit px-2 py-1 text-white font-bold text-xl bg-[#86B6FD] rounded-lg mt-2">
                Order Now
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}