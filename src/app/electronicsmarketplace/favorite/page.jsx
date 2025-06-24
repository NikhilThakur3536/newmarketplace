"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Heart } from "lucide-react"
import { products } from "@/constants/products"
import { useCart } from "@/context/CartContext"
import { formatPrice } from "@/utils/formatPrice"

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useCart()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between">
        <button onClick={() => router.push("/")}>
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-lg">Favorites</h1>
        <div className="w-6 h-6" />
      </div>

      <div className="p-4">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No favorites yet</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products
              .filter((product) => favorites.includes(product.id))
              .map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="relative mb-3">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <button
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}