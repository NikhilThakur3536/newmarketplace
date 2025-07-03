"use client";

import { CustomerAddressProvider } from "../context/CustomerAddressContext";
import { LocationProvider } from "../context/LocationContext"; 
import { CouponProvider } from "../context/CouponContext";
import { OrderProvider } from "../context/OrderContext";
import { FavoriteProvider } from "../context/FavouriteContext";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { ProductProvider } from "../context/ProductContext";

export default function RootLayout({ children }) {
  return (
    <CustomerAddressProvider>
      <LocationProvider>
        <CouponProvider>
          <OrderProvider marketplace={"foodmarketplace"}>
            <CartProvider marketplace={"foodmarketplace"}>
            <FavoriteProvider marketplace={"foodmarketplace"}>
              <CategoryProvider>
                <ProductProvider marketplace="foodmarketplace">
          {children}
          </ProductProvider>
          </CategoryProvider>
          </FavoriteProvider>
          </CartProvider>
          </OrderProvider>
        </CouponProvider>
      </LocationProvider>
    </CustomerAddressProvider>
  );
}
  