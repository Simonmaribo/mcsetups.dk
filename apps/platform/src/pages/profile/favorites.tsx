import getDetailedFavorites from "@/api/users/favorites/getDetailedFavorites";
import LoadingState from "@/components/atoms/state/LoadingState";
import ProductCard from "@/components/organisms/ProductCard";
import { Button, DivButton } from "@/components/ui/button";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import ProfileLayout from "@/layouts/ProfileLayout";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

function Favorites(){

    const { isLoading, isError, data: favorites, error } = useQuery({
        queryKey: ['favorites', 'detailed'],
        queryFn: async() => await getDetailedFavorites(),
        retry: false,
    });

    return (
        <>
            <Meta title="McSetups | Dine produkt-køb"/>
            <ProfileLayout>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-900">Dine favoritter</h1>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                    {
                        isLoading ? (
                            <LoadingState/>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {favorites && favorites.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 [@media(min-width:1200px)]:grid-cols-3 [@media(min-width:1600px)]:grid-cols-4 gap-4">
                                        {favorites.map((favorite) => (
                                            <ProductCard key={favorite.product.id} product={favorite.product} width="400px"/>
                                        ))}
                                    </div>
                                )}
                                {
                                    favorites && favorites.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-10">
                                            <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                            <p className="text-2xl font-semibold text-slate-900 mt-5">Ingen favoritter</p>
                                            <p className="text text-gray-500">Du har ikke nogle favorit produkter endnu!</p>
                                            <Link href="/products" className="mt-4">
                                                <Button>Gå på opdagelse</Button>
                                            </Link>
                                        </div>
                                    )
                                }
                            </div>  
                        )
                    }
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(Favorites);