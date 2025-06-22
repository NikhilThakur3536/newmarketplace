"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";
    const BASE_URL= process.env.NEXT_PUBLIC_BASE_URL


  useEffect(() => {
    const token= localStorage.getItem("token")
    async function fetchLocations() {
      try {
        const response = await axios.post(`${BASE_URL}/user/location/list`, {
          languageId,
        },
        {headers: {
          Authorization: `Bearer ${token}`,
        }});
        if (response.data.success) {
          const rows = response.data.data.rows;
          setLocations(rows);
          setSelectedLocation(rows[0]);
        }
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    }

    fetchLocations();
  }, []);

  return (
    <LocationContext.Provider
      value={{ locations, selectedLocation, setSelectedLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
