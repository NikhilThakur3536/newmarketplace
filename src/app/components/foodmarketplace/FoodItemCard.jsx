"use client";

import { Plus, Minus, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/context/CartContext"; 
import toast from "react-hot-toast";
import { useFavorite } from "@/app/context/FavouriteContext";

export default function FoodItemCard({ item }) {
  console.log("foodcartitem",item)
  const { toggleFavorite, favoriteItems } = useFavorite();
  const isFavorite = favoriteItems.some((fav) => fav.id === item.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { addToCart } = useCart(); // ✅ use context

  const handleAddClick = () => setIsModalOpen(true);

  const handleClose = () => {
    setIsModalOpen(false);
    setQuantity(1);
    setSelectedAddons([]);
  };

  const handleAddonChange = (addon) => {
    const exists = selectedAddons.find((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons((prev) => [
        ...prev,
        {
          id: addon.id,
          name: addon?.product?.productLanguages?.[0]?.name || "Addon",
          price: Number(addon?.inventory?.price || 0),
          productId: addon?.product?.id,
          varientId: addon?.product?.varients?.[0]?.id,
          uomId: addon?.product?.varients?.[0]?.productVarientUoms?.[0]?.id,
        },
      ]);
    }
  };

  const handleFavoriteClick = () => {
  toggleFavorite({
    productId: item.id,
    productVarientUomId: item.varients?.[0]?.productVarientUoms?.[0]?.id,
    name,
    isFavorite,
  });
};

  const name = item?.productLanguages?.[0]?.name || "Item";
  const price = Number(item?.varients?.[0]?.productVarientUoms?.[0]?.inventory?.price || 0);
  const description = item?.productLanguages?.[0]?.longDescription || "";
  const imageUrl = item?.media?.[0]?.url || "/placeholder.jpg";

  const totalAddonPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const totalPrice = (price + totalAddonPrice) * quantity;

  const handleAddToCart = async () => {
    try {
      const payload = {
        productId: item?.id,
        productVarientUomId: item?.varients?.[0]?.productVarientUoms?.[0]?.id,
        quantity,
        addons: selectedAddons.map((addon) => ({
          addOnId: addon.id,
          addOnProductId: addon.productId,
          addOnVarientId: addon.varientId,
          productVarientUomId: addon.uomId,
          quantity: 1,
        })),
      };
      await addToCart(payload); 
      // toast.custom(
      //   <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
      //     {name} added to cart successfully 
      //   </div>
      // );
      handleClose();
    } catch (error) {
      toast.custom(
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Failed to add {name} to cart 
        </div>
      );
      console.error("Failed to add item to cart:", error);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="w-full max-w-md p-3 border border-gray-200 rounded-lg shadow-sm flex gap-6">
        <div className="w-[50%] flex flex-col gap-1 justify-between">
          <div className="w-fit h-fit p-1 border border-green-700 rounded-sm">
            <div className="w-1 h-1 rounded-full bg-green-700" />
          </div>
          <h1 className="text-black font-semibold text-lg">{name}</h1>
          <span className="text-black font-semibold text-lg">₹{price}</span>
          <p className="text-gray-400 line-clamp-3">{description}</p>
        </div>
        <div className="w-[50%] relative overflow-hidden rounded-lg">
          <Image src={imageUrl} alt="food item" fill className="object-cover rounded-lg" />
          <div
            onClick={handleAddClick}
            className="bg-white border border-lightpink rounded-xl w-fit h-fit px-6 py-1 text-lg font-bold absolute bottom-0 left-10 text-lightpink cursor-pointer"
          >
            ADD
          </div>
          <div className="w-fit h-fit p-1 bg-gray-100/40 flex items-center justify-center absolute top-2 right-2 rounded-full" onClick={(e) => {e.stopPropagation();handleFavoriteClick();}}>
            <Heart fill={isFavorite ? "red" : "white"} color="white" size={20} />
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed z-[68] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md bg-white rounded-t-3xl p-4 shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold">{name}</h2>
                <button onClick={handleClose} className="text-gray-500 text-lg">✕</button>
              </div>
              <p className="mt-2 text-gray-600">{description}</p>

              <div className="mt-4 flex items-center gap-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3 px-3 py-1 border rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus size={18} />
                  </button>
                  <span className="text-base font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {item?.addons?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Select Addons</h3>
                  {item.addons.map((addon) => {
                    const addonName = addon?.product?.productLanguages?.[0]?.name || "Addon";
                    const addonPrice = Number(addon?.inventory?.price || 0);
                    const isChecked = selectedAddons.some((a) => a.id === addon.id);

                    return (
                      <label key={addon.id} className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAddonChange(addon)}
                          />
                          <span className="text-gray-700">{addonName}</span>
                        </div>
                        <span className="text-sm text-gray-600">+ ₹{addonPrice}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-lightpink text-white font-bold py-2 rounded-xl"
                >
                  Add to Cart ₹{totalPrice.toFixed(2)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
