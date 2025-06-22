"use client"

import { CustomerAddressProvider } from "../context/CustomerAddressContext";

export default function RootLayout({ children }) {
  return (
    <>
    <CustomerAddressProvider>
        {children}
    </CustomerAddressProvider>    
    </>    
  );
}