"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Trash2 } from "lucide-react";
import { useFavorite } from "@/app/context/FavouriteContext";
import BottomNavigation from "@/app/components/electronicsmarketplcae/BottomNavigation";

export default function FavoritesPage() {
  const { favoriteItems, loading, showPopup, toggleFavorite } = useFavorite();
  const router = useRouter();

  const formatPrice = (price) => `$${parseFloat(price || 0).toFixed(2)}`;

  const handleRemoveFromFavorites = (product) => {
    toggleFavorite({
      productId: product.id,
      productVarientUomId: product.varients?.[0]?.productVarientUoms?.[0]?.id || "default-uom-id",
      name: product.productLanguages?.[0]?.name || "Unnamed Product",
      isFavorite: true, 
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-28 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white px-4 py-4 shadow-md z-40 flex gap-2 items-center">
        <ChevronLeft
          color="black"
          size={20}
          strokeWidth={4}
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <h2 className="text-lg font-bold text-gray-900">Your Favorites</h2>
      </div>

      {/* Main Content */}
      <div>
        {loading ? (
          <p className="text-center text-gray-500 mt-16">Loading favorites...</p>
        ) : favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <Heart className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">You haven’t added any favorites yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {favoriteItems.map((item) => {
              const product = item;
              const name = product.productLanguages?.[0]?.name || "Unnamed Product";
              const image = product.media?.[0]?.url || "/placeholder.jpg";
              const price =
                product.varients?.[0]?.inventory?.price ||
                product.varients?.[1]?.inventory?.price ||
                0;
              const description = product.productLanguages?.[0]?.longDescription || "No description";

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="relative mb-3">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-32 object-cover rounded-lg bg-gray-100"
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-1">{name}</h3>
                  <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        router.push(`/electronicsmarketplace/product/${product.id}`)
                      }
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveFromFavorites(product)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Remove from Favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup for success/error messages */}
      {showPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full z-50">
          <p
            className={`text-sm font-medium ${
              showPopup.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {showPopup.message}
          </p>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}