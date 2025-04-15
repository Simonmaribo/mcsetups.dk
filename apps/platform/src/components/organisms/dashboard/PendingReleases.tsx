import getPendingReleases from "@/api/admin/releases/getPendingReleases";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Badge } from "@/components/molecules/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dateToFullString, relativeTimeAgo } from "@/lib/date";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import Link from "next/link";

export default function PendingReleases(){

    const { isLoading, isError, data: releases, error } = useQuery({
        queryKey: ['dashboard', 'pendingReleases'],
        queryFn: async() => await getPendingReleases(),
        retry: false,
    });

    if(isError) return <ErrorState message={`${error}`}/>

    return (
        <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
            <h1 className="font-medium">Afventer godkendelse {releases ? `(${releases.length})` : "(0)"}</h1>
            { (!releases || isLoading) && ( <LoadingState/> )}
            { (releases && releases?.length <= 0) && (
                <p className="text-gray-500 mt-1">Ingen afventer godkendelse</p>
            )}
            { releases && releases?.length > 0 && (
                <ScrollArea className="mt-2 h-48 w-full rounded">
                    { releases.map((release) => (
                        <Link  key={release.id} passHref href={`/dashboard/release/${release.id}`}>
                            <div className="mt-2 rounded-lg border border-gray-200 p-2 bg-gray-50">
                                <div className="px-2 flex flex-col gap-1">
                                    <div className="flex flex-row justify-between">
                                        <h2 className="font-medium text-zinc-800">{release.title} <span className="text-zinc-700">({release.version})</span></h2>
                                        <Tippy content={dateToFullString(release.createdAt)}>
                                            <p className="text-zinc-700 text-sm">{relativeTimeAgo(release.createdAt)}</p>
                                        </Tippy>
                                    </div>
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="flex flex-row mt-1 items-center">
                                            <img alt={release.product.creator.displayName} src={release.product.creator.avatarUrl} className="w-6 h-6 rounded-full mr-2"/>
                                            <div>
                                                <p className="text-sm text-slate-900">{release.product.creator.displayName}</p>
                                            </div>
                                        </div>
                                            <div>
                                            {new Date(release.createdAt).getTime() == new Date(release.product.createdAt).getTime() && (
                                                <Badge color="green" variant="subtle" size="sm">Nyt produkt</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </ScrollArea>
            )}
    
        </div>
    )

}