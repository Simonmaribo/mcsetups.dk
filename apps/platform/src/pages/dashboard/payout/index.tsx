import AdminLayout from "@/layouts/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import ErrorState from "@/components/atoms/state/ErrorState";
import { prettyDate } from "@/lib/date";
import { Copy, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import Tippy from "@tippyjs/react";
import withAuth from "@/hoc/withAuth";
import getPendingPayouts from "@/api/admin/payouts/getPendingPayouts";
import PayoutBadge from "@/components/molecules/PayoutBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NiceModal from "@ebay/nice-modal-react";
import AdminPayoutModal from "@/components/modals/AdminPayoutModal";

function Payouts(){

    const { isLoading, isFetching, isError, data: payouts, error } = useQuery({
        queryKey: ['payouts', 'pending'],
        queryFn: async() => await getPendingPayouts(),
    });

    if(isError) return <ErrorState message={`${error}`}/>

    return (
        <AdminLayout size="2xl">
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Afventende udbetalinger</h1>
                </div>
            </div>
            <div className="mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="relative overflow-x-auto sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Bruger
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Beløb
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gebyr
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Dato
                                    </th>
                                    <th scope="col" className="px-6 py-3"/>
                                </tr>
                            </thead>
                            <tbody>
                            { payouts && payouts?.map((payout) => (
                                <tr className="group bg-white border-b" key={payout.id}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <div className="flex gap-4 items-center">
                                            <img src={payout.user.avatarUrl} alt="" className="w-8 h-8 rounded-full"/>
                                            <div className="flex flex-col">
                                                <div className="flex gap-1">
                                                    <p>{payout.user.displayName}</p>
                                                    <p className="text-slate-700">({payout.user.discordName})</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <p className="text-xs text-gray-500">{payout.user.discordId}</p>
                                                    <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(payout.user.discordId);
                                                            toast('Kopieret!', { description: 'Brugerens Discord ID er blevet kopieret til udklipsholderen.' })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <PayoutBadge status={payout.status}/>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-600 font-medium">{(payout.amount+payout.fee) / 100} DKK</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-rose-600 font-medium">-{payout.fee/100} DKK</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 font-medium">{payout.amount/100} DKK</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex">
                                            <Tippy content={<span>Oprettet {prettyDate(payout.createdAt)}</span>}>
                                                <p className="text-blue-500 font-medium">{prettyDate(payout.updatedAt)}</p>
                                            </Tippy>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="justify-end flex invisible group-hover:visible">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="rounded-lg p-2 hover:text-slate-900 cursor-pointer">
                                                        <MoreVertical size={20}/>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => NiceModal.show(AdminPayoutModal, { payout })}>
                                                        Udbetal
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        { (!isLoading && !isFetching && payouts?.length <= 0) && (
                            <div className="flex flex-col items-center justify-center p-10">
                                <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                <p className="text-xl font-semibold text-slate-900 mt-5">Ingen udbetalinger</p>
                                <p className="text-sm text-gray-500">Der er ingen udbetalinger som mangler at blive betalt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(Payouts, { maxGroup: 0 });