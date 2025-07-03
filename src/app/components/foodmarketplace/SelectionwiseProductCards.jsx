"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SelectionwiseProductCards({ selectedCategoryId }) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = {
          limit: 10,
          offset: 0,
          languageId: "2bfa9d89-61c4-401e-aae3-346627460558",
          ...(selectedCategoryId && { categoryIds: [selectedCategoryId] }),
        };

        const response = await axios.post(
          `${BASE_URL}/user/product/listv1`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCategoryProducts(response.data?.data?.rows || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategoryId]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? categoryProducts.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === categoryProducts.length - 1 ? 0 : prev + 1
    );
  };

  if (!categoryProducts || categoryProducts.length === 0) {
    return <div>Loading...</div>;
  }

  const prevIndex =
    currentIndex === 0 ? categoryProducts.length - 1 : currentIndex - 1;
  const nextIndex =
    currentIndex === categoryProducts.length - 1 ? 0 : currentIndex + 1;

  const cardVariants = {
    left: {
      x: "-25%",
      scale: 0.8,
      opacity: 0.7,
      zIndex: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    center: {
      x: "0%",
      scale: 1,
      opacity: 1,
      zIndex: 2,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    right: {
      x: "25%",
      scale: 0.8,
      opacity: 0.7,
      zIndex: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: (direction) => ({
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <div className="w-full flex justify-center items-center gap-4 overflow-hidden mt-2 relative">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        {/* Left Card */}
        <motion.div
          key={`${prevIndex}-left`}
          className="w-[30%] h-48 rounded-lg flex flex-col relative"
          variants={cardVariants}
          initial="left"
          animate="left"
          exit="exit"
          custom={direction}
        >
          <div className="h-[60%] w-full rounded-t-lg relative">
            <Image
              src="/bagel.png"
              alt="product image"
              fill
              className="object-cover rounded-t-lg"
            />
            <button
              onClick={handlePrev}
              className="absolute top-10 left-2 p-2 bg-black rounded-full shadow-md"
            >
              <ChevronLeft size={20} color="white" />
            </button>
          </div>
          <div className="h-[40%] w-full px-2 py-1 flex flex-col gap-1 bg-gray-100 rounded-b-lg">
            <span className="text-[0.7rem] font-medium">
              {categoryProducts[prevIndex].productLanguages?.[0]?.name}
            </span>
            <p className="text-[0.4rem] text-gray-400">
                {categoryProducts[prevIndex].productLanguages?.[0]?.longDescription}
            </p>
            <div className="w-full flex justify-between">
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm font-bold">
                    ₹{categoryProducts[prevIndex].varients?.[0]?.productVarientUoms?.[0]?.inventory?.price}
                </span>
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm bg-rose-200"> Add</span>
            </div>
          </div>
        </motion.div>

        {/* Center Card */}
        <motion.div
          key={`${currentIndex}-center`}
          className="w-[40%] h-56 rounded-lg flex flex-col relative overflow-hidden"
          variants={cardVariants}
          initial="center"
          animate="center"
          exit="exit"
          custom={direction}
        >
          <div className="h-[60%] w-full rounded-t-lg relative">
            <Image
              src="/bagel.png"
              alt="product image"
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <div className="h-[40%] w-full px-2 py-1 flex flex-col gap-1 bg-gray-100/50 rounded-b-lg ">
            <span className="text-[0.7rem] font-semibold">
              {categoryProducts[currentIndex].productLanguages?.[0]?.name}
            </span>
            <p className="text-[0.4rem] text-gray-400 line-clamp-2">
                {categoryProducts[currentIndex].productLanguages?.[0]?.longDescription}
            </p>
            <div className="w-full flex justify-between">
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm font-bold">
                    ₹{categoryProducts[currentIndex].varients?.[0]?.productVarientUoms?.[0]?.inventory?.price}
                </span>
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm bg-rose-200"> Add</span>
            </div>    
          </div>
        </motion.div>

        {/* Right Card */}
        <motion.div
          key={`${nextIndex}-right`}
          className="w-[30%] h-48 rounded-lg flex flex-col relative"
          variants={cardVariants}
          initial="right"
          animate="right"
          exit="exit"
          custom={direction}
        >
          <div className="h-[60%] w-full rounded-t-lg relative">
            <Image
              src="/bagel.png"
              alt="product image"
              fill
              className="object-cover rounded-t-lg"
            />
            <button
              onClick={handleNext}
              className="absolute top-10 right-2 p-2 bg-black rounded-full shadow-md"
            >
              <ChevronRight size={20} color="white" />
            </button>
          </div>
          <div className="h-[40%] w-full px-2 py-1 flex flex-col gap-1 bg-gray-100 rounded-b-lg">
            <span className="text-[0.7rem] font-medium">
              {categoryProducts[nextIndex].productLanguages?.[0]?.name}
            </span>
            <p className="text-[0.4rem] text-gray-400">
                {categoryProducts[nextIndex].productLanguages?.[0]?.longDescription}
            </p>
            <div className="w-full flex justify-between">
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm font-bold">
                    ₹{categoryProducts[nextIndex].varients?.[0]?.productVarientUoms?.[0]?.inventory?.price}
                </span>
                <span className="text-[0.5rem] w-fit h-fit py-0.5 px-2 rounded-sm bg-rose-200"> Add</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}