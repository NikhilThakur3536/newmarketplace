"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation } from "../../context/LocationContext";
import RestaurantCard from "./RestaurantCard";

export default function StoreList() {
  const { selectedLocation } = useLocation();
  const [stores, setStores] = useState([]);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // 🛠 Properly format time-only strings by adding dummy date
  const formatStoreTiming = (openingTime, closingTime) => {
    if (!openingTime || !closingTime) return "Timing not available";

    try {
      const open = dayjs(`1970-01-01T${openingTime}`).format("h:mm A");
      const close = dayjs(`1970-01-01T${closingTime}`).format("h:mm A");
      return `${open} – ${close}`;
    } catch {
      return "Timing not available";
    }
  };

  useEffect(() => {
    const token=localStorage.getItem("token")
    async function fetchStores() {
      if (!selectedLocation?.id) return;

      try {
        const response = await axios.post(
          `${BASE_URL}/user/store/list`,
          {
            limit: 4,
            offset: 0,
            locationId: selectedLocation.id,
          },
          {
            headers:{
                Authorization: `Bearer ${token}`,
            }
          }
        );
        console.log(response.data.data.rows)
        if (response.data.success) {
          setStores(response.data.data.rows);
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    }

    fetchStores();
  }, [selectedLocation, BASE_URL]);

  return (
    <div className="w-full flex flex-col gap-4 px-4">
      {stores.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No stores found for this location.
        </p>
      ) : (
        stores.map((store) => (
          <RestaurantCard
            key={store.id}
            name={store.name}
            rating={store.ratings || "3.8"}
            image={store.coverImage || "/placeholder.jpg"}
            timings={formatStoreTiming(store.openingTime, store.closingTime)}
            locationName={store.address}
          />
        ))
      )}
    </div>
  );
}
