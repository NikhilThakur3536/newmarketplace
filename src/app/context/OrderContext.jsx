"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children, marketplace }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

  const getApiDetails = (token) => {
    if (marketplace === "electronics") {
      return {
        url: `${BASE_URL}/user/order/list`,
        payload: { languageId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else if (marketplace === "foodmarketplace") {
      return {
        url: `${BASE_URL}/user/order/list`,
        payload: {
          languageId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return null;
  };

const normalizeOrders = (data) => {
  return data?.rows?.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    orderDate: order.orderDate,
    store: order.store?.name || null,
    location:order.store?.address || "NA",
    orderType: order.orderType || null, // ✅ added
    products: order.orderProducts?.map((p) => ({
      name:
        p.orderProductDetails?.[0]?.name ||
        p.varient?.varientLanguages?.[0]?.name ||
        "Unnamed Product",
      quantity: p.quantity,
      price: p.price,
    })),
  }));
};

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found");
      return;
    }

    const apiDetails = getApiDetails(token);
    if (!apiDetails) return;

    setLoading(true);
    try {
      const response = await axios.post(apiDetails.url, apiDetails.payload, {
        headers: apiDetails.headers,
      });
      console.log("orders",response.data.data.rows)
      if (response.data.success) {
        const formatted = normalizeOrders(response.data.data);
        console.log("formatted",formatted)
        setOrders(formatted);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      setError("Something went wrong while fetching orders");
    } finally {
      setLoading(false);
    }
    console.log("contextorder",orders)
  };

  const placeOrder = async (subTotal, customerAddressId, orderType, couponCode, couponAmount) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found");
      return false;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/user/order/addv1`,
        {
          timezone: "Asia/Kolkata",
          totalAmount: Number(subTotal - (couponAmount || 0)).toFixed(2),
          subTotal: Number(subTotal).toFixed(2),
          paymentType: "CASH",
          orderType: orderType || "DELIVERY",
          couponCode: couponCode || "",
          couponAmount: Number(couponAmount || 0).toFixed(2),
          customerAddressId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.custom(
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
            Order placed successfully
          </div>
        );
        await fetchOrders();
        return true;
      } else {
        throw new Error("Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order");
      toast.custom(
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          Failed to place order
        </div>
      );
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [marketplace]);

  return (
    <OrderContext.Provider value={{ orders, loading, error, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
};