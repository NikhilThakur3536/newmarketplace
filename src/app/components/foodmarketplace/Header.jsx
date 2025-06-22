import { ChevronDown, MapPin, Search, UserRound } from "lucide-react";
import Image from "next/image";

export default function FoodHeader() {
  return (
    <div className="w-full h-[450px] relative">
      {/* Background Image */}
      <div className="z-10 absolute inset-0">
        <Image
          src="/dyanmicstatedishbg.png"
          alt="background"
          fill
          className="object-cover"
        />
      </div>

      {/* Address Section (Static) */}
      <div className="relative z-30 p-2 ">
        <div className="flex flex-col w-full justify-between">
          <div className="w-[60%] flex flex-col gap-1 justify-center">
            <div className="flex gap-2 items-center w-full">
              <MapPin color="white" size={20} />
              <span className="text-white font-bold text-xl">Home</span>
              <ChevronDown color="white" />
            </div>
            <span className="text-white font-semibold ml-1">
              Full Address Here...
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar (Sticky) */}
      <div className="sticky top-0 z-40 w-full p-2">
        <div className="flex justify-between items-center w-full">
          <div className="relative w-[85%] bg-white py-2 rounded-lg">
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
          <div className="flex justify-center items-center ml-2 p-2 bg-lightpink rounded-full">
            <UserRound color="white" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
