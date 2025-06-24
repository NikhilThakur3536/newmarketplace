
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "./context/OrderContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import { FavoriteProvider,} from "./context/FavouriteContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <FavoriteProvider>
            {children}
          </FavoriteProvider>
          <Toaster position="bottom-center"/>
      </body>
    </html>
  );
}