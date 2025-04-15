import { useState } from "react";
import { Search } from "lucide-react";
import LoadingState from "../atoms/state/LoadingState";
import { DetailedProductsResponse } from "@/api/users/getDetailedProducts";
import ProductListItem from "./ProductListItem";

export default function ProductList({ products }: { products: DetailedProductsResponse[] }){

    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const filteredProducts = products.filter(product => product.title.toLowerCase().includes(search.toLowerCase()));

    const handleSearch = (e: any) => {
        if(loading) return;
        let search = e.currentTarget.value;
        setLoading(true);
        setTimeout(() => {
            setSearch(search);
            setLoading(false);
        }, 250);
    }


    return (
        <div className="flex flex-col gap-4 mt-8 p-4 bg-white border rounded-lg">
            <div className="flex justify-between flex-col gap-2 md:flex-row md:items-center">
                <p className="shrink-0 text-left mt-0 text-slate-900 text-xl font-semibold">Dine produkter</p>
                <div className="bg-white flex items-center py-2 px-4 rounded-lg gap-2 group border text-gray-500 border-gray-300 focus-within:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
                    <Search size={20}/>
                    <input 
                        type="text" 
                        className="pl-2 text-gray-500 w-full rounded-lg outline-none ring-0" 
                        placeholder="Søg..."
                        onKeyDown={(e) => {
                            if(e.key === 'Enter')
                                handleSearch(e)
                        }}
                        onChange={(e) => {
                            if(e.currentTarget.value === "")
                                handleSearch(e)
                        }}
                    />
                </div>
            </div>
            <hr/>
            { loading && (
                <div className="flex flex-row justify-center items-center">
                    <LoadingState/>
                </div>
            )}
            { !loading && filteredProducts.length === 0 && (
                <div className="flex flex-col justify-center items-center mb-4">
                    <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                    <p className="text-xl font-semibold text-slate-900 mt-3">Ingen produkter fundet</p>
                    <p className="text-sm text-gray-500">Prøv at ændre søgeordet.</p>
                </div>
            )}
            { !loading && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5">
                    { filteredProducts.map(product => <ProductListItem key={product.id} product={product}/> )}
                </div>
            )}
        </div>
    )
}