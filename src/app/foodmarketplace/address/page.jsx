"use client";

import AddressCard from "@/app/components/foodmarketplace/AdressCard";
import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useCustomerAddresses } from "@/app/context/CustomerAddressContext";
import { useCart } from "@/app/context/CartContext";

export default function Address() {
  const { addOrEditAddress } = useCustomerAddresses(); 
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const { orderAdd } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addOrEditAddress(formData, false); 
      setShowAddForm(false);
      setFormData({});
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center overflow-y-auto">
      <div className="max-w-md w-full flex flex-col gap-4 relative bg-white ">
        {/* Header */}
        <div className="w-full px-4 flex gap-4 py-3 bg-lightpink items-center">
          <ChevronLeft size={20} strokeWidth={3} className="text-white" />
          <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
            Choose Delivery Address
          </span>
        </div>

        {/* Add New Button + Form */}
        <div className="w-full max-w-md px-4 flex flex-col gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2 bg-lightpink text-white font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add New Address
          </button>

          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="w-full bg-black p-4 rounded-xl mt-2 flex flex-col gap-3"
            >
              <input
                type="text"
                placeholder="Name"
                value={formData.name || ""}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className=" text-white p-2 rounded border border-gray-300"
                required
              />
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1 || ""}
                onChange={(e) => handleFormChange("addressLine1", e.target.value)}
                className=" text-white p-2 rounded border border-gray-300"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={formData.addressLine2 || ""}
                onChange={(e) => handleFormChange("addressLine2", e.target.value)}
                className=" text-white p-2 rounded border border-gray-300"
              />
              <input
                type="text"
                placeholder="Landmark"
                value={formData.landmark || ""}
                onChange={(e) => handleFormChange("landmark", e.target.value)}
                className=" text-white p-2 rounded border border-gray-300"
              />
              <input
                type="text"
                placeholder="Mobile"
                value={formData.mobile || ""}
                onChange={(e) => handleFormChange("mobile", e.target.value)}
                className=" text-white p-2 rounded border border-gray-300"
              />
              <input
                type="text"
                placeholder="Label (e.g. Home, Office)"
                value={formData.label || ""}
                onChange={(e) => handleFormChange("label", e.target.value)}
                className="text-white p-2 rounded border border-gray-300"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 bg-lightpink text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Address Cards */}
        <div className="w-full px-4 flex flex-col gap-2 items-center ">
          <AddressCard />
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-2 w-[90%] max-w-md flex justify-center z-50">
        <div className="w-fit h-fit px-6 flex justify-center">
          <button className="w-fit h-fit px-12 py-2 bg-green rounded-xl text-white font-bold shadow-md">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
