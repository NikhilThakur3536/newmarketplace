"use client";

import { CustomerAddressProvider } from "../context/CustomerAddressContext";
import { LocationProvider } from "../context/LocationContext"; 
import { CouponProvider } from "../context/CouponContext";
import { OrderProvider } from "../context/OrderContext";
import { FavoriteProvider } from "../context/FavouriteContext";
import { CartProvider } from "../context/CartContext";

export default function RootLayout({ children }) {
  return (
    <CustomerAddressProvider>
      <LocationProvider>
        <CouponProvider>
          <OrderProvider marketplace={"foodmarketplace"}>
            <CartProvider marketplace={"foodmarketplace"}>
            <FavoriteProvider>
          {children}
          </FavoriteProvider>
          </CartProvider>
          </OrderProvider>
        </CouponProvider>
      </LocationProvider>
    </CustomerAddressProvider>
  );
}
  