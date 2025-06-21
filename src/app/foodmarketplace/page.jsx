import FoodNavBar from "../components/foodmarketplace/NavBar";

export default function FoodMaretPlace(){
    return(
        <div className="w-screen h-screen flex justify-center">
            <div className="max-w-md w-full relative h-screen">
                <div className="fixed bottom-0 z-20 backdrop-blur-xs w-full">
                    <FoodNavBar/>
                </div>
            </div>
        </div>
    )
}