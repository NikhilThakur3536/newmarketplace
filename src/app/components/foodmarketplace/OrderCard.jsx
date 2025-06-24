"use client";

import { useOrder } from "@/app/context/OrderContext";
import { ChevronRight, EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function slugify(text) {
  return typeof text === "string"
    ? text.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "-")
    : "unknown";
}

export default function OrderCard() {
  const { orders } = useOrder();
  const router = useRouter();

  if (!orders || orders.length === 0) return <p>No orders found.</p>;

  return (
    <>
      {orders.map((order, index) => {
        const storeName = slugify(order.store) || "Unknown Store";
        const store = order.store
        const locationSlug = slugify(order.location || "Unknown Location");
        const path = `/foodmarketplace/${storeName}/${locationSlug}`;

        const handleClick = () => {
          if (typeof window !== "undefined") {
            localStorage.setItem("lastRestaurantUrl", path);
          }
          router.push(path);
        };

        const orderDate = new Date(order.orderDate).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
        const amount = order.totalAmount;

        return (
          <div
            key={index}
            className="flex flex-col gap-2 w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            {/* Header Row */}
            <div className="flex gap-2 w-full">
              <div className="w-[20%] h-[60px] relative rounded-lg">
                <Image
                  src="/placeholder.jpg"
                  alt="Product"
                  fill
                  className="object-center rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-[0.1rem] w-[70%]">
                <h1 className="text-black font-medium">{store}</h1>
                <p className="line-clamp-1 text-sm text-gray-400">{order.orderType || "Unknown Type"}</p>
                <div className="flex gap-1 items-center">
                  <button className="text-lightpink font-medium" onClick={handleClick}>View menu</button>
                  <ChevronRight size={15} className="text-lightpink" />
                </div>
              </div>
              <div className="w-[10%] self-center">
                <EllipsisVertical color="black" fill="black" strokeWidth={1} size={25} />
              </div>
            </div>

            <hr className="w-full h-[1px] bg-gray-300 border-0" />

            {/* Products List */}
            <div className="flex flex-col gap-1 w-full px-2">
              {order.products?.map((product, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-fit h-fit border border-green-700 flex items-center justify-center p-1">
                    <div className="w-2 h-2 rounded-full bg-green-700" />
                  </div>
                  <p className="font-medium">
                    {parseInt(product.quantity)} x {product.name}
                  </p>
                </div>
              ))}
            </div>

            <hr className="w-full h-[0.05rem] bg-gray-300 border-0" />

            {/* Footer Row */}
            <div className="w-full px-2 flex justify-between">
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm">Order Placed on {orderDate}</p>
                <span className="text-gray-400 text-sm">
                  {order.paymentStatus || "Delivered"}
                </span>
              </div>
              <div className="flex gap-[0.2rem] items-center">
                <span className="text-lightpink font-medium">₹ {amount}</span>
                <ChevronRight size={15} className="text-lightpink" />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}