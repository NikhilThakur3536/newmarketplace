"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CustomerAddressContext = createContext();

export function CustomerAddressProvider({ children }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/user/customerAddress/list`,
        { limit: 3, offset: 0 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response.data.data.rows)
      setAddresses(response.data.data.rows || []);
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOrEditAddress = async (formData, isEdit = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url = isEdit
      ? `${BASE_URL}/user/customerAddress/edit`
      : `${BASE_URL}/user/customerAddress/add`;

    const payload = isEdit
      ? {
          customerAddressId: formData.customerAddressId || formData.id,
          name: formData.name,
          addressLine1: formData.addressLine1,
          landmark: formData.landmark,
          defaultAddress: formData.defaultAddress,
          label:formData.label
        }
      : {
          name: formData.name,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          road: formData.road,
          landmark: formData.landmark,
          mobile: formData.mobile,
          defaultAddress: formData.defaultAddress,
          label: formData.label,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };

    try {
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchAddresses();
    } catch (error) {
      console.error(`Error ${isEdit ? "editing" : "adding"} address:`, error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <CustomerAddressContext.Provider value={{ addresses, loading, addOrEditAddress }}>
      {children}
    </CustomerAddressContext.Provider>
  );
}

export const useCustomerAddresses = () => useContext(CustomerAddressContext);
