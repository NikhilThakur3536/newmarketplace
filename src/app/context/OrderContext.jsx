"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children, marketplace }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

  const getApiDetails = (token) => {
    if (marketplace === "electronics") {
      return {
        url: "/api/user/order/listv2",
        payload: { languageId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else if (marketplace === "foodmarketplace") {
      return {
        url: "/user/order/list",
        payload: {
          languageId,
          tokenNumber: token, 
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

      if (response.data.success) {
        const formatted = normalizeOrders(response.data.data);
        setOrders(formatted);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      setError("Something went wrong while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [marketplace]);

  return (
    <OrderContext.Provider value={{ orders, loading, error }}>
      {children}
    </OrderContext.Provider>
  );
};
