"use client"

import OrderCard from "@/app/components/foodmarketplace/OrderCard"
import { ChevronLeft, ChevronRight, EllipsisVertical, Search } from "lucide-react"
import Image from "next/image"

export default function Orders(){
    return(
        <div className="w-screen flex justify-center  bg-black min-h-screen">
            <div className="max-w-md w-full relative flex flex-col bg-white">
                <div className="w-full px-4 flex gap-4 py-3 items-center bg-lightpink">
                <ChevronLeft size={20} strokeWidth={3} className="text-white" />
                <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                    Your Orders
                </span>
                </div>
                <div className="sticky top-0 z-40 w-full p-2">
                    <div className="flex justify-between items-center w-full border border-gray-300 rounded-xl drop-shadow-sm">
                        <div className="relative w-full bg-white py-2 rounded-xl">
                            <input
                            type="text"
                            placeholder="Search here"
                            className="w-full pl-10 outline-none"
                            />
                            <Search
                            className="text-lightpink absolute top-2 left-2"
                            size={25}
                            />
                        </div>
                    </div>
                    {/* Order Card */}
                    <div className="mt-4 flex flex-col gap-2 w-full h-52 bg-white  rounded-lg border border-gray-300 shadow-md">
                        <OrderCard/>
                    </div>
                </div>  
            </div>  
        </div>
    )
}