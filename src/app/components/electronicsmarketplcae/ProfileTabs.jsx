"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  UserRound,
  Heart,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const userData = {
  name: "John Doe",
  phone: "+91 9876543210",
  email: "johndoe@example.com",
};

const sections = [
  {
    key: "personal",
    label: "Personal Details",
    icon: <UserRound size={20} className="text-blue-400" />,
    background: "bg-blue-100",
    isDropdown: true,
  },
  {
    key: "favorites",
    label: "Favorites",
    icon: <Heart size={20} className="text-red-400" />,
    background: "bg-red-100",
    route: "/electronicsmarketplace/favorite",
  },
  {
    key: "orders",
    label: "Orders",
    icon: <ShoppingBag size={20} className="text-green-500" />,
    background: "bg-green-100",
    route: "/electronicsmarketplace/order",
  },

];

export default function ProfileTabs() {
  const [active, setActive] = useState(null);
  const router = useRouter();

  const toggle = (section) => {
    if (section.isDropdown) {
      setActive((prev) => (prev === section.key ? null : section.key));
    } else {
      router.push(section.route);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 px-4 py-4">
      {sections.map((section) => (
        <div key={section.key} className="w-full">
          {/* Header Row */}
          <div
            onClick={() => toggle(section)}
            className="w-full flex py-2 px-2 cursor-pointer"
          >
            <div className="w-[20%]">
              <div
                className={`w-fit h-fit p-2 rounded-lg ${section.background}`}
              >
                {section.icon}
              </div>
            </div>
            <div className="flex items-center w-[70%]">
              <p className="text-black font-semibold">{section.label}</p>
            </div>
            <div className="flex items-center justify-center w-[10%]">
              <ChevronRight size={20} color="black" />
            </div>
          </div>

          {/* Dropdown only for personal info */}
          <AnimatePresence>
            {active === section.key && section.isDropdown && (
              <motion.div
                key="section-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-black text-white rounded-lg px-4 py-2 ml-4 mr-2"
              >
                <p>
                  <span className="font-semibold">Name:</span> {userData.name}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {userData.phone}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {userData.email}
                </p>s
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
