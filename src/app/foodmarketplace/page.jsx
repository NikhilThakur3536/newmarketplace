"use client"

import CategoryTabs from "../components/foodmarketplace/CategoryTabs";
import FoodHeader from "../components/foodmarketplace/Header";
import FoodNavBar from "../components/foodmarketplace/NavBar";
import { CategoryProvider} from "../context/CategoryContext";

export default function FoodMaretPlace(){

    return(
        <CategoryProvider>
        <div className="w-screen min-h-screen flex justify-center overflow-auto">
            <div className="max-w-md w-full relative h-screen flex flex-col gap-4">
                <div className="w-full ">
                    <FoodHeader/>
                </div>
                <div className="w-full sticky flex gap-4 overflow-x-auto">
                    <CategoryTabs/>
                </div>
                <div className="absolute bottom-0 z-20 backdrop-blur-xs w-full">
                    <FoodNavBar/>
                </div>
            </div>
        </div>
        </CategoryProvider>
    )
}