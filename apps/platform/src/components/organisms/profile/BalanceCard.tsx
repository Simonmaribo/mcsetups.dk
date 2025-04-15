import getBalance from "@/api/users/getBalance";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Callout } from "@/components/molecules/Callout";
import formatNumber from "@/lib/number";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PurchaseFunds from "./PurchaseFunds";
import Link from "next/link";
import NiceModal from "@ebay/nice-modal-react";
import TempBalanceModal from "@/components/modals/TempBalanceModal";
export default function BalanceCard({ userId = "@me", className }: { userId: '@me' | number, className?: string }){
    const { isLoading, isError, data: balance, error } = useQuery({
        queryKey: ['user-balance', `${userId}`],
        queryFn: async() => await getBalance({ userId }),
        refetchOnWindowFocus: true,
    });

    const tempBalanceTotal = balance?.tempBalance?.map((item) => item.amount).reduce((a, b) => a + b, 0) || 0;

    return (
        <div className={`relative w-full text-left ring-1 bg-white shadow ring-gray-200 p-6 rounded-lg ${className}`}>
            { isLoading && (<LoadingState/>) }
            {isError && <ErrorState message={`${error}`}/> }
            { balance && (
                <>
                    <div className="flex justify-between">
                        <h1 className="font-semibold text-lg text-slate-900">Konto</h1>
                        <PurchaseFunds/>
                    </div>
                    <h2 className="mt-0 shrink-0 text-left text-zinc-900 text-3xl font-semibold">{formatNumber(balance.balance/100)} kr.</h2>
                    { tempBalanceTotal > 0 && (
                        <div onClick={() => NiceModal.show(TempBalanceModal, { balance })}>
                            <Callout className="cursor-pointer mt-3" title={"Snart tilgængelig"} color="yellow">
                                Der er <span className="font-medium">{formatNumber(tempBalanceTotal/100)} kr.</span> på vej til din konto.
                            </Callout>
                        </div>
                    )}
                    <div className="flex">
                        <Link href="/profile/transactions" passHref>
                            <div className="flex items-center mt-2 text-blue-500 gap-1 cursor-pointer hover:text-blue-800">
                                <span>Vis alle transaktioner</span>
                            </div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}