// /foodmarketplace/search/SearchInput.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";

export default function SearchInput({ onSearch, initialCategoryId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchKey, setSearchKey] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  useEffect(() => {
    const initialCategoryId = searchParams.get("categoryId");
    if (initialCategoryId && !searchKey) {
      setCategoryId(initialCategoryId);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchKey) {
      router.replace("/foodmarketplace/search");
      setCategoryId(undefined);
    }
    onSearch(searchKey, categoryId);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
        onKeyDown={handleKeyPress}
        className="bg-white border border-lightpink rounded-lg w-full py-2 pr-10 pl-8 outline-none"
        placeholder="Search Here"
      />
      <SearchIcon
        onClick={handleSearch}
        className="text-lightpink absolute top-2.5 right-2 cursor-pointer"
        size={20}
      />
      <SearchIcon
        className="text-lightpink absolute top-2.5 left-1"
        size={20}
      />
    </div>
  );
}