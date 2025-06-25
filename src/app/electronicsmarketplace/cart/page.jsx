"use client";

import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useCart } from "@/app/context/CartContext"; // adjust path as per your structure
import { useRouter } from "next/navigation";

export default function Cart() {
  const router = useRouter();
  const { cartItems, updateCartQuantity, removeFromCart } = useCart();

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateCartQuantity({
        cartId: item.id,
        productId: item.productId,
        quantity: item.quantity - 1,
      });
    }
  };

  const handleIncrease = (item) => {
    updateCartQuantity({
      cartId: item.id,
      productId: item.productId,
      quantity: item.quantity + 1,
    });
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="max-w-md w-full flex flex-col">
        {/* Header */}
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-white shadow-sm sticky top-0 z-50">
          <ChevronLeft
            size={20}
            strokeWidth={3}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <span className="font-bold text-xl">Cart</span>
        </div>

        {/* Cart Items */}
        <div className="px-4 pt-4 pb-28 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
              >
                <img
                  src={item.productImage || "/placeholder.jpg"}
                  alt={item.product?.productLanguages?.[0]?.name}
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {item.product?.productLanguages?.[0]?.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      ${parseFloat(item.priceInfo?.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="p-1 bg-gray-200 rounded-full"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="p-1 bg-gray-200 rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-xs underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
