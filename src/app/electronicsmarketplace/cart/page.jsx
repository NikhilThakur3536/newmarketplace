"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ShoppingCart, Minus, Plus } from "lucide-react"

export default function CartPage() {
  const { cartItems, updateCartQuantity } = useCart()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between">
        <button onClick={() => router.push("/")}>
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-lg">Shopping Cart</h1>
        <div className="w-6 h-6" />
      </div>

      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-white rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                </span>
              </div>
              <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}