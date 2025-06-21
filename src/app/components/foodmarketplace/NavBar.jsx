"use client";

import { motion } from "framer-motion";
import { ClipboardList, MapPin, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function FoodNavBar() {
  const [activeIndex, setActiveIndex] = useState(null);

  const icons = [
    {
      key: "home",
      svg: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 18 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.74668e-08 7.99948C-6.96807e-05 7.70855 0.0633338 7.4211 0.185788 7.1572C0.308242 6.89329 0.486798 6.65928 0.709 6.47148L7.709 0.47248C8.06999 0.167388 8.52736 0 9 0C9.47264 0 9.93001 0.167388 10.291 0.47248L17.291 6.47148C17.5132 6.65928 17.6918 6.89329 17.8142 7.1572C17.9367 7.4211 18.0001 7.70855 18 7.99948V16.9995C18 17.5299 17.7893 18.0386 17.4142 18.4137C17.0391 18.7888 16.5304 18.9995 16 18.9995H2C1.46957 18.9995 0.960859 18.7888 0.585786 18.4137C0.210714 18.0386 5.74668e-08 17.5299 5.74668e-08 16.9995V7.99948Z"
            fill={activeIndex === 0 ? "white" : "#E72068"}
          />
          <circle
            cx="9"
            cy="16"
            r="1"
            fill={activeIndex === 0 ? "#E72068" : "white"}
          />
        </svg>
      ),
    },
    {
      key: "heart",
      svg: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 11C18.49 9.54 20 7.79 20 5.5C20 4.04131 19.4205 2.64236 18.3891 1.61091C17.3576 0.579463 15.9587 0 14.5 0C12.74 0 11.5 0.5 10 2C8.5 0.5 7.26 0 5.5 0C4.04131 0 2.64236 0.579463 1.61091 1.61091C0.579463 2.64236 0 4.04131 0 5.5C0 7.8 1.5 9.55 3 11C3 11 6.75019 15.5 10 15.5C13.2498 15.5 17 11 17 11Z"
            fill={activeIndex === 1 ? "white" : "#E72068"}
          />
        </svg>
      ),
    },
    {
      key: "location",
      svg: (
        <MapPin
          stroke={activeIndex === 2 ? "#E72068" : "white"}
          size={30}
          fill={activeIndex === 2 ? "white" : "#E72068"}
        />
      ),
    },
    {
      key: "cart",
      svg: (
        <ShoppingCart
          size={30}
          fill={activeIndex === 3 ? "white" : "#E72068"}
          color={activeIndex === 3 ? "white" : "#E72068"}
        />
      ),
    },
     {
      key: "orders",
      svg: (
        <ClipboardList
          size={34}
          fill={activeIndex === 4 ? "white" : "#E72068"}
          stroke={activeIndex === 4 ? "#E72068" : "white"}
        />
      ),
    },
  ];

  return (
    <div className="w-full bg-white h-fit py-1 flex items-center justify-around sticky">
      {icons.map((icon, index) => {
        const isActive = activeIndex === index;

        return (
          <motion.div
            key={icon.key}
            animate={isActive ? { y: -30 } : { y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() =>
              setActiveIndex((prev) => (prev === index ? null : index))
            }
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
              {icon.svg}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
