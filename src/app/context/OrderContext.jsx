"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { debounce } from "lodash";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

const apiMap = {
  electronics: {
    list: "/user/order/list",
    add: "/user/order/addv2",
  },
  foodmarketplace: {
    list: "/user/order/list",
    add: "/user/order/addv1",
  },
};

export const OrderProvider = ({ children, marketplace = "electronics" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const orderEndpoints = apiMap[marketplace];
  const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const getLang = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLanguage");
    }
    return null;
  };

  const normalizeOrders = (data) => {
    return data?.rows?.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      tokenNumber: order.tokenNumber,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
      store: order.store?.name || null,
      location: order.store?.address || "NA",
      location1:order.customerAddress?.addressLine1,
      location2:order.customerAddress?.addressLine2,
      landmark:order.customerAddress?.landmark,
      orderType: order.orderType || "Delivery",
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

  const fetchOrders = debounce(async () => {
    const token = getToken();
    if (!token) {
      setError("Token not found");
      setOrders([]);
      setLoading(false);
      return;
    }

    const lang = getLang()

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${orderEndpoints.list}`,
        { languageId: lang || languageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log(`Orders response for ${marketplace}:`, response.data);
      
      if (response.data.success) {
        const formatted = normalizeOrders(response.data.data);
        // console.log("formatted", formatted);
        setOrders(formatted);
      } else {
        setError("Failed to fetch orders");
        setOrders([]);
      }
    } catch (err) {
      console.error(`Error fetching orders for ${marketplace}:`, err);
      setError("Something went wrong while fetching orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
    // console.log("contextorder", orders);
  }, 300);

  const placeOrder = async (subTotal, customerAddressId, couponCode, couponAmount, totalAmount, orderType) => {
    const token = getToken();
    if (!token) {
      setError("Token not found");
      return false;
    }

    const payload = {
      timezone: "Asia/Kolkata",
      totalAmount: totalAmount,
      subTotal: Number(subTotal),
      paymentType: "CASH",
      customerAddressId,
    };

    // Include orderType only if it is provided and not undefined/null
    if (orderType !== undefined && orderType !== null) {
      payload.orderType = orderType;
    }

    // Include couponCode and couponAmount only if they are provided and valid
    if (couponCode && couponCode.trim() !== "" && couponAmount && Number(couponAmount) > 0) {
      payload.couponCode = couponCode;
      payload.couponAmount = Number(couponAmount);
    }

    // console.log("placeOrder payload:", payload);
    // console.log("Type of totalAmount:", typeof payload.totalAmount, payload.totalAmount);
    // console.log("Type of subTotal:", typeof payload.subTotal, payload.subTotal);
    // console.log("Type of couponAmount:", typeof payload.couponAmount, payload.couponAmount);

    try {
      const response = await axios.post(`${BASE_URL}${orderEndpoints.add}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("API response:", response.data);

      if (response.data.success) {
        toast.custom(
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
            Order placed successfully
          </div>,
          { id: "order-success-toast", duration: 500 }
        );
        await fetchOrders();
        return true;
      } else {
        throw new Error(response.data.error || "Failed to place order");
      }
    } catch (err) {
      console.error(`Error placing order for ${marketplace}:`, err);
      setError(err.message || "Failed to place order");
      toast.custom(
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold">
          {err.message || "Failed to place order"}
        </div>,
        { id: "order-error-toast", duration: 300 }
      );
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pathname, marketplace]);

  return (
    <OrderContext.Provider value={{ orders, loading, error, placeOrder, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};