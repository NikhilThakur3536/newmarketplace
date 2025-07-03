"use client";

import { useEffect, useState } from "react";
import { useCoupons } from "@/app/context/CouponContext";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const couponColors = ["#FEDDE7", "#E6F3FF", "#FFA699", "#E6FFE6"];
const svgFillColors = ["#FECDD9", "#C7DDFF", "#FFC8C0", "#BBFFB2"];

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
};

const pathVariants = {
  initial: { x: 55, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeInOut" } },
};

export default function CouponList({ totalAmount }) {
  const { coupons, fetchCoupons, loading, error } = useCoupons();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch coupons only on mount or totalAmount change
  useEffect(() => {
    let isMounted = true;
    console.log("CouponList useEffect triggered, totalAmount:", totalAmount, "coupons.length:", coupons.length);
    if (totalAmount > 0 && isMounted) {
      fetchCoupons(totalAmount);
    }
    return () => {
      isMounted = false;
    };
  }, [totalAmount, fetchCoupons]); // Use fetchCoupons as dependency since it's memoized

  // Handle interval separately to avoid render loop
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      console.log("Interval triggered, currentIndex:", currentIndex, "coupons.length:", coupons.length);
      if (isMounted && coupons.length > 0) {
        setCurrentIndex((prevIndex) => (prevIndex === coupons.length - 1 ? 0 : prevIndex + 1));
      }
    }, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coupons.length]); // Only re-run if coupons.length changes

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? (coupons.length || 1) - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === (coupons.length || 1) - 1 ? 0 : prevIndex + 1));
  };

  if (loading) return <p className="text-sm text-gray-600">Loading coupons...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!coupons || coupons.length === 0) return null;

  const currentCoupon = coupons[currentIndex] || {};
  const currentBgColor = couponColors[currentIndex % couponColors.length];
  const currentSvgFillColor = svgFillColors[currentIndex % svgFillColors.length];

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="w-full rounded-xl flex relative px-4 py-4 overflow-hidden"
          style={{ backgroundColor: currentBgColor }}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 600 600"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M 300,600 L 350,470 L 350,290 L 430,390 L 490,350 L 510,210 L 600,100 L 600,580 Q 600 600, 550 595 L300,600"
              fill={currentSvgFillColor}
              variants={pathVariants}
              initial="initial"
              animate="animate"
            />
          </svg>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCoupon.id || currentIndex}
              className="w-[50%] flex flex-col gap-1 z-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold line-clamp-1">
                {currentCoupon.name || "Big Discount"}
              </h2>
              <h3 className="text-2xl font-semibold">
                {currentCoupon.discountAmount || 0}%
              </h3>
              <p className="text-lg">Claim it now !!!!</p>
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="w-[50%] h-[90%] relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/discountPlaceholder.png"
              alt="coupon image"
              className="object-cover"
              fill
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="flex w-full justify-between gap-4 mt-4">
        <button
          onClick={handlePrev}
          className="bg-white/80 border border-gray-200 shadow-md p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="bg-white/80 border border-gray-200 shadow-md p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}