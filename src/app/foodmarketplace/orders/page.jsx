"use client"

import FoodNavBar from "@/app/components/foodmarketplace/NavBar"
import OrderCard from "@/app/components/foodmarketplace/OrderCard"
import { ChevronLeft, Search } from "lucide-react"
import Image from "next/image"

export default function Orders(){
    return(
        <div className=" flex justify-center min-h-screen">
            <div className="max-w-md w-full relative flex flex-col bg-white ">
                <div className="w-full px-4 flex gap-4 py-3 items-center bg-lightpink">
                    <ChevronLeft size={20} strokeWidth={3} className="text-white" />
                    <span className="text-white font-bold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                        Your Orders
                    </span>
                </div>
                <div className="sticky top-0 z-40 w-full max-w-md p-2">
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
                    </div>      
                    {/* Order Card */}
                    <div className="mt-4 flex flex-col gap-2 w-full mb-16">
                        <OrderCard/>
                    </div>
                    <div className="fixed bottom-0 w-full max-w-md">
                        <FoodNavBar/>
                    </div>
            </div>  
        </div>
    )
}