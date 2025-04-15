import getPayouts from "@/api/users/getPayouts"
import getIntegrations from "@/api/users/profile/integrations/getIntegrations"
import LoadingState from "@/components/atoms/state/LoadingState"
import CreatePayoutModal from "@/components/modals/CreatePayoutModal"
import { Badge } from "@/components/molecules/Badge"
import PayoutBadge from "@/components/molecules/PayoutBadge"
import BalanceCard from "@/components/organisms/profile/BalanceCard"
import { Button } from "@/components/ui/button"
import withAuth from "@/hoc/withAuth"
import Meta from "@/layouts/Meta"
import ProfileLayout from "@/layouts/ProfileLayout"
import { dateToString, prettyDate } from "@/lib/date"
import NiceModal from "@ebay/nice-modal-react"
import { useQueries, useQuery } from "@tanstack/react-query"
import Tippy from "@tippyjs/react"
import { PayoutStatus } from "database"
import { Landmark } from "lucide-react"
import Link from "next/link"

function Payouts() {
  
    const [integrationsQuery, payoutsQuery] = useQueries({
        queries: [
            {
                queryKey: ['user-integrations'],
                queryFn: async() => await getIntegrations(),
            },
            {
                queryKey: ['payouts', '@me'],
                queryFn: async () => await getPayouts()
            }
        ]
    })

    const payouts = payoutsQuery.data;
    const integrations = integrationsQuery.data;
    const isLoading = payoutsQuery.isLoading || integrationsQuery.isLoading ||  payouts == undefined || integrations == undefined;

    if(isLoading) {
        return (
            <ProfileLayout>
                <Meta title="McSetups | Udbetalinger"/>
                <div className="flex items-center justify-center h-screen">
                    <LoadingState/>
                </div>
            </ProfileLayout>
        )
    }

    const isPaypalConnected = (() => {
        if(!integrations) return null;
        if(integrations.length === 0) return null;
        if(integrations.find(int => int.type === "PAYPAL") === undefined) return null;
        return true;
    })()

    if(!isPaypalConnected) {
        return (
            <ProfileLayout>
                <Meta title="McSetups | Udbetalinger"/>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                        <div className="flex flex-col gap-5 w-full">
                            <h1 className="text-2xl font-bold text-slate-900">Udbetalinger</h1>
                            <div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl font-semibold text-slate-900">PayPal er ikke tilsluttet</h1>
                                        <p className="text-gray-500">Du skal først tilføje en PayPal integration for at kunne udbetale penge.</p>
                                        <Link href="/profile/settings">
                                            <Button color="blue" size="sm">Tilføj PayPal integration</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        )
    }


    const latestPayout = (() => {
        if (payouts) {
            return payouts[0]
        } return null
    })();


    return (
        <ProfileLayout>
            <Meta title="McSetups | Udbetalinger"/>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                    <div className="flex flex-col gap-5 w-full">
                        <h1 className="text-2xl font-bold text-slate-900">Udbetalinger</h1>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                            <div className="group relative flex gap-4 justify-center items-center w-full text-left ring-1 bg-white shadow border-blue-500 ring-gray-200 p-6 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-95"
                                onClick={() => NiceModal.show(CreatePayoutModal)}
                            >
                                <div className="group-hover:text-emerald-500 transition-all delay-50">
                                    <Landmark/>
                                </div>
                                <div>
                                    <h1 className="font-semibold text-lg text-slate-900">Opret udbetaling</h1>
                                </div>
                            </div>
                            <div className="relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg">
                                { (latestPayout != null) ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <h1 className="font-semibold text-lg text-slate-900">Seneste udbetaling</h1>
                                            <p className="text-gray-500">{dateToString(latestPayout.updatedAt)}</p>
                                        </div>
                                        <div className="mt-1 flex gap-4 items-center">
                                            <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{latestPayout.amount/100} DKK</h2>
                                            <PayoutBadge status={latestPayout.status}/>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="font-semibold text-lg text-slate-900">Ingen udbetalinger</h1>
                                        <p className="text-gray-500">Du har ikke udbetalt penge endnu.</p>
                                    </>
                                )}
                            </div>
                            <BalanceCard userId={'@me'} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                <div className="w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">    
                    <table className="rounded overflow-hidden w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Dato
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
                            </tr>
                        </thead>
                        <tbody>
                            { payouts.map((payout) => (
                                <tr className="group bg-white border-b" key={payout.id}>
                                    <th scope="row" className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex">
                                            <Tippy content={<span>Oprettet {prettyDate(payout.createdAt)}</span>}>
                                                <p className="text-blue-500 font-medium">{prettyDate(payout.updatedAt)}</p>
                                            </Tippy>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    { payouts.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 py-10">
                            <h1 className="text-xl font-semibold text-slate-900">Ingen udbetalinger</h1>
                            <p className="text-gray-500">Du har ikke udbetalt penge endnu.</p>
                            <Button  onClick={() => NiceModal.show(CreatePayoutModal)}>Opret udbetaling</Button>
                        </div>
                    )}
                </div>
            </div>
        </ProfileLayout>
    )
}



export default withAuth(Payouts, { verified: true })