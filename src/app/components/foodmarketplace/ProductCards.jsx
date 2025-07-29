"use client";

import Image from "next/image";
import { useProduct } from "@/app/context/ProductContext";
import { motion } from "framer-motion";
import { useEffect } from "react"; // Import useEffect

export default function PopularProductCards() {
  const { popularProducts, fetchPopularProducts, loading, error } = useProduct();

  // Log initial data for debugging
  useEffect(() => {
    // console.log("PopularProductCards mounted, products:", popularProducts);
    // Optionally trigger fetch if not already done by context
    if (!popularProducts.length && !loading) {
      fetchPopularProducts();
    }
  }, [popularProducts, loading, fetchPopularProducts]);

  // Handle loading and error states
  if (loading) return <div>Loading popular products...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!popularProducts.length) return <div>No popular products available</div>;

  // Animation for text to simulate moving along a path
  const textAnimation = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
    },
  };

  return (
    <>
      {popularProducts.map((product) => (
        <motion.div
          key={product.id}
          className="w-[40%] h-52 flex flex-col rounded-lg bg-white flex-shrink-0"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
        >
          <div className="h-[50%] relative rounded-t-lg">
            <Image
              src="/pizza.png" // Replace with dynamic image if available
              className="rounded-t-lg object-cover"
              fill
              alt={product.productLanguages?.[0]?.name || "Food product image"}
            />
          </div>
          <div className="w-full px-1 h-[50%] flex flex-col gap-1 mt-1">
            <motion.h2
              className="text-xs line-clamp-1 font-bold"
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {product.productLanguages?.[0]?.name || product.name || "Unnamed Product"}
            </motion.h2>
            <motion.p
              className="text-[0.4rem] text-gray-400 line-clamp-2"
              variants={textAnimation}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeInOut" }}
              initial="hidden"
              whileInView="visible"
            >
              {product.productLanguages?.[0]?.longDescription || "No description available"}
            </motion.p>
            <div className="flex w-full justify-between">
              <motion.span
                className="font-bold text-xs"
                variants={textAnimation}
                transition={{ duration: 0.4, delay: 0.6, ease: "easeInOut" }}
                initial="hidden"
                whileInView="visible"
              >
                ₹{product.varients?.[0]?.productVarientUoms?.[0]?.inventory?.price || product.price || "N/A"}
              </motion.span>
              <motion.button
                className="w-fit h-fit py-1 px-1 rounded-lg font-bold text-xs text-white bg-rose-400"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6, ease: "easeInOut" }}
              >
                Add
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}