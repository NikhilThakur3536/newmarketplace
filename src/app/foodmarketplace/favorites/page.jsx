"use client";

import { ChevronLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFavorite } from "@/app/context/FavouriteContext";
import { useEffect } from "react";
import FavItemCard from "@/app/components/foodmarketplace/FavItemCards";

export default function Favorite() {
  const router = useRouter();
  const { favoriteItems, fetchFavorites, loading, showPopup } = useFavorite();

  useEffect(() => {
    // console.log("Fetching favorites...");
    fetchFavorites();
  }, []);

  useEffect(() => {
    console.log("Favorite Items in Favorite Component:", favoriteItems);
  }, [favoriteItems]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log("Token in Favorite Component:", token);
  }, []);

  const handleAddItemClick = () => {
    const lastRestaurantUrl = localStorage.getItem("lastRestaurantUrl") || "/foodmarketplace";
    router.push(lastRestaurantUrl);
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="max-w-md w-full">
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-lightpink">
          <ChevronLeft
            size={20}
            strokeWidth={3}
            className="text-white cursor-pointer"
            onClick={() => router.back()}
          />
          <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
            Your Favorites
          </span>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading favorites...</p>
          ) : favoriteItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
              <div className="p-4 rounded-full bg-lightpink/50 flex items-center justify-center">
                <Heart size={48} className="text-lightpink" fill="none" strokeWidth={2} />
              </div>
              <p className="mt-4 text-gray-500 text-center">No favorite items yet.</p>
              <button
                onClick={handleAddItemClick}
                className="mt-4 bg-lightpink text-white font-bold py-2 px-6 rounded-xl"
              >
                Add Item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteItems.map((item) => {
                // console.log("Rendering Item:", item);
                return <FavItemCard key={item.id} item={item} />;
              })}
            </div>
          )}
        </div>
        {showPopup && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-md font-semibold text-white ${
              showPopup.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {showPopup.message}
          </div>
        )}
      </div>
    </div>
  );
}