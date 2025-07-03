"use client";

import Image from "next/image";
import { useProduct } from "@/app/context/ProductContext";
import { useEffect } from "react";

export default function PopularProductCards() {
  const { popularProducts, fetchPopularProducts, loading, error } = useProduct();

  
//   useEffect(() => {
//     fetchPopularProducts();
//   }, []);
  

  console.log("Popular food products:", popularProducts);

  // Handle loading and error states
  if (loading) return <div>Loading popular products...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!popularProducts.length) return <div>No popular products available</div>;

  return (
    <>
      {popularProducts.map((product) => (
        <div key={product.id} className="h-52 flex flex-col rounded-lg  bg-gray-100 ">
          <div className="h-[50%] relative rounded-t-lg">
            <Image
              src={product.image || "/placeholder.jpg"}
              className="rounded-t-lg object-cover"
              fill
              alt="Food product image"
            />
          </div>
          <div className="w-full px-1 h-[50%] flex flex-col gap-1 mt-1">
            <h2 className="text-xs line-clamp-1 font-bold">
              {product.productLanguages?.[0]?.name || product.name || "Unnamed Product"}
            </h2>
            <p className="text-[0.4rem] text-gray-400 line-clamp-2">
              {product.productLanguages?.[0]?.longDescription || "No description available"}
            </p>
            <div className="flex w-full justify-between">
              <span className="font-bold text-xs">
                ₹{product.varients?.[0]?.productVarientUoms?.[0]?.inventory?.price || product.price || "N/A"}
              </span>
              <button className="w-fit h-fit py-1 px-1 rounded-lg font-bold text-xs text-white bg-[#FEDDE7]">
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}