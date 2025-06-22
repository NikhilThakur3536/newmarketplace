"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Search, UserRound } from "lucide-react";
import Image from "next/image";
import { useLocation } from "../../context/LocationContext";

export default function FoodHeader() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="w-full h-[450px] relative">
      {/* Background Image */}
      <div className="z-10 absolute inset-0">
        <Image
          src="/dyanmicstatedishbg.png"
          alt="background"
          fill
          className="object-cover"
        />
      </div>

      {/* Address Section */}
      <div className="relative z-30 p-2 ">
        <div className="flex flex-col w-full justify-between">
          <div className="w-[60%] flex flex-col gap-1 justify-center relative">
            {/* Address Button */}
            <div
              className="flex gap-2 items-center w-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <MapPin color="white" size={20} />
              <span className="text-white font-bold text-xl">
                {selectedLocation?.name || "Home"}
              </span>
              <ChevronDown color="white" />
            </div>

            {/* Full address */}
            <span className="text-white font-semibold ml-1 line-clamp-1 ">
              {selectedLocation?.address || "Full Address Here..."}
            </span>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="z-80 absolute top-full mt-1 left-0 bg-white rounded shadow w-64 max-h-60 overflow-auto">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="font-semibold">{loc.name}</div>
                    <div className="text-sm text-gray-500">{loc.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-20 w-full p-2 max-w-md">
        <div className="flex justify-between items-center w-full">
          <div className="relative w-[85%] bg-white py-2 rounded-lg">
            <input
              type="text"
              placeholder="Search here"
              className="w-full pl-10 outline-none"
            />
            <Search
              className="text-lightpink absolute top-2 left-2"
              size={25}
            />
          </div>
          <div className="flex justify-center items-center ml-2 p-2 bg-lightpink rounded-full">
            <UserRound color="white" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
