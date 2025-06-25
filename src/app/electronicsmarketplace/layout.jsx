import { ProductProvider } from "../context/ProductContext"
import { ChatProvider } from "../context/ChatContext"
import { CartProvider } from "../context/CartContext"
export default function RootLayout({ children }) {
  return (
   <>
          <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
            <ProductProvider>
              <ChatProvider>
                <CartProvider marketplace="electronicsmarketplace">
                {children}
                </CartProvider>
                </ChatProvider>
            </ProductProvider>    
          </div>
    </>  
  )
}