import Tippy from "@tippyjs/react";
import { CalendarDays, Check, Download, Eye, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Badge } from "../molecules/Badge";
import ProductTypeBadge from "../molecules/ProductTypeBadge";
import { DetailedProductsResponse } from "@/api/users/getDetailedProducts";

export default function ProductListItem({ product }: { product: DetailedProductsResponse }) {

    const latestApprovedRelease = product.releases
                                .filter(release => release.status === "APPROVED"
                                ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    let onSale = product.sale >= 0;
    let priceComponent = (() => {
        let price = onSale ? product.sale : product.price;
        if(price > 0){
            if(onSale) {
                return (
                    <div className="py-1 px-2 flex items-center justify-center bg-yellow-500 rounded-lg hover:bg-yellow-400 transition-all">
                        <p className="font-bold text-white">{price/100} DKK</p>
                    </div>
                )
            } else {
                return (
                    <div className="py-1 px-2 flex items-center justify-center bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-all">
                        <p className="font-bold text-white">{price/100} DKK</p>
                    </div>
                )}
        } else {
            return (
                <div className="py-1 px-2 flex items-center justify-center bg-emerald-900 rounded-lg hover:bg-emerald-800 transition-all">
                    <p className="font-bold text-white">Gratis</p>
                </div>
            )
        }

    })()

    return (
        <Link href={`/profile/products/${product.id}`} passHref>
            <div className="group border bg-white border-gray-200 rounded-lg hover:shadow cursor-pointer overflow-hidden">
                <div className="overflow-hidden rounded-tr-lg rounded-tl-lg relative">
                    <div className="absolute w-full rounded-br-lg rounded-bl-lg bottom-0 p-2 z-10 flex justify-end gap-1 bg-gradient-to-t from-black">
                        <Tippy content="Verificeret produkt">
                            <Badge size="xs" color="blue" variant={"subtle"} padding="icon"><Check size={16}/></Badge>
                        </Tippy>
                        <ProductTypeBadge type={product.type}/>
                        {
                            onSale && (
                                <Badge size="xs" color="yellow" variant={"subtle"}>På udsalg</Badge>
                            )
                        }
                    </div>
                    <img src={product.bannerUrl || ""} alt={product.title} className="w-full max-h-[200px] object-cover group-hover:scale-105 transition-all delay-75"/>
                </div>
                <div className="p-2 flex flex-col gap-1">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-bold text-slate-900">{product.title}</h1>
                        {priceComponent}
                    </div>
                    <hr/>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-1 items-center text-gray-700">
                                <Tippy content={<span>Køb</span>}>
                                    <ShoppingBag size={16}/>
                                </Tippy>
                                {product._count?.purchases}
                            </div>
                            <div className="flex gap-1 items-center text-gray-700">
                                <Tippy content={<span>Downloads</span>}>
                                    <Download size={16}/>
                                </Tippy>
                                {product.estimatedDownloads}
                            </div>
                            <div className="flex gap-1 items-center text-gray-700">
                                <Tippy content={<span>Visninger</span>}>
                                    <Eye size={16}/>
                                </Tippy>
                                {product.estimatedViews}
                            </div>
                            <div className="flex gap-1 items-center text-gray-700">
                                <Tippy content={<span>Favoritter</span>}>
                                    <Heart size={16}/>
                                </Tippy>
                                {product._count.favorites}
                            </div>
                        </div>
                        <div className="flex gap-1 items-center text-gray-700">
                            <Tippy content={<span>Seneste version</span>}>
                                <CalendarDays size={16}/>
                            </Tippy>
                            {latestApprovedRelease != null ?
                                <p>{new Date(latestApprovedRelease.createdAt).toLocaleDateString()}</p>
                                :
                                <p>Ingen versioner</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
