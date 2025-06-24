import { ProductProvider } from "../context/ProductContext"
import { ChatProvider } from "../context/ChatContext"
export default function RootLayout({ children }) {
  return (
   <>
          <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
            <ProductProvider>
              <ChatProvider>
                {children}
                </ChatProvider>
            </ProductProvider>    
          </div>
    </>  
  )
}