import downloadProduct from "@/api/products/downloadProduct";
import getLicenses from "@/api/users/getLicenses";
import getPurchases from "@/api/users/getPurchases";
import rollLicense from "@/api/users/rollLicense";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import TransactionInfoModal from "@/components/modals/TransactionInfoModal";
import { Badge } from "@/components/molecules/Badge";
import HiddenText from "@/components/molecules/HiddenText";
import { Button } from "@/components/ui/button";
import { prettyDate, relativeTimeAgo } from "@/lib/date";
import NiceModal from "@ebay/nice-modal-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ClipboardCopy, Dices, DownloadIcon, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UserPurchasesTable() {
    const queryClient = useQueryClient();

    const { isLoading, isFetching, isError, data: purchases, error } = useQuery({
        queryKey: ['productaccess'],
        queryFn: async() => await getPurchases(),
        retry: false,
    });

    const { isLoading: isLicensesLoading, isFetching: isLicensesFetching, isError: isLicensesError, data: licenses, error: licensesError } = useQuery({
        queryKey: ['licenses'],
        queryFn: async() => await getLicenses(),
        retry: false,
    });

    if(isError || isLicensesError) return <ErrorState message={`${licensesError || error}`}/>

    const getLicense = (productId: number) => {
        return licenses?.find((license) => license.product.id == productId);
    }

    const generateNewKey = async(productId: number) => {
        await rollLicense({ productId })
        .then(() => {
            queryClient.invalidateQueries(['licenses']);
            toast.success('Ny nøgle genereret');
        })
        .catch((error) => {
            console.log(error)
            toast.error("Der skete en fejl.");
        })
    }

    return (
        <div>
            {(isLoading || isFetching) ? (
                <div className="flex justify-center items-center h-full">
                    <LoadingState/>
                </div>
            ) : (
                <div className="relative overflow-x-auto sm:rounded-lg ring-1 ring-gray-200 bg-white">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Produkt
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Købt
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Licens
                                </th>
                                <th scope="col" className="px-6 py-3"/>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                purchases?.map((purchase) => (
                                    <tr className="group bg-white border-b" key={purchase.id}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            <div className="flex gap-4 items-center">
                                                <div className="flex flex-col">
                                                    <Link href={`/products/${purchase.product.id}`}>
                                                        <Button variant={"link"}>
                                                            {purchase.product.title}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">
                                            { purchase.product.type == 'MAP' && <Badge color="green" size="xs">Map</Badge>}
                                            { purchase.product.type == 'PLUGIN' && <Badge color="pink" size="xs">Plugin</Badge>}
                                            { purchase.product.type == 'SKRIPT' && <Badge color="blue" size="xs">Skript</Badge>}
                                            { purchase.product.type == 'SETUP' && <Badge color="teal" size="xs">Setup</Badge>}
                                            { purchase.product.type == 'OTHER' && <Badge color="gray" size="xs">Andet</Badge>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 cursor-default">
                                                <Tippy content={<span>{relativeTimeAgo(purchase.createdAt)}</span>}>
                                                    <p className="text-sm text-gray-900">{prettyDate(purchase.createdAt)}</p>
                                                </Tippy>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {
                                                (licenses != null && purchase.product.type == 'PLUGIN' && purchase.product.licensable) ? 
                                                (
                                                    <>
                                                        { getLicense(purchase.product.id)?.license?.key != null ?
                                                            (
                                                                <div className="flex flex-col">
                                                                    <div className="flex flex-row gap-2 items-center">
                                                                        <HiddenText text={getLicense(purchase.product.id)?.license?.key || 'Ingen licens'}/>
                                                                        <Tippy content="Opret ny nøgle">
                                                                            <div className="cursor-pointer hover:text-slate-900 transition-all delay-50" onClick={() => generateNewKey(purchase.product.id) }>
                                                                                <Dices size={16} />
                                                                            </div>
                                                                        </Tippy>
                                                                    </div>
                                                                    { getLicense(purchase.product.id)?.license &&
                                                                        <p className="text-xs">Ændret for {relativeTimeAgo(getLicense(purchase.product.id)?.license?.lastUpdated || new Date())}</p>
                                                                    }
                                                            </div>
                                                            )
                                                            : 
                                                            (
                                                                <Button variant={"link"} onClick={() => generateNewKey(purchase.product.id) }>Opret licensnøgle</Button>
                                                            )
                                                        }
                                                    </>
                                                ) : <div/>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="justify-end flex gap-2 invisible group-hover:visible">
                                                { (purchase.type === 'PURCHASE' && purchase.transactionId) && 
                                                    <Tippy content={<span>Se transaktion</span>}>
                                                        <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                                            onClick={() => NiceModal.show(TransactionInfoModal, { purchase, transactionId: purchase.transactionId || 0 })}
                                                        >
                                                            <ClipboardCopy size={20}/>
                                                        </div>
                                                    </Tippy>
                                                }
                                                <Tippy content={<span>Tilgå produktside</span>}>
                                                    <Link href={`/products/${purchase.product.id}`}>
                                                        <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer">
                                                            <Eye size={20}/>
                                                        </div>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content={<span>Download nyeste</span>}>
                                                    <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                                        onClick={() => downloadProduct({ productId: purchase.product.id })}
                                                    >
                                                        <DownloadIcon size={20}/>
                                                    </div>
                                                </Tippy>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    { (purchases?.length <= 0) && (
                        <div className="flex flex-col items-center justify-center p-10">
                            <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                            <p className="text-xl font-semibold text-slate-900 mt-5">Ingen køb</p>
                            <p className="text-sm text-gray-500">Du har ikke foretaget nogle køb</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}