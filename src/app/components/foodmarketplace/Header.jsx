"use client";

import { useState } from "react";
import { ChevronDown, MapPin, UserRound, Globe } from "lucide-react";
import Image from "next/image";
import { useLocation } from "../../context/LocationContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function FoodHeader() {
  const { locations, selectedLocation, setSelectedLocation } = useLocation();
  const { languages, loading, error } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLanguage") || null;
    }
    return null;
  });
  const router = useRouter();

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.id);
    localStorage.setItem("selectedLanguage", language.id);
    setLanguageDropdownOpen(false);
  };

  return (
    <div className="w-full relative min-h-[450px]">
      {/* Breadcrumb Section */}
      {/* <Breadcrumbs /> */}

      {/* Background Image */}
      <div className="z-10 absolute inset-0 h-[450px]">
        <Image
          src="/dyanmicstatedishbg.png"
          alt="background"
          fill
          className="object-cover"
        />
      </div>

      {/* Address and Icons Section */}
      <div className="relative z-30 p-2 flex w-full max-w-md justify-between items-start">
        <div className="flex flex-col w-full justify-between">
          <div className="w-[60%] flex flex-col gap-1 justify-center relative">
            <div
              className="flex gap-2 items-center w-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <MapPin color="white" size={20} />
              <span className="text-white font-bold text-xl line-clamp-1">
                {selectedLocation?.name || "Home"}
              </span>
              <ChevronDown color="white" />
            </div>
            <span className="text-white font-semibold ml-1 line-clamp-1">
              {selectedLocation?.address || "Full Address Here..."}
            </span>
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
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div
              className="p-2 bg-lightpink rounded-full w-fit h-fit cursor-pointer"
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            >
              <Globe color="white" size={20} />
            </div>
            {languageDropdownOpen && (
              <div className="z-[80] absolute top-full mt-1 right-0 bg-white rounded shadow w-48 max-h-60 overflow-auto">
                {loading ? (
                  <div className="px-4 py-2 text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="px-4 py-2 text-red-500">{error}</div>
                ) : languages.length > 0 ? (
                  languages.map((lang) => (
                    <div
                      key={lang.id}
                      className={`px-4 py-2 hover:bg-gray-200 cursor-pointer text-black ${
                        selectedLanguage === lang.id ? "bg-gray-100 font-medium" : ""
                      }`}
                      onClick={() => handleLanguageSelect(lang)}
                    >
                      {lang.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No languages available</div>
                )}
              </div>
            )}
          </div>
          <div
            className="p-2 bg-lightpink rounded-full w-fit h-fit cursor-pointer"
            onClick={() => router.push("/foodmarketplace/profile")}
          >
            <UserRound color="white" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}