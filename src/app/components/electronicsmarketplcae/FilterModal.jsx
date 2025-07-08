// "use client";

// import { useState, useEffect } from "react";
// import { X, Filter } from "lucide-react";
// import { useProduct } from "@/app/context/ProductContext";
// import axios from "axios";

// export default function FilterModal() {
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [selectedManufacturerIds, setSelectedManufacturerIds] = useState([]);
//   const [selectedPriceRange, setSelectedPriceRange] = useState("");
//   const [manufacturers, setManufacturers] = useState([]);
//   const [selectedManufacturerId, setSelectedManufacturerId] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [selectedProductModelIds, setSelectedProductModelIds] = useState([]);

//   const {
//     categories,
//     selectedCategories,
//     setSelectedCategories,
//     setSearchKey,
//     setPage,
//     fetchProducts,
//   } = useProduct();

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const LANGUAGE_ID = "2bfa9d89-61c4-401e-aae3-346627460558"; // Fixed languageId

//   // Fetch manufacturers from API
//   useEffect(() => {
//     const fetchManufacturers = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.post(
//           `${BASE_URL}/user/manufacturer/list`,
//           {
//             limit: 100,
//             offset: 0,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.data.success) {
//           setManufacturers(response.data.data);
//         } else {
//           console.error("Failed to fetch manufacturers");
//         }
//       } catch (error) {
//         console.error("Error fetching manufacturers:", error);
//       }
//     };

//     fetchManufacturers();
//   }, []);

//   // Fetch product models when a manufacturer is selected
//   useEffect(() => {
//     const fetchProductModels = async () => {
//       if (!selectedManufacturerId) {
//         setProducts([]);
//         return;
//       }

//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.post(
//           `${BASE_URL}/user/productModel/list`,
//           {
//             limit: 100,
//             offset: 0,
//             manufacturedId: selectedManufacturerId,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.data.success) {
//           setProducts(response.data.data);
//         } else {
//           console.error("Failed to fetch product models");
//         }
//       } catch (error) {
//         console.error("Error fetching product models:", error);
//       }
//     };

//     fetchProductModels();
//   }, [selectedManufacturerId]);

//   const handleApplyFilters = () => {
//     // Only include price range in searchKey
//     const combinedSearchKey = selectedPriceRange.trim();
//     setSearchKey(combinedSearchKey);
//     setPage(1);

//     // Pass manufacturerId and productModelId in the payload
//     fetchProducts(selectedCategories, combinedSearchKey, 1, {
//       languageId: LANGUAGE_ID,
//       limit: 4000,
//       offset: 0,
//       manufacturerId: selectedManufacturerIds.length > 0 ? selectedManufacturerIds : undefined,
//       productModelId:
//         selectedProductModelIds.length > 0 ? selectedProductModelIds : undefined,
//     });

//     setShowFilterModal(false);
//   };

//   return (
//     <div className="max-w-md mx-auto relative">
//       <button
//         onClick={() => setShowFilterModal(true)}
//         className="fixed bottom-24 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-30"
//       >
//         <Filter className="w-6 h-6" />
//       </button>

//       {showFilterModal && (
//         <div className="fixed inset-0 z-50">
//           {/* Backdrop */}
//           <div
//             className="absolute inset-0 bg-black opacity-50"
//             onClick={() => setShowFilterModal(false)}
//           />

//           {/* Panel */}
//           <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-lg">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold">Filters</h2>
//                 <button
//                   onClick={() => setShowFilterModal(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Categories */}
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">Categories</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {categories.map((category) => (
//                     <button
//                       key={category.id}
//                       onClick={() =>
//                         setSelectedCategories((prev) =>
//                           prev.includes(category.id)
//                             ? prev.filter((id) => id !== category.id)
//                             : [...prev, category.id]
//                         )
//                       }
//                       className={`px-4 py-2 rounded-full border text-sm ${
//                         selectedCategories.includes(category.id)
//                           ? "bg-blue-500 text-white border-blue-500"
//                           : "bg-white text-gray-700 border-gray-300"
//                       }`}
//                     >
//                       {category.categoryLanguages[0]?.name || "Unnamed"}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Brands */}
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">Brands</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {manufacturers.map((manufacturer) => (
//                     <button
//                       key={manufacturer.id}
//                       onClick={() => {
//                         setSelectedManufacturerId(manufacturer.id);
//                         setSelectedManufacturerIds((prev) =>
//                           prev.includes(manufacturer.id)
//                             ? prev.filter((id) => id !== manufacturer.id)
//                             : [...prev, manufacturer.id]
//                         );
//                       }}
//                       className={`px-4 py-2 rounded-full border text-sm ${
//                         selectedManufacturerIds.includes(manufacturer.id)
//                           ? "bg-blue-500 text-white border-blue-500"
//                           : "bg-white text-gray-700 border-gray-300"
//                       }`}
//                     >
//                       {manufacturer.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Product Models */}
//               {products.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="font-medium mb-3">Product Models</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {products.map((product) => (
//                       <button
//                         key={product.id}
//                         onClick={() =>
//                           setSelectedProductModelIds((prev) =>
//                             prev.includes(product.id)
//                               ? prev.filter((id) => id !== product.id)
//                               : [...prev, product.id]
//                           )
//                         }
//                         className={`px-4 py-2 rounded-full border text-sm ${
//                           selectedProductModelIds.includes(product.id)
//                             ? "bg-blue-500 text-white border-blue-500"
//                             : "bg-white text-gray-700 border-gray-300"
//                         }`}
//                       >
//                         {product.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Footer Buttons */}
//               <div className="flex gap-3 pt-4 border-t">
//                 <button
//                   onClick={() => {
//                     setSelectedCategories([]);
//                     setSelectedManufacturerIds([]);
//                     setSelectedProductModelIds([]);
//                     setSelectedPriceRange("");
//                     setSelectedManufacturerId(null);
//                   }}
//                   className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
//                 >
//                   Clear All
//                 </button>
//                 <button
//                   onClick={handleApplyFilters}
//                   className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium"
//                 >
//                   Apply Filters
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";
import { useProduct } from "@/app/context/ProductContext";
import axios from "axios";

export default function FilterModal() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState(null); // Single ID
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [manufacturers, setManufacturers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductModelId, setSelectedProductModelId] = useState(null); // Single ID

  const {
    categories,
    selectedCategories,
    setSelectedCategories,
    setSearchKey,
    setPage,
    fetchProducts,
  } = useProduct();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const LANGUAGE_ID = "2bfa9d89-61c4-401e-aae3-346627460558";

  // Fetch manufacturers from API
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/user/manufacturer/list`,
          {
            limit: 100,
            offset: 0,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setManufacturers(response.data.data);
        } else {
          console.error("Failed to fetch manufacturers");
        }
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
      }
    };

    fetchManufacturers();
  }, []);

  // Fetch product models when a manufacturer is selected
  useEffect(() => {
    const fetchProductModels = async () => {
      if (!selectedManufacturerId) {
        setProducts([]);
        setSelectedProductModelId(null); // Clear selected model
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/user/productModel/list`,
          {
            limit: 100,
            offset: 0,
            manufacturedId: selectedManufacturerId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          console.error("Failed to fetch product models");
        }
      } catch (error) {
        console.error("Error fetching product models:", error);
      }
    };

    fetchProductModels();
  }, [selectedManufacturerId]);

  const handleApplyFilters = () => {
    const combinedSearchKey = selectedPriceRange.trim();
    setSearchKey(combinedSearchKey);
    setPage(1);

    // Construct payload with single manufacturerId and productModelId
    const payload = {
      languageId: LANGUAGE_ID,
      limit: 4000,
      offset: 0,
    };

    if (selectedManufacturerId) {
      payload.manufacturerId = selectedManufacturerId; // Single ID
    }
    if (selectedProductModelId) {
      payload.productModelId = selectedProductModelId; // Single ID
    }

    console.log("Applying filters with payload:", payload); // Debug log

    fetchProducts(selectedCategories, combinedSearchKey, 1, payload);
    setShowFilterModal(false);
  };

  return (
    <div className="max-w-md mx-auto relative">
      <button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-24 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <Filter className="w-6 h-6" />
      </button>

      {showFilterModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowFilterModal(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(category.id)
                            ? prev.filter((id) => id !== category.id)
                            : [...prev, category.id]
                        )
                      }
                      className={`px-4 py-2 rounded-full border text-sm ${
                        selectedCategories.includes(category.id)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {category.categoryLanguages[0]?.name || "Unnamed"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturers.map((manufacturer) => (
                    <button
                      key={manufacturer.id}
                      onClick={() => {
                        // Toggle: Select if not selected, deselect if already selected
                        const newId =
                          selectedManufacturerId === manufacturer.id
                            ? null
                            : manufacturer.id;
                        setSelectedManufacturerId(newId);
                        setSelectedProductModelId(null); // Clear model when brand changes
                        setProducts([]); // Clear models list
                      }}
                      className={`px-4 py-2 rounded-full border text-sm ${
                        selectedManufacturerId === manufacturer.id
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {manufacturer.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Models */}
              {products.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Product Models</h3>
                  <div className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() =>
                          setSelectedProductModelId(
                            selectedProductModelId === product.id ? null : product.id
                          )
                        }
                        className={`px-4 py-2 rounded-full border text-sm ${
                          selectedProductModelId === product.id
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedManufacturerId(null);
                    setSelectedProductModelId(null);
                    setSelectedPriceRange("");
                    setProducts([]);
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}