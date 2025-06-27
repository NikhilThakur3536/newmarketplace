"use client";

import { createContext, useContext, useState } from "react";
import axios from "axios";

const CouponContext = createContext();

export const useCoupons = () => useContext(CouponContext);

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchCoupons = async (totalAmount) => {
    if (typeof window === 'undefined') {
      setError("Server-side execution not supported");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debug token
    if (!token || totalAmount <= 0) {
      setCoupons([]);
      setError(totalAmount <= 0 ? "Invalid cart amount" : "Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    if (!BASE_URL) {
      setError("Base URL not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching coupons with totalAmount:", Number(totalAmount).toFixed(2)); // Debug request
      const response = await axios.post(
        `${BASE_URL}/user/coupon/list`,
        {
          limit: 4000,
          offset: 0,
          totalAmount: Number(totalAmount).toFixed(2),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Coupon API response:", response.data); // Debug response
      const couponList = response.data.data?.rows || [];
      const filteredCoupons = couponList
        .filter((coupon) => coupon.isEligible && totalAmount >= (coupon.minPurchaseAmount || 0))
        .map((coupon) => ({
          code: coupon.code || coupon.couponCode || "",
          discountAmount: Number(coupon.discount || coupon.amount || 0),
        }));
      setCoupons(filteredCoupons);
      if (filteredCoupons.length === 0) {
        setError("No eligible coupons available for this amount.");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error.response?.data || error.message);
      setError("Failed to load coupons. Please try again.");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCoupons = () => {
    setCoupons([]);
    setError(null);
  };

  return (
    <CouponContext.Provider value={{ coupons, loading, error, fetchCoupons, clearCoupons }}>
      {children}
    </CouponContext.Provider>
  );
};