"use client";

import { MapPinCheck, Phone, Pencil } from "lucide-react";
import { useCustomerAddresses } from "@/app/context/CustomerAddressContext";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AddressCard() {
  const { addresses, loading, addOrEditAddress } = useCustomerAddresses();
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData(address);
  };

  const handleSelect = (addressId) => {
    setSelectedId(addressId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrEditAddress(formData, true);
    setEditingId(null);
  };

  if (loading) return <p className="text-black text-center">Loading...</p>;

  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 overflow-hidden mt-2">
      {addresses.map((address) =>
        editingId === address.id ? (
          <form
            key={address.id}
            onSubmit={handleSubmit}
            className="w-full bg-gray-100 p-4 rounded-xl shadow-sm border border-gray-300 flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="p-2 rounded border border-gray-300"
              required
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={formData.addressLine1 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="p-2 rounded border border-gray-300"
              required
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={formData.addressLine2 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="p-2 rounded border border-gray-300"
            />
            <input
              type="text"
              placeholder="Landmark"
              value={formData.landmark || ""}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="p-2 rounded border border-gray-300"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={formData.mobile || ""}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="p-2 rounded border border-gray-300"
            />
            <input
              type="text"
              placeholder="Label"
              value={formData.label || ""}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="p-2 rounded border border-gray-300"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-lightpink text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            key={address.id}
            onClick={() => handleSelect(address.id)}
            className={`w-full cursor-pointer bg-white border rounded-xl shadow-sm p-4 transition-all duration-300 ${
              selectedId === address.id
                ? "border-green-500 "
                : "border-gray-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 items-center">
                <span className="text-lightpink font-bold text-xl">{address.label}</span>
                {address.status && (
                  <span className="px-3 py-1 border border-green rounded-lg text-green font-semibold text-sm">
                    {address.status}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent selection
                  handleEdit(address);
                }}
                className="text-sm text-blue-500 flex items-center gap-1"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>

            <hr className="border border-dashed border-gray-300 my-2" />

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold">{address.name}</span>
                <div className="flex gap-2 items-center">
                  <Phone size={18} color="gray" />
                  <span className="text-sm">{address.mobile}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {address.addressLine1}, {address.addressLine2}, {address.landmark}
              </p>

              <div className="flex gap-2 items-center">
                <MapPinCheck size={18} color="gray" />
                <span className="text-sm">
                  {address.addressLine1}, {address.addressLine2}
                </span>
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
