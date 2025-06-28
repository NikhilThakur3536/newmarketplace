"use client";

import Image from "next/image";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper function to slugify text
function slugify(text) {
  return typeof text === "string"
    ? text.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "-")
    : "unknown";
}

export default function RestaurantCard({ name, rating, image, timings, locationName }) {
  const router = useRouter();
  const restaurantSlug = slugify(name);
  const locationSlug = slugify(locationName);
  const path = `/foodmarketplace/${restaurantSlug}/${locationSlug}`;

  const handleClick = () => {
    // Store last visited restaurant path
    if (typeof window !== "undefined") {
      localStorage.setItem("lastRestaurantUrl", path);
    }
    // Navigate to the page
    router.push(path);
  };

  return (
    <div
      className="w-full h-64 flex flex-col bg-white rounded-xl border border-gray-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full h-[90%] overflow-hidden rounded-t-xl">
        <Image
          src={image || "/placeholder.jpg"}
          alt={name || "restaurant"}
          fill
          className="object-cover"
        />
        <div className="absolute bg-white bottom-0 rounded-tr-lg px-2 py-1 transform translate-y-1">
          <div className="flex gap-1 items-center">
            <Timer size={15} color="gray" />
            <span className="text-gray-400 text-md font-light">{timings || "N/A"}</span>
          </div>
        </div>
      </div>
      <div className="bg-white flex flex-col w-full p-2 rounded-b-lg">
        <div className="flex justify-between rounded-b-lg">
          <h2 className="text-black font-bold text-xl">{name || "Restaurant"}</h2>
          <div className="w-fit h-fit px-2 py-1 bg-green-700 text-white font-bold rounded-lg">
            {rating || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}
