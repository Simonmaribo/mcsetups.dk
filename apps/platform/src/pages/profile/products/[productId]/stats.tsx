import downloadRelease from "@/api/products/release/downloadRelease";
import getDetailedProduct from "@/api/products/getDetailedProduct";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Badge } from "@/components/molecules/Badge";
import { Callout } from "@/components/molecules/Callout";
import { Button } from "@/components/ui/button";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import ProfileLayout from "@/layouts/ProfileLayout";
import { relativeTimeAgo, prettyDate } from "@/lib/date";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ProductStatus } from "database";
import { ArrowLeft, ClipboardType, Download, Eye, LineChart, Settings, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ChangelogModal from "@/components/modals/ChangelogModal";
import ProductPurchasesGraph from "@/components/organisms/graphs/ProductPurchasesGraph";
import NiceModal from "@ebay/nice-modal-react";
import DeleteReleaseModal from "@/components/modals/DeleteReleaseModal";
import getSimpleProduct from "@/api/products/getSimpleProduct";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { DatePicker } from "@/components/molecules/DatePicker";
import getTotalStats from "@/api/products/graph/getTotalStats";
import TotalProductStats from "@/components/organisms/graphs/product-stats/TotalProductStats";
import getProductStats from "@/api/products/graph/getProductStats";
import ProductStatsGraph from "@/components/organisms/graphs/product-stats/ProductStats";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

function ProductPage() {
    const router = useRouter();
    var { productId } = router.query as { productId: string };
    if(Array.isArray(productId)) productId = productId[0]

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
    })

    const [statType, setStatType] = useState<"views" | "purchases" | "downloads">("views")

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate)
    }

    const [product, totalStats, productStats] = useQueries({
        queries: [
            { queryKey: ["product", productId, "simple"], queryFn: async () => await getSimpleProduct({ productId }) },
            { queryKey: ["product", productId, "total-stats", date], queryFn: async () => await getTotalStats({ productId, startDate: date?.from, endDate: date?.to }) },
            { queryKey: ["product", productId, "product-stats", date], queryFn: async () => await getProductStats({ productId, startDate: date?.from, endDate: date?.to }) }
        ]
    })

    const isLoading = product.isLoading || totalStats.isLoading || productStats.isLoading;
    const isError = product.isError || totalStats.isError || productStats.isError;


    if(isLoading) return <div className="h-screen"><LoadingState/></div>
    if(isError) return <div className="h-screen"><ErrorState/></div>

    return (
        <>
            <Meta title={`${product.data.title} | McSetups`}/>
            <ProfileLayout>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/profile/products/${product.data.id}`} passHref>
                                <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">{product.data.title}</h1>
                        </div>
                        <div className="flex gap-2">
                            <DatePicker date={date} onDateChange={handleDateChange}/>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                    <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                        <div className="flex flex-row justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Akkumuleret statistik</h1>
                            </div>
                        </div>
                        <TotalProductStats stats={totalStats.data}/>
                    </div>
                    <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                        <div className="flex flex-row justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Statistik pr. dag</h1>
                            </div>
                            <div>
                                <Select onValueChange={(value) => setStatType(value as "views" | "purchases" | "downloads")} value={statType}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a fruit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Type</SelectLabel>
                                            <SelectItem value="views">Visninger</SelectItem>
                                            <SelectItem value="downloads">Downloads</SelectItem>
                                            <SelectItem value="purchases">Køb</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <ProductStatsGraph stats={productStats.data} type={statType}/>
                    </div>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(ProductPage, { verified: true });