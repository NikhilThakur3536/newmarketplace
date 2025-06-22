"use client";

import { CustomerAddressProvider } from "../context/CustomerAddressContext";
import { LocationProvider } from "../context/LocationContext"; 

export default function RootLayout({ children }) {
  return (
    <CustomerAddressProvider>
      <LocationProvider>
        {children}
      </LocationProvider>
    </CustomerAddressProvider>
  );
}
