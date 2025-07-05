import { ProductProvider } from "../context/ProductContext"
import { ChatProvider } from "../context/ChatContext"
import { CartProvider } from "../context/CartContext"
import { FavoriteProvider } from "../context/FavouriteContext"
import { CouponProvider } from "../context/CouponContext"
import { OrderProvider } from "../context/OrderContext"
import { CustomerAddressProvider } from "../context/CustomerAddressContext"
import { AuthProvider } from "../context/AuthContext"
import { BreadcrumbProvider } from "../context/BreadCrumbContext"
export default function RootLayout({ children }) {
  return (
   <>
          <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
            <AuthProvider marketplace={"electronicsmarketplace"}>
              <BreadcrumbProvider marketplace={"electronicsmarketplace"}>
            <ProductProvider marketplace="electronicsmarketplace">
              <OrderProvider marketplace={"electronics"}>
              <ChatProvider>
                <FavoriteProvider marketplace={"electronicsmarketplace"}>
                  <CouponProvider>
                <CartProvider marketplace="electronicsmarketplace">
                  <CustomerAddressProvider>
                {children}
                </CustomerAddressProvider>
                </CartProvider>
                </CouponProvider>
                </FavoriteProvider>
                </ChatProvider>
                </OrderProvider>
            </ProductProvider>    
            </BreadcrumbProvider>
            </AuthProvider>
          </div>
    </>  
  )
}