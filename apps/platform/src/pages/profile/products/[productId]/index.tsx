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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ProductStatus } from "database";
import { ArrowLeft, ClipboardType, Download, Eye, LineChart, Settings, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import ChangelogModal from "@/components/modals/ChangelogModal";
import ProductPurchasesGraph from "@/components/organisms/graphs/ProductPurchasesGraph";
import NiceModal from "@ebay/nice-modal-react";
import DeleteReleaseModal from "@/components/modals/DeleteReleaseModal";

function ProductPage() {
    const router = useRouter();
    var { productId } = router.query as { productId: string };
    if(Array.isArray(productId)) productId = productId[0]

    const queryClient = useQueryClient();

    const { isLoading, isError, data: product, error } = useQuery({
        queryKey: ["product", productId],
        queryFn: async () => await getDetailedProduct({ productId })
    })

    if(isLoading) return <div className="h-screen"><LoadingState/></div>
    if(isError) return <div className="h-screen"><ErrorState message={error as string}/></div>

    return (
        <>
            <Meta title={`${product.title} | McSetups`}/>
            <ProfileLayout>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/profile/products`} passHref>
                                <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
                        </div>
                        <div className="flex gap-2">
                            <Tippy content="Statistik">
                                <Link href={`${router.asPath}/stats`} passHref>
                                    <div className="p-2 group cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-200 transition-all delay-50">
                                        <LineChart className="group-hover:text-blue-900"/>
                                    </div>
                                </Link>
                            </Tippy>
                            <Tippy content="Vis offentlig side">
                                <Link href={`/products/${productId}`} passHref>
                                    <div className="p-2 group cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-200 transition-all delay-50">
                                        <Eye className="group-hover:text-blue-900"/>
                                    </div>
                                </Link>
                            </Tippy>
                            <Tippy content="Rediger produkt">
                                <Link href={`${router.asPath}/edit`} passHref>
                                    <div className="p-2 group cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-200 transition-all delay-50">
                                        <Settings className="group-hover:text-blue-900"/>
                                    </div>
                                </Link>
                            </Tippy>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                    { !product.public &&
                        <div className="mb-5">
                            <Callout color={"yellow"} title="Afventer godkendelse" variant={"outline"}>
                                Dette produkt er ikke offentligt endnu. Det vil først blive offentligt når der er en godkendt version.
                            </Callout>
                        </div>
                    }
                    <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                        <div className="flex flex-row justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Køb</h1>
                                <p className="text-slate-700">Antal køb af <span className="font-medium">{product.title}</span> de sidste 30 dage</p>
                            </div>
                            <Link href={`${router.asPath}/purchases`} passHref>
                                <Button color="blue">Se alle køb</Button>
                            </Link>
                        </div>
                        <ProductPurchasesGraph productId={productId} />
                    </div>
                    <div className="mt-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                        <div className="flex flex-row justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Udgivelser</h1>
                            </div>
                            <Link href={`${router.asPath}/release/new`} passHref>
                                <Button color="blue">Ny Udgivelse</Button>
                            </Link>
                        </div>
                        <div className="mt-5 relative overflow-x-auto sm:rounded-lg ring-1 ring-gray-200">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Version
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Titel
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Udgivelse
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3"/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.releases.map((release) => (
                                        <tr className="group bg-white border-b hover:bg-gray-50" key={release.id}>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex flex-col">
                                                        <p>{release.version}</p>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex flex-col">
                                                        <p>{release.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    <Tippy content={<span>{relativeTimeAgo(release.createdAt)}</span>}>
                                                        <p className="text-sm text-blue-500 font-medium">{prettyDate(release.createdAt)}</p>
                                                    </Tippy>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {release.status === ProductStatus.APPROVED && (<Badge color="green" variant="subtle" size="xs">Godkendt</Badge>)}
                                                {release.status === ProductStatus.PENDING && (<Badge color="yellow" variant="subtle" size="xs">Afventer</Badge>)}
                                                {release.status === ProductStatus.REJECTED && (<Badge color="red" variant="subtle" size="xs">Afvist</Badge>)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="justify-end flex gap-2 invisible group-hover:visible">
                                                    <Tippy content={<span>Se changelog</span>}>
                                                        <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                                            onClick={() => NiceModal.show(ChangelogModal, { releaseId: release.id })}
                                                        >
                                                            <ClipboardType size={20}/>
                                                        </div>
                                                    </Tippy>
                                                    <Tippy content={<span>Download</span>}>
                                                        <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                                            onClick={() => downloadRelease({ releaseId: release.id })}
                                                        >
                                                            <Download size={20}/>
                                                        </div>
                                                    </Tippy>
                                                    {release.status !== ProductStatus.APPROVED && (
                                                        <Tippy content={<span>Slet</span>}>
                                                            <div onClick={() => NiceModal.show(DeleteReleaseModal, ({ productId, release }))}className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-red-500 cursor-pointer">
                                                                <Trash size={20}/>
                                                            </div>
                                                        </Tippy>
                                                    )}
                                                </div>
                                            </td>
                                        </tr> 
                                    ))}
                                </tbody>
                            </table>
                            { (product.releases.length <= 0) && (
                                <div className="flex flex-col items-center justify-center p-10">
                                    <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                    <p className="text-xl font-semibold text-slate-900 mt-5">Ingen udgivelser fundet</p>
                                    <p className="text-sm text-gray-500">Dette produkt har ingen udgivelser</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(ProductPage, { verified: true });