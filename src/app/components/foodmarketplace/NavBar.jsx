"use client";

import { motion } from "framer-motion";
import { ClipboardList, MapPin, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

export default function FoodNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, fetchCartItems, isLoading } = useCart();

  useEffect(() => {
    console.log("FoodNavBar mounted, fetching cart items");
    fetchCartItems(); // Fetch on mount to ensure latest cartCount
  }, [fetchCartItems]);

  useEffect(() => {
    const handleCartUpdate = (e) => {
      if (e.detail?.marketplace === "foodmarketplace") {
        console.log("cart-updated event received, cartCount:", cartCount);
        fetchCartItems();
      }
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [fetchCartItems]); // Removed cartCount from dependencies

  useEffect(() => {
    console.log("cartCount updated:", cartCount); // Debug cartCount changes
  }, [cartCount]);

  const icons = useMemo(
    () => [
      {
        key: "home",
        path: "/foodmarketplace",
        svg: (isActive) => (
          <svg
            width="28"
            height="28"
            viewBox="0 0 18 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 7.99948C0 7.70855 0.0633338 7.4211 0.185788 7.1572C0.308242 6.89329 0.486798 6.65928 0.709 6.47148L7.709 0.47248C8.07 0.167388 8.52736 0 9 0C9.47264 0 9.93 0.167388 10.291 0.47248L17.291 6.47148C17.5132 6.65928 17.6918 6.89329 17.8142 7.1572C17.9367 7.4211 18 7.70855 18 7.99948V16.9995C18 17.5299 17.7893 18.0386 17.4142 18.4137C17.0391 18.7888 16.5304 18.9995 16 18.9995H2C1.46957 18.9995 0.960859 18.7888 0.585786 18.4137C0.210714 18.0386 0 17.5299 0 16.9995V7.99948Z"
              fill={isActive ? "white" : "#E72068"}
            />
            <circle cx="9" cy="16" r="1" fill={isActive ? "#E72068" : "white"} />
          </svg>
        ),
      },
      {
        key: "heart",
        path: "/foodmarketplace/favorites",
        svg: (isActive) => (
          <svg
            width="28"
            height="28"
            viewBox="0 0 20 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 11C18.49 9.54 20 7.79 20 5.5C20 4.04131 19.4205 2.64236 18.3891 1.61091C17.3576 0.579463 15.9587 0 14.5 0C12.74 0 11.5 0.5 10 2C8.5 0.5 7.26 0 5.5 0C4.04131 0 2.64236 0.579463 1.61091 1.61091C0.579463 2.64236 0 4.04131 0 5.5C0 7.8 1.5 9.55 3 11C3 11 6.75019 15.5 10 15.5C13.2498 15.5 17 11 17 11Z"
              fill={isActive ? "white" : "#E72068"}
            />
          </svg>
        ),
      },
      {
        key: "location",
        path: "/foodmarketplace/address",
        svg: (isActive) => (
          <MapPin
            stroke={isActive ? "#E72068" : "white"}
            size={30}
            fill={isActive ? "white" : "#E72068"}
          />
        ),
      },
      {
        key: "cart",
        path: "/foodmarketplace/cart",
        svg: (isActive) => (
          <div className="relative">
            <ShoppingCart
              size={30}
              fill={isActive ? "white" : "#E72068"}
              color={isActive ? "white" : "#E72068"}
            />
            {cartCount > 0 && !isLoading && (
              <span
                className="absolute -top-2 -right-2 bg-lightpink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                data-testid="cart-count"
              >
                {cartCount}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "orders",
        path: "/foodmarketplace/orders",
        svg: (isActive) => (
          <ClipboardList
            size={34}
            fill={isActive ? "white" : "#E72068"}
            stroke={isActive ? "#E72068" : "white"}
          />
        ),
      },
    ],
    [cartCount, isLoading] // Added cartCount and isLoading as dependencies
  );

  return (
    <div className="w-full bg-white h-fit py-1 flex items-center justify-around sticky">
      {icons.map((icon) => {
        const isActive =
          icon.key === "home"
            ? pathname === icon.path
            : pathname.startsWith(icon.path);

        return (
          <motion.div
            key={icon.key}
            animate={isActive ? { y: -30 } : { y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => router.push(icon.path)}
          >
            <motion.div
              animate={{
                boxShadow: isActive
                  ? "0px 8px 20px #E72068"
                  : "0px 0px 0px rgba(0,0,0,0)",
              }}
              transition={{ ease: "easeInOut" }}
              className={`w-fit h-fit flex items-center justify-center p-2 rounded-full ${
                isActive ? "bg-lightpink" : "bg-transparent"
              }`}
            >
              {icon.svg(isActive)}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}