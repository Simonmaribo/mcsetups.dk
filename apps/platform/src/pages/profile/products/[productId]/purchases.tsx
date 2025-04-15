import deleteManualPurchase from "@/api/products/deleteManualPurchase";
import getPurchases from "@/api/products/getPurchases";
import getSimpleProduct from "@/api/products/getSimpleProduct";
import LoadingState from "@/components/atoms/state/LoadingState";
import ManualPurchaseModal from "@/components/modals/ManualPurchaseModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import ProfileLayout from "@/layouts/ProfileLayout";
import { dateToFullString, relativeTimeAgo } from "@/lib/date";
import NiceModal from "@ebay/nice-modal-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ArrowLeft, Eye, MoreVertical, Plus, Settings, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";

function ProductPurchasesPage() {
    const router = useRouter();
    var { productId } = router.query as { productId: string };
    if(Array.isArray(productId)) productId = productId[0]

    const queryClient = useQueryClient();

    const { data: product } = useQuery({
        queryKey: ["product", productId, "simple"],
        queryFn: async () => await getSimpleProduct({ productId })
    })

    const { data: purchases } = useQuery({
        queryKey: ["product", productId, "purchases"],
        queryFn: async () => await getPurchases({ productId })
    })

    const deletePurchase = async (userId: number) => {
        if(!confirm("Er du sikker på at du vil slette dette køb?")) return;
        await deleteManualPurchase({ productId, userId })
        .then(() => {
            queryClient.invalidateQueries(["product", productId, "purchases"]);
            toast.success("Du har manuelt slettet et køb fra produktet");
        })
        .catch((err) => {
            console.log(err);
            toast.error(err?.error || "Der skete en fejl");
        })
    }

    if(!product || !purchases) return <div className="h-screen"><LoadingState/></div>

    return (
        <>
            <Meta title={`${product.title} | McSetups`}/>
            <ProfileLayout>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/profile/products/${product.id}`} passHref>
                                <ArrowLeft className="transition-all cursor-pointer text-slate-900 hover:text-slate-700 delay-50"/>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
                        </div>
                        <div className="flex gap-2">
                            <Tippy content="Vis offentlig side">
                                <Link href={`/products/${productId}`} passHref>
                                    <div className="p-2 transition-all rounded-lg cursor-pointer group bg-gray-50 hover:bg-gray-200 delay-50">
                                        <Eye className="group-hover:text-blue-900"/>
                                    </div>
                                </Link>
                            </Tippy>
                            <Tippy content="Rediger produkt">
                                <Link href={`${router.asPath}/edit`} passHref>
                                    <div className="p-2 transition-all rounded-lg cursor-pointer group bg-gray-50 hover:bg-gray-200 delay-50">
                                        <Settings className="group-hover:text-blue-900"/>
                                    </div>
                                </Link>
                            </Tippy>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                    <div className="relative flex flex-col w-full gap-2 pt-6 pb-6 pl-6 pr-6 mx-auto text-left bg-white border-blue-400 rounded-lg shadow ring-1 max-w-none ring-gray-200">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-slate-900">Købere</h1>
                            <Tippy content={<span>Tilføj manuelt køb</span>}>
                                <div onClick={() => NiceModal.show(ManualPurchaseModal, { productId })} className="transition-all delay-50 flex cursor-pointer justify-center items-center rounded-full bg-slate-900 hover:bg-slate-800 w-[30px] h-[30px]">
                                    <p className="text-sm font-medium leading-none text-white"><Plus size={20}/></p>
                                </div>
                            </Tippy>
                        </div>
                        <div className="overflow-hidden sm:rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Bruger
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Discord ID
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Type
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Tidspunkt
                                        </th>
                                        <th scope="col" className="px-6 py-3"/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.map((purchase) => (
                                        <tr className="bg-white border-b group hover:bg-gray-50" key={purchase.id}>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <img src={purchase.user.avatarUrl} alt="" className="w-8 h-8 rounded-full"/>
                                                    <div className="flex flex-col">
                                                        <p>{purchase.user.displayName}</p>
                                                    </div>
                                                </div>
                                            </th>     
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    <p>{purchase.user.discordId}</p>
                                                </div>
                                            </td>     
                                            <td className="px-6 py-4">
                                                {
                                                    purchase.type === 'MANUAL' ? (
                                                        <p className="font-medium text-slate-900">Manuelt Køb</p>
                                                    )
                                                    : (
                                                        <p className="font-medium text-slate-900">Købt for {(purchase.transaction?.amount || 0)/100} DKK</p>
                                                    )
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    <Tippy content={<span>{relativeTimeAgo(purchase.createdAt)}</span>}>
                                                        <p>{dateToFullString(purchase.createdAt)}</p>
                                                    </Tippy>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end invisible group-hover:visible">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild >
                                                        <div className="p-2 rounded-lg cursor-pointer hover:text-slate-900">
                                                            <MoreVertical size={20}/>
                                                        </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            { (purchase.type == 'MANUAL') && (
                                                                <DropdownMenuItem className="cursor-pointer" onClick={() => deletePurchase(purchase.userId)}>
                                                                    <Trash className="w-4 h-4 mr-2 text-red-500" />
                                                                    <span className="text-red-500">Fjern køb</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(ProductPurchasesPage, { verified: true });