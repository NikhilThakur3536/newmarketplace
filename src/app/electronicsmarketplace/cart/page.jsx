"use client";

import { ChevronLeft, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useCoupons } from "@/app/context/CouponContext";
import { useCustomerAddresses } from "@/app/context/CustomerAddressContext";
import { useOrder } from "@/app/context/OrderContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Breadcrumbs from "@/app/components/electronicsmarketplcae/BreadCrumbs";


export default function Cart({ marketplace = "electronics" }) {
  const router = useRouter();
  const { cartItems, updateCartQuantity, removeFromCart, clearCart } = useCart();
  const { coupons, loading: couponLoading, error: couponError, fetchCoupons, clearCoupons } = useCoupons();
  const { addresses, loading: addressLoading, addOrEditAddress } = useCustomerAddresses();
  const { placeOrder, loading: orderLoading } = useOrder();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => 
    sum + Math.floor(item.priceInfo?.price) * Math.floor(item.quantity), 0
  );

  // Fetch coupons when total price changes
  useEffect(() => {
    if (totalPrice > 0) {
      fetchCoupons(totalPrice);
    } else {
      clearCoupons();
    }
  }, [totalPrice]);

  const handleDecrease = (item) => {
    const currentQuantity = Math.floor(item.quantity);
    if (currentQuantity > 1) {
      updateCartQuantity({
        cartId: item.id,
        productId: item.productId,
        quantity: currentQuantity - 1,
      });
    }
  };

  const handleIncrease = (item) => {
    const currentQuantity = Math.floor(item.quantity);
    updateCartQuantity({
      cartId: item.id,
      productId: item.productId,
      quantity: currentQuantity + 1,
    });
  };

  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon);
  };

  const handleCheckout = () => {
    if (addresses.length === 0) {
      toast.error("Please add an address before proceeding to checkout");
      setShowAddAddressForm(true);
      return;
    }
    setShowCheckoutPopup(true);
  };

  const handleAddAddress = async (data) => {
    await addOrEditAddress({
      ...data,
      defaultAddress: addresses.length === 0,
      latitude: 0, // Add actual geolocation logic if needed
      longitude: 0,
    });
    setShowAddAddressForm(false);
    reset();
  };

  const handleConfirmCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    const orderType = marketplace === "foodmarketplace" ? "DELIVERY" : undefined;
    const finalPrice = selectedCoupon 
      ? totalPrice - selectedCoupon.discountAmount 
      : totalPrice;

    const orderSuccess = await placeOrder(
      Number(totalPrice), // subTotal
      selectedAddress?.id, // customerAddressId
      selectedCoupon?.code || "", // couponCode
      selectedCoupon?.discountAmount || 0, // couponAmount
      Number(finalPrice), // totalAmount
      orderType // orderType (only included if defined)
    );

    if (orderSuccess) {
      clearCart();
      setShowCheckoutPopup(false);
    }
  };

  const finalPrice = selectedCoupon 
    ? totalPrice - selectedCoupon.discountAmount 
    : totalPrice;

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="max-w-md w-full flex flex-col">
        <Breadcrumbs/>
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-white shadow-sm sticky top-0 z-50">
          <ChevronLeft
            size={20}
            strokeWidth={3}
            className="cursor-pointer"
            onClick={() => router.push("/electronicsmarketplace")}
          />
          <span className="font-bold text-xl">Cart</span>
        </div>

        <div className="px-4 pt-4 space-y-4">
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
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                      {item.product?.productLanguages?.[0]?.longDescription || "No description available"}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      ${Math.floor(item.priceInfo?.price)}
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
                      <span className="text-sm font-medium">{Math.floor(item.quantity)}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="p-1 bg-gray-200 rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="bg-white p-4 shadow-sm mt-4 mx-4 rounded-2xl">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              {selectedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({selectedCoupon.code})</span>
                  <span>-${selectedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold mt-2">
                <span>Total</span>
                <span>${Math.max(0, finalPrice)}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Apply Coupon</h3>
              {couponLoading && <p className="text-sm text-gray-500">Loading coupons...</p>}
              {couponError && <p className="text-sm text-red-500">{couponError}</p>}
              {coupons.length > 0 && (
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className={`p-2 border rounded-lg cursor-pointer ${
                        selectedCoupon?.code === coupon.code
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleCouponSelect(coupon)}
                    >
                      <p className="text-sm font-medium">{coupon.code}</p>
                      <p className="text-xs text-gray-500">
                        Save ${coupon.discountAmount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {coupons.length === 0 && !couponLoading && !couponError && (
                <p className="text-sm text-gray-500">No coupons available</p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={orderLoading}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                orderLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {orderLoading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        )}
      </div>

      {showCheckoutPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirm Order</h2>
              <button onClick={() => setShowCheckoutPopup(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg mb-2">Select Address</h3>
                <button
                  onClick={() => setShowAddAddressForm(true)}
                  className="text-blue-600 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add Address
                </button>
              </div>
              {addressLoading && <p className="text-sm text-gray-500">Loading addresses...</p>}
              {!addressLoading && addresses.length === 0 && (
                <p className="text-sm text-gray-500">No addresses available</p>
              )}
              {!addressLoading && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <p className="text-sm font-medium">{address.name}</p>
                      <p className="text-xs text-gray-500">{address.addressLine1}</p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500">Landmark: {address.landmark}</p>
                      )}
                      <p className="text-xs text-gray-500">Label: {address.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              {selectedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({selectedCoupon.code})</span>
                  <span>-${selectedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold mt-2">
                <span>Total</span>
                <span>${Math.max(0, finalPrice)}</span>
              </div>
            </div>

            {showAddAddressForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Address</h2>
                    <button onClick={() => setShowAddAddressForm(false)}>
                      <X size={24} className="text-gray-600" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name"
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <input
                        {...register("addressLine1", { required: "Address is required" })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter address"
                      />
                      {errors.addressLine1 && (
                        <p className="text-xs text-red-500">{errors.addressLine1.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                      <input
                        {...register("addressLine2")}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter address line 2 (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Road</label>
                      <input
                        {...register("road")}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter road (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Landmark</label>
                      <input
                        {...register("landmark")}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter landmark (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile</label>
                      <input
                        {...register("mobile", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Enter a valid 10-digit mobile number",
                          },
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter mobile number"
                      />
                      {errors.mobile && <p className="text-xs text-red-500">{errors.mobile.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Label</label>
                      <input
                        {...register("label", { required: "Label is required" })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Home, Work"
                      />
                      {errors.label && <p className="text-xs text-red-500">{errors.label.message}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmCheckout}
              disabled={orderLoading}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                orderLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {orderLoading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}