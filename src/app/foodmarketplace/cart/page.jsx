"use client";

import { ChevronLeft, Trash2, Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useOrder } from "@/app/context/OrderContext";
import { useCustomerAddresses } from "@/app/context/CustomerAddressContext";
import { useCoupons } from "@/app/context/CouponContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import FoodNavBar from "@/app/components/foodmarketplace/NavBar";

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQuantity, fetchCartItems, isLoading: cartLoading } = useCart();
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
  const [lastRestaurantUrl, setLastRestaurantUrl] = useState("");
  const [lastFetchedSubTotal, setLastFetchedSubTotal] = useState(null);

  // Debounced fetchCoupons
  const debouncedFetchCoupons = useCallback(
    debounce((amount) => {
      if (Number.isFinite(amount) && amount > 0) {
        fetchCoupons(amount);
        setLastFetchedSubTotal(amount);
      }
    }, 500),
    [fetchCoupons]
  );

  // Set last restaurant URL and fetch cart items on mount
  useEffect(() => {
    const lastRestaurantUrl = localStorage.getItem("lastRestaurantUrl") || "/foodmarketplace";
    setLastRestaurantUrl(lastRestaurantUrl);
    fetchCartItems();
  }, [fetchCartItems]);

  // Sync localCartItems with cartItems, sanitizing data
  useEffect(() => {
    if (!cartLoading) {
      const sanitizedItems = cartItems
        .filter(item => item.id) // Ensure item.id exists
        .map((item) => ({
          ...item,
          quantity: Number.isFinite(Number(item.quantity)) ? Math.floor(Number(item.quantity)) : 1,
          priceInfo: {
            price: Number.isFinite(Number(item.priceInfo?.price)) ? Number(item.priceInfo.price) : 0,
          },
        }));
      setLocalCartItems(sanitizedItems);
    }
  }, [cartItems, cartLoading]);

  // Calculate subtotal
  const subTotal = useMemo(() => {
    const total = localCartItems.reduce((sum, item) => {
      const price = Number.isFinite(Number(item.priceInfo?.price)) ? Number(item.priceInfo.price) : 0;
      const quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1;
      return sum + price * quantity;
    }, 0);
    return Number.isFinite(total) ? total : 0;
  }, [localCartItems]);

  // Calculate total amount with discount
  const totalAmount = useMemo(() => {
    const discount = Number.isFinite(Number(selectedCoupon?.discountAmount)) ? Number(selectedCoupon.discountAmount) : 0;
    const total = Math.max(0, subTotal - discount);
    return Number.isFinite(total) ? total : 0;
  }, [subTotal, selectedCoupon]);

  // Set default address
  useEffect(() => {
    if (!addressesLoading && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, addressesLoading, selectedAddressId]);

  // Fetch coupons when subtotal changes
  useEffect(() => {
    if (Number.isFinite(subTotal) && subTotal > 0 && !cartLoading && subTotal !== lastFetchedSubTotal) {
      debouncedFetchCoupons(subTotal);
    }
  }, [subTotal, cartLoading, lastFetchedSubTotal]);

  // Fetch coupons when selectedCoupon changes
  useEffect(() => {
    if (selectedCoupon && Number.isFinite(subTotal) && subTotal > 0 && !cartLoading) {
      debouncedFetchCoupons(subTotal);
    }
  }, [selectedCoupon, subTotal, cartLoading]);

  // Handle quantity change
  const handleQuantityChange = async (itemIndex, delta) => {
    setIsUpdating(true);
    const item = localCartItems[itemIndex];
    const currentQuantity = Number(item.quantity) || 1;
    const newQuantity = Math.max(1, currentQuantity + delta);

    const updatedCart = [...localCartItems];
    updatedCart[itemIndex] = { ...item, quantity: newQuantity };
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

  // Handle checkout
  const handleProceedToCheckout = () => {
    if (addressesLoading) {
      alert("Addresses are still loading. Please wait.");
      return;
    }
    if (addresses.length === 0 && orderType === "DELIVERY") {
      alert("No addresses available. Please add an address or choose PICKUP.");
      return;
    }
    if (subTotal <= 0 || !Number.isFinite(subTotal)) {
      alert("Cart is empty or invalid. Please add valid items to proceed.");
      return;
    }
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (orderType === "DELIVERY" && !selectedAddressId) {
      alert("Please select an address for delivery");
      return;
    }

    try {
      const success = await placeOrder(
        Number(subTotal),
        orderType === "DELIVERY" ? selectedAddressId : null,
        selectedCoupon?.code || "",
        Number.isFinite(Number(selectedCoupon?.discountAmount)) ? Number(selectedCoupon.discountAmount) : 0,
        Number(totalAmount),
        orderType // Pass orderType to placeOrder
      );
      if (success) {
        await Promise.all(localCartItems.map((item) => removeFromCart(item.id)));
        await fetchCartItems();
        setLocalCartItems([]);
        setIsModalOpen(false);
        setSelectedAddressId(null);
        setSelectedCoupon(null);
        setLastFetchedSubTotal(null);
        router.push("/foodmarketplace/orders");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Place order error:", error);
      alert("An error occurred while placing the order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="max-w-md w-full">
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-lightpink">
          <ChevronLeft size={20} strokeWidth={3} className="text-white" onClick={() => router.push(lastRestaurantUrl)} />
          <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
            Cart
          </span>
        </div>
        <div className="w-full px-4 py-4">
          {cartLoading ? (
            <p className="text-gray-600 text-center">Loading cart...</p>
          ) : localCartItems.length === 0 ? (
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
                      ₹{((Number(item.priceInfo?.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                    </span>
                    <p className="text-gray-400 line-clamp-3">{item.product?.productLanguages?.[0]?.longDescription}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(index, -1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={isUpdating}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold">{Number(item.quantity) || 1}</span>
                      <button
                        onClick={() => handleQuantityChange(index, 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={isUpdating}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center text-red-500 gap-1 mt-2 hover:text-red-700"
                      disabled={isUpdating}
                    >
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                  <div className="w-[50%] relative overflow-hidden rounded-lg">
                    <Image
                      src={item.product?.image || "/placeholder.jpg"}
                      alt="food item"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4 border-gray-300 mb-20">
                <div className="flex justify-between px-2 text-lg font-semibold text-black">
                  <span>Total</span>
                  <span>₹{Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0.00"}</span>
                </div>
              </div>
              <div className="fixed max-w-md w-[80%] mt-4 bottom-8 -ml-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-2 bg-lightpink text-white rounded-lg font-bold hover:bg-pink-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={cartLoading || isUpdating}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
                {orderType === "DELIVERY" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Select Delivery Address</h3>
                    {addressesLoading ? (
                      <p className="text-gray-600 text-center">Loading addresses...</p>
                    ) : addresses.length === 0 ? (
                      <p className="text-gray-600 text-center">No addresses available</p>
                    ) : (
                      addresses.map((address, index) => (
                        <label
                          key={address.id || `address-${index}`} // Fallback key
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
                      {coupons.map((coupon, index) => (
                        <label
                          key={coupon.code || `coupon-${index}`} // Fallback key
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
                                  discountAmount: Number.isFinite(Number(coupon.discountAmount))
                                    ? Number(coupon.discountAmount)
                                    : 0,
                                })
                              }
                              className="text-lightpink focus:ring-lightpink"
                            />
                            <span className="text-gray-700">{coupon.code}</span>
                          </div>
                          <span className="text-sm text-green-700">
                            Save ₹
                            {(Number.isFinite(Number(coupon.discountAmount))
                              ? Number(coupon.discountAmount)
                              : 0
                            ).toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{Number.isFinite(subTotal) ? subTotal.toFixed(2) : "0.00"}</span>
                  </div>
                  {selectedCoupon && Number.isFinite(Number(selectedCoupon.discountAmount)) && (
                    <div className="flex justify-between text-green-700">
                      <span>Coupon ({selectedCoupon.code})</span>
                      <span>-₹{(Number(selectedCoupon.discountAmount) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-800 mt-2">
                    <span>Total</span>
                    <span>₹{Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0.00"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-2 bg-lightpink text-white font-bold rounded-xl hover:bg-pink-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={addressesLoading || (orderType === "DELIVERY" && addresses.length === 0) || subTotal <= 0 || !Number.isFinite(totalAmount) || cartLoading || isUpdating}
                >
                  Place Order ₹{Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0.00"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}