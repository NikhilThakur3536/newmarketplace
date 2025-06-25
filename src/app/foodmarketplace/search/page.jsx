import { Suspense } from "react";
import SearchPageClient from "@/app/components/foodmarketplace/SearchPageClient";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
