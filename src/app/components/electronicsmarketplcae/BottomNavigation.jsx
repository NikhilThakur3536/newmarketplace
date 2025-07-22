"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Heart, ShoppingCart, ClipboardList, MessageCircleMore } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/electronicsmarketplace" },
    { icon: ClipboardList, label: "Orders", path: "/electronicsmarketplace/order" },
    { icon: ShoppingCart, label: "Cart", path: "/electronicsmarketplace/cart" },
    { icon: Heart, label: "Favorites", path: "/electronicsmarketplace/favorite" },
    { icon: MessageCircleMore, label: "Chats", path: "/electronicsmarketplace/chats" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          const isCart = label === "Cart";

          return (
            <button
              key={label}
              onClick={() => router.push(path)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-blue-500" : ""}`} />

              {isClient && isCart && typeof cartCount === "number" && cartCount > 0 && (
                <span className="absolute -top-1.5 right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5">
                  {cartCount}
                </span>
              )}

              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}