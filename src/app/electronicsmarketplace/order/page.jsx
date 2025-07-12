"use client";

import BottomNavigation from "@/app/components/electronicsmarketplcae/BottomNavigation";
import Breadcrumbs from "@/app/components/electronicsmarketplcae/BreadCrumbs";
import { useOrder } from "@/app/context/OrderContext";
import { RefreshCw, ShoppingBag, AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Order({ marketplace }) {
  const { orders, loading, error, fetchOrders } = useOrder();
  const router = useRouter()

  // console.log("orders detail",orders)

  const handleRefresh = async () => {
    await fetchOrders();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700 animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
              <Breadcrumbs/>

      <div className="flex justify-between items-center mb-8">
        <div className="w-full max-w-md left-1/2 transform -translate-x-1/2 px-4 flex gap-4 py-3 items-center bg-white shadow-sm fixed top-0 z-50">
          <ChevronLeft
            size={20}
            strokeWidth={3}
            className="cursor-pointer"
            onClick={() => router.push("/electronicsmarketplace")}
          />
          <span className="font-bold text-xl">Orders</span>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-4">No orders found.</p>
          <button
            onClick={handleRefresh}
            className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition-all duration-300"
          >
            Check Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>
                    <span className="font-medium text-gray-800">Invoice:</span>{" "}
                    {order.tokenNumber}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Date:</span>{" "}
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Store:</span>{" "}
                    {order.store || "N/A"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium text-gray-800">Location:</span>{" "}
                    {order.location1},{order.landmark}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Order Type:</span>{" "}
                    {order.orderType || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Total Amount:</span>{" "}
                    ${order.totalAmount}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Products</h3>
                <ul className="space-y-4">
                  {order.products.map((product, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 pt-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p>Quantity: {product.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-800">${product.price}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <BottomNavigation/>
      </div>
    </div>
  );                    
}