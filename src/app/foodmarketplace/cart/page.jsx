"use client";

import { ChevronLeft, Trash2, Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useOrder } from "@/app/context/OrderContext";
import { useCustomerAddresses } from "@/app/context/CustomerAddressContext";
import { useCoupons } from "@/app/context/CouponContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodNavBar from "@/app/components/foodmarketplace/NavBar";

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity, fetchCartItems } = useCart();
  const { placeOrder } = useOrder();
  const { addresses, loading: addressesLoading } = useCustomerAddresses();
  const { coupons, loading: couponsLoading, error: couponError, fetchCoupons } = useCoupons();
  const router = useRouter();
  const [localCartItems, setLocalCartItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [orderType, setOrderType] = useState("DELIVERY");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [lastRestaurantUrl,setLastRestaurantUrl] = useState("")


  useEffect(() => {
    const lastRestaurantUrl = localStorage.getItem("lastRestaurantUrl") || "/foodmarketplace";
    setLastRestaurantUrl(lastRestaurantUrl)
  }, []);

  useEffect(() => {
    if (!isUpdating) {
      setLocalCartItems(
        cartItems.map((item) => ({
          ...item,
          quantity: Math.floor(item.quantity || 1),
        }))
      );
    }
  }, [cartItems, isUpdating]);

  const subTotal = useMemo(() => {
    return localCartItems.reduce((sum, item) => {
      return sum + Number(item.priceInfo?.price || 0) * (item.quantity || 1);
    }, 0);
  }, [localCartItems]);

  const totalAmount = selectedCoupon
    ? subTotal - Number(selectedCoupon.discountAmount || 0)
    : subTotal;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId && !addressesLoading) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, addressesLoading, selectedAddressId]);

  useEffect(() => {
    console.log("useEffect running, subTotal:", subTotal);
    if (subTotal > 0) {
      fetchCoupons(subTotal);
    }
  }, [subTotal]);

  useEffect(() => {
    console.log("Current coupons state:", coupons, "Loading:", couponsLoading, "Error:", couponError);
  }, [coupons, couponsLoading, couponError]);

  const handleQuantityChange = async (itemIndex, delta) => {
    setIsUpdating(true);
    const item = localCartItems[itemIndex];
    const currentQuantity = Math.floor(item.quantity || 1);
    const newQuantity = Math.max(1, currentQuantity + delta);

    const updatedItem = { ...item, quantity: newQuantity };
    const updatedCart = [...localCartItems];
    updatedCart[itemIndex] = updatedItem;
    setLocalCartItems(updatedCart);

    try {
      await updateCartQuantity({
        cartId: item.id,
        productId: item.productId,
        quantity: newQuantity,
      });
    } catch (err) {
      console.error("Failed to update quantity:", err);
      updatedCart[itemIndex] = { ...item, quantity: currentQuantity };
      setLocalCartItems([...updatedCart]);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (addressesLoading) {
      alert("Addresses are still loading. Please wait.");
      return;
    }
    if (addresses.length === 0 && orderType === "DELIVERY") {
      alert("No addresses available. Please add an address or choose PICKUP.");
      return;
    }
    if (subTotal <= 0) {
      alert("Cart is empty or invalid. Please add items to proceed.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  const handlePlaceOrder = async () => {
    if (orderType === "DELIVERY" && !selectedAddressId) {
      alert("Please select an address for delivery");
      return;
    }

    const success = await placeOrder(
      subTotal,
      orderType === "DELIVERY" ? selectedAddressId : null,
      orderType,
      selectedCoupon?.code || "",
      selectedCoupon?.discountAmount || 0
    );
    if (success) {
      await Promise.all(localCartItems.map((item) => removeFromCart(item.id)));
      await fetchCartItems();
      setIsModalOpen(false);
      setSelectedAddressId(null);
      setSelectedCoupon(null);
      router.push("/foodmarketplace/orders");
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-lightpink">
          <ChevronLeft size={20} strokeWidth={3} className="text-white" onClick={() => router.push(lastRestaurantUrl)} />
          <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
            Cart
          </span>
        </div>

        {/* Cart Items or Empty UI */}
        <div className="w-full px-4 py-4">
          {localCartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 gap-4">
              <div className="w-fit h-fit rounded-full bg-lightpink flex items-center justify-center p-4">
                <ShoppingCart color="white" size={55} />
              </div>
              <p className="text-lg font-semibold text-gray-600">No products in cart</p>
              <button
                className="bg-pink-200 text-pink-700 px-6 py-2 rounded-full font-semibold hover:bg-pink-300"
                onClick={() => router.push(lastRestaurantUrl)}
              >
                Browse Items
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {localCartItems.map((item, index) => (
                <div key={item.id} className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="w-[50%] flex flex-col gap-1 justify-between p-3">
                    <div className="w-fit h-fit p-1 border border-green-700 rounded-sm">
                      <div className="w-1 h-1 rounded-full bg-green-700" />
                    </div>
                    <h1 className="text-black font-semibold text-lg">{item.product?.productLanguages?.[0]?.name}</h1>
                    <span className="text-black font-semibold text-lg">
                      ₹{(Number(item.priceInfo?.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <p className="text-gray-400 line-clamp-3">{item.product?.productLanguages?.[0]?.longDescription}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(index, -1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold">{item.quantity || 1}</span>
                      <button
                        onClick={() => handleQuantityChange(index, 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center text-red-500 gap-1 mt-2 hover:text-red-700"
                    >
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                  <div className="w-[50%] relative overflow-hidden rounded-lg">
                    <Image
                      src={"/placeholder.jpg"}
                      alt="food item"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="w-fit h-fit p-1 bg-gray-100/40 flex items-center justify-center absolute top-2 right-2 rounded-full">
                      <Heart color="white" size={20} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Section */}
              <div className="border-t pt-4 mt-4 border-gray-300">
                <div className="flex justify-between px-2 text-lg font-semibold text-black">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="w-full mt-4 mb-18">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-2 bg-lightpink text-white rounded-lg font-bold hover:bg-pink-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
          <div className="bottom-0 fixed w-full max-w-md">
            <FoodNavBar />
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[68] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />
            <motion.div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md bg-white rounded-t-3xl p-4 shadow-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
                <button onClick={handleCloseModal} className="text-gray-500 text-lg">
                  ✕
                </button>
              </div>

              <div className="mt-4 max-h-[50vh] overflow-y-auto">
                {/* Order Type Selection */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Order Type</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="DELIVERY"
                        checked={orderType === "DELIVERY"}
                        onChange={() => setOrderType("DELIVERY")}
                        className="text-lightpink focus:ring-lightpink"
                      />
                      <span className="text-gray-700">Delivery</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderType"
                        value="PICKUP"
                        checked={orderType === "PICKUP"}
                        onChange={() => setOrderType("PICKUP")}
                        className="text-lightpink focus:ring-lightpink"
                      />
                      <span className="text-gray-700">Pickup</span>
                    </label>
                  </div>
                </div>

                {/* Address Selection (for Delivery) */}
                {orderType === "DELIVERY" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Select Delivery Address</h3>
                    {addressesLoading ? (
                      <p className="text-gray-600 text-center">Loading addresses...</p>
                    ) : addresses.length === 0 ? (
                      <p className="text-gray-600 text-center">No addresses available</p>
                    ) : (
                      addresses.map((address) => (
                        <label
                          key={address.id}
                          className="flex items-start gap-3 p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 text-lightpink focus:ring-lightpink"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-800">{address.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {address.addressLine1}
                              {address.landmark && `, ${address.landmark}`}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {/* Coupon Selection */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Apply Coupon</h3>
                  {couponsLoading ? (
                    <p className="text-gray-600 text-center">Loading coupons...</p>
                  ) : couponError ? (
                    <p className="text-red-600 text-center">{couponError}</p>
                  ) : coupons.length === 0 ? (
                    <p className="text-gray-600 text-center">No coupons available</p>
                  ) : (
                    <div className="space-y-2">
                      {coupons.map((coupon) => (
                        <label
                          key={coupon.code}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="coupon"
                              value={coupon.code}
                              checked={selectedCoupon?.code === coupon.code}
                              onChange={() =>
                                setSelectedCoupon({
                                  code: coupon.code,
                                  discountAmount: coupon.discountAmount || 0,
                                })
                              }
                              className="text-lightpink focus:ring-lightpink"
                            />
                            <span className="text-gray-700">{coupon.code}</span>
                          </div>
                          <span className="text-sm text-green-700">
                            Save ₹{Number(coupon.discountAmount || 0).toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{subTotal.toFixed(2)}</span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex justify-between text-green-700">
                      <span>Coupon ({selectedCoupon.code})</span>
                      <span>-₹{Number(selectedCoupon.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-800 mt-2">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-2 bg-lightpink text-white font-bold rounded-xl hover:bg-pink-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={addressesLoading || (orderType === "DELIVERY" && addresses.length === 0) || subTotal <= 0}
                >
                  Place Order ₹{totalAmount.toFixed(2)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}