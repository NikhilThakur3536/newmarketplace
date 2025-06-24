"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Grid3X3, Heart, User } from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", path: "/electronicsmarketplace" },
    { icon: Grid3X3, label: "Categories", path: "/electronicsmarketplace/categories" },
    { icon: Heart, label: "Favorites", path: "/electronicsmarketplace/favorites" },
    { icon: User, label: "Profile", path: "/electronicsmarketplace/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={label}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-blue-500" : ""}`} />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
