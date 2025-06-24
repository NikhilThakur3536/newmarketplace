"use client";

import Image from "next/image";
import { useCategories } from "@/app/context/CategoryContext";
import { useRouter } from "next/navigation";



export default function CategoryTabs() {
  const { categories, loading } = useCategories();
  const router= useRouter()

  const handleCategoryClick = (categoryId) => {
    router.push(`/foodmarketplace/search?categoryId=${categoryId}`);
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <>
      {categories.map((cat) => (
        <div className="w-[6rem] h-[6rem] flex flex-col " key={cat.id}  onClick={()=>handleCategoryClick(cat.id)}>
          <div className="w-[6rem] h-[80%] bg-white relative">
            <Image
              src={"/placeholder.jpg"}
              fill
              className="object-cover"
              alt="item image"
            />
          </div>
          <span className="text-black font-semibold w-full flex justify-center">
            {cat.code}
          </span>
        </div>
      ))}
    </>
  );
}
