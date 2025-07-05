"use client"

import BottomNavigation from "@/app/components/electronicsmarketplcae/BottomNavigation"
import Breadcrumbs from "@/app/components/electronicsmarketplcae/BreadCrumbs"
import ProfileTabs from "@/app/components/electronicsmarketplcae/ProfileTabs"

export default function Profile () {
    return(
        <div className=" flex justify-center h-screen">
            <div className="w-full max-w-md bg-darkgreen flex flex-col relative">
                <Breadcrumbs/>
                <div className="w-full h-full realtive">
                    {/* <Image src={"/Profilebg.png"} fill className="object-center" alt="background"/> */}
                </div>
                <div className="absolute top-[11%] left-[31%] rounded-full bg-lightpink flex justify-center items-center w-fit h-fit p-8">
                <svg width="110" height="110" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14C12 12.4087 11.3679 10.8826 10.2426 9.75736C9.11742 8.63214 7.5913 8 6 8C4.4087 8 2.88258 8.63214 1.75736 9.75736C0.632141 10.8826 0 12.4087 0 14" fill="white"/>
                    <path d="M6 8C8.20914 8 10 6.20914 10 4C10 1.79086 8.20914 0 6 0C3.79086 0 2 1.79086 2 4C2 6.20914 3.79086 8 6 8Z" fill="white"/>
                </svg>
                </div>
                <div className="z-40 bg-white h-[950px] bottom-2 rounded-t-4xl px-2 flex flex-col gap-4 py-4 w-full overflow-y-auto ">
                    <h3 className="text-black font-bold text-xl ml-2">Profile Overview</h3>
                    <ProfileTabs/>
                </div>
                <div className="absolute bottom-0 z-60 backdrop-blur-xs w-full left-0"> 
                    <BottomNavigation/>
                </div>
            </div>
        </div>
    )
}