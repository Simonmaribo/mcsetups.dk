import ProductList from "@/components/organisms/ProductList";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tippy from "@tippyjs/react";
import { Box, Download, Eye, Heart, InfoIcon, ShoppingBag, Upload } from "lucide-react";
import Link from "next/link";
import ProfileLayout from "@/layouts/ProfileLayout";
import { useQuery } from "@tanstack/react-query";
import getDetailedProducts from "@/api/users/getDetailedProducts";
import useUser from "@/hooks/useUser";
import { ProductRelease, ReleaseStatusUpdate } from "database";
import AwaitingRelease from "@/components/organisms/AwaitingRelease";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import formatNumber from "@/lib/number";

function Products(){

    let { user } = useUser();

    let userId = user?.id;

    let { isLoading, isError, data: products } = useQuery({
        queryKey: ['products', userId],
        queryFn: async() => await getDetailedProducts(),
        retry: false,
        enabled: !!userId
    });

    if (isLoading || isError || !products) return <div className="h-screen"><LoadingState/></div>

    const sortReleasesForAwaiting = () => {
        if(products === undefined || products.length == 0) return []
        let releases: (ProductRelease & { statusUpdate: ReleaseStatusUpdate | null })[] = []
        for(let product of products){
            for(let release of product.releases){
                release.productId = product.id
                if (release.status !== "APPROVED") releases.push(release)
            }
        }
        releases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return releases
    }

    const AwaitingReleasesSorted = sortReleasesForAwaiting()


    const stats = (() => {
        let stats = {
            purchases: 0,
            downloads: 0,
            views: 0,
            favorites: 0
        }
        for(let product of products){
            stats.purchases += product._count.purchases
            stats.downloads += product.estimatedDownloads
            stats.views += product.estimatedViews
            stats.favorites += product._count.favorites
        }
        return stats
    })();

    return (
        <>
            <Meta title="McSetups | Profil - dine produkter"/>
            <ProfileLayout>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-2 mt-0">
                        <div className="relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg">
                            <h1 className="font-semibold text-lg text-slate-900">Køb</h1>
                            <div className="flex gap-2 items-center">
                                <ShoppingBag/>
                                <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{formatNumber(stats.purchases)}</h2>
                            </div>
                        </div>
                        <div className="relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg">
                            <h1 className="font-semibold text-lg text-slate-900">Downloads</h1>
                            <div className="flex gap-2 items-center">
                                <Download/>
                                <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{formatNumber(stats.downloads)}</h2>
                            </div>
                        </div>
                        <div className="relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg">
                            <h1 className="font-semibold text-lg text-slate-900">Visninger</h1>
                            <div className="flex gap-2 items-center">
                                <Eye/>
                                <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{formatNumber(stats.views)}</h2>
                            </div>
                        </div>
                        <div className="relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg">
                            <h1 className="font-semibold text-lg text-slate-900">Favoritter</h1>
                            <div className="flex gap-2 items-center">
                                <Heart/>
                                <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{formatNumber(stats.favorites)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mt-0">
                        <div className="relative w-full flex items-center justify-center mx-auto text-left ring-1 mt-0 max-w-none bg-white border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <div className="flex flex-col">
                                <div className="mb-3 flex item-center justify-center">
                                    <Box size={50} color="#0050ff"/>
                                </div>
                                <p className="font-medium text-center text-slate-900 text-xl">Nyt Produkt</p>
                                <p className="text-center text-slate-500 text-base">Upload et nyt produkt på markedet</p>
                                <div className="mt-3 flex item-center justify-center">
                                    <Tippy content={<span>Upload og få verificeret et nyt produkt</span>}>
                                        <Link href={"/profile/products/new"}>
                                            <Button variant="outline" color="blue">
                                                <Upload className="mr-2" size={20}/> Upload
                                            </Button>
                                        </Link>
                                    </Tippy>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <div className="flex flex-row items-center gap-2">
                                <h1 className="shrink-0 text-left mt-0 text-slate-900 text-lg font-medium">Afventende godkendelse</h1>
                                <Tippy content={<span>Alle nye produkter og produkt-versioner skal godkendes af en administrator</span>}>
                                    <InfoIcon size={18} className="text-slate-900"/>
                                </Tippy>
                            </div>
                            {AwaitingReleasesSorted.length === 0 ? (
                                <p className="text-slate-500 mt-1">Du har ingen udgivelser der venter på godkendelse.</p>
                            )
                            :
                            <ScrollArea className="h-48 w-full rounded">
                                {AwaitingReleasesSorted.map((release) => ( <AwaitingRelease key={release.id} release={release}/>))}
                            </ScrollArea>
                            }
                        </div>
                    </div>
                    {products.length > 0 && (
                        <ProductList products={products}/>
                    )}
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(Products, { verified: true })