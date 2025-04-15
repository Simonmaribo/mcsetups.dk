import Tippy from "@tippyjs/react";
import { ProductType } from "database";
import Link from "next/link";
import { Badge } from "../molecules/Badge";
import ProductTypeBadge from "../molecules/ProductTypeBadge";
import useUser from "@/hooks/useUser";
import useFavorites from "@/hooks/useFavorites";
import removeFavorite from "@/api/users/favorites/removeFavorite";
import { toast } from "sonner";
import addFavorite from "@/api/users/favorites/addFavorites";
import { useQueryClient } from "@tanstack/react-query";
import { BsHeartFill, BsHeart, BsFillHeartbreakFill } from "react-icons/bs";
import { useRouter } from "next/router";
interface ProductCardInterface {
    id: number;
    title: string;
    price: number;
    sale: number;
    bannerUrl: string | null;
    type: ProductType;
}

export default function ProductCard({ showcase, className, product, width = "400px" }: { showcase?: boolean, className?: string, product: ProductCardInterface, width?: string }){

    const { user } = useUser();
    const { favorites } = useFavorites();
    const router = useRouter();
    const queryClient = useQueryClient();

    const isFavorite = (() => {
        if(user && favorites){
            return favorites.some(favorite => favorite.productId === product.id)
        } else {
            return false;
        }
    })()

    let priceComponent = (() => {
        let onSale = product.sale >= 0;
        let price = onSale ? product.sale : product.price;
        if(price > 0){
            if(onSale) {
                return (
                    <div className="py-2 flex items-center justify-center bg-yellow-300 rounded-lg hover:bg-yellow-400 transition-all">
                        <div className="flex flex-row gap-1">
                            <p className="font-bold text-lg text-yellow-700">{product.sale/100} DKK</p>
                            <p className="font-semibold text-lg text-yellow-700 line-through">{product.price/100} DKK</p>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="py-2 flex items-center justify-center bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-all">
                        <p className="font-bold text-lg text-white">{product.price/100} DKK</p>
                    </div>
                )}
        } else {
            return (
                <div className="py-2 flex items-center justify-center bg-emerald-900 rounded-lg hover:bg-emerald-800 transition-all">
                    <p className="font-bold text-lg text-white">Gratis</p>
                </div>
            )
        }
    })()

    async function handleFavoriteClick(event: any) {
        event.preventDefault();
        event.stopPropagation();
        if(isFavorite){
            await removeFavorite({ productId: product.id })
            .then(() => {
                toast.success("Favorit fjernet");
            })
            .catch(() => {
                toast.error("Kunne ikke fjerne favorit");
            }).finally(() => {
                queryClient.invalidateQueries(["favorites"]);
            })
        } else {
            await addFavorite({ productId: product.id })
            .then(() => {
                toast.success("Favorit tilføjet");
            })
            .catch(() => {
                toast.error("Kunne ikke tilføje favorit");
            }).finally(() => {
                queryClient.invalidateQueries(["favorites"]);
            })
        }
    }

    return (
        <Link href={`/products/${product.id}`} passHref className={className}>
            <div className={`group p-4 bg-white border border-gray-200 rounded-lg hover:shadow cursor-pointer overflow-hidden ${className}`}>
                <div className={`overflow-hidden aspect-[2/1] rounded-lg relative bg-gray-50`}>
                    <div className="absolute w-full rounded-br-lg rounded-bl-lg bottom-0 p-2 z-10 flex justify-end gap-1 bg-gradient-to-t from-black">
                        {/*<Tippy content="Verificeret produkt">
                            <Badge size="xs" color="blue" variant={"subtle"} padding="icon"><Check size={16}/></Badge>
                        </Tippy>*/}
                        <ProductTypeBadge type={product.type}/>
                        {
                            (!showcase && product.sale >= 0) ? (
                                <Badge size="xs" color="yellow" variant={"subtle"}>På udsalg</Badge>
                            ) : null
                        }
                    </div>
                    <img src={product.bannerUrl || ""} alt={product.title} className={`h-full min-w-[${width}] aspect-[2/1] object-cover group-hover:scale-105 transition-all delay-75`}/>
                </div>
                <div className="my-2 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-900 truncate">{product.title}</h1>
                    {
                        !showcase && (
                            <>
                                {
                                    isFavorite ? ( // BsFillHeartbreakFill
                                        <Tippy content="Fjern fra favorit">
                                            <div className="group/favorite text-red-500" onClick={handleFavoriteClick}>
                                                <BsHeartFill size={24} className="group-hover/favorite:hidden transition-all"/>
                                                <BsFillHeartbreakFill size={24} className="hidden group-hover/favorite:block transition-all"/>
                                            </div>
                                        </Tippy>
                                    )
                                    : (
                                        <Tippy content="Gør til favorit">
                                            <div className="invisible group-hover:visible hover:text-red-500 transition-all" onClick={handleFavoriteClick}>
                                                <BsHeart size={24}/>
                                            </div>
                                        </Tippy>
                                    )
                                
                                }
                            </>
                        )
                    }
                </div>
                { !showcase ? (priceComponent) : null }
            </div>
        </Link>
    )
}
