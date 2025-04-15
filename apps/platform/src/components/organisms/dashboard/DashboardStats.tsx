import getDashboardStats from "@/api/admin/getDashboardStats";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import formatNumber from "@/lib/number";
import { useQuery } from "@tanstack/react-query";
import { Card, Grid, Divider, BadgeDelta } from "@tremor/react";

export default function DashboardStats(){

    const { isLoading, isError, data: stats, error } = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async() => await getDashboardStats(),
        retry: false,
        refetchOnWindowFocus: true,
    });

    if(isError) return <ErrorState message={`${error}`}/>

    const getNewMembersPercentage = () => {
        if(!stats) return 0;
        return Math.round((stats.user.newThisMonth / stats.user.newPreviousMonth) * 100);
    }
    return (
        <Grid numColsMd={ 2 } numColsLg={ 3 } className={"gap-x-6 gap-y-6 mt-6"}>
            <Card>
                { isLoading && (<LoadingState/>) }
                { stats && (
                    <>
                        <h1 className="shrink-0 mt-0 text-left text-gray-500 text-base font-normal">Aktive Brugere <span className="text-sm">(denne måned)</span></h1>
                        <h2 className="mt-0 shrink-0 text-left text-gray-700 text-3xl font-semibold">{formatNumber(stats.user.activeThisMonth)} / {formatNumber(stats.user.total)}</h2>
                        <Divider/>
                        <h1 className="shrink-0 mt-0 text-left text-gray-500 text-base font-normal">Nye Brugere</h1>
                        <h2 className="mt-0 shrink-0 text-left text-gray-700 text-3xl font-semibold">{formatNumber(stats.user.newThisMonth)}</h2>
                        <div className="flex justify-start space-x-2 mt-4">
                            <BadgeDelta deltaType={getNewMembersPercentage() > 0 ? 'moderateIncrease' : 'moderateDecrease'} />
                            <div className="flex justify-start space-x-1 truncate">
                                <p className={`shrink-0 mt-0 text-left ${getNewMembersPercentage() > 0 ? 'text-emerald-500' : 'text-rose-500'} text-sm font-normal`}>{getNewMembersPercentage()}%</p>
                                <p className="truncate whitespace-nowrap mt-0 text-left text-gray-500 text-sm font-normal"> i forhold til sidste måned</p>
                            </div>
                        </div>
                    </>
                )}
            </Card>
            <Card>
                { isLoading && (<LoadingState/>) }
                { stats && (
                    <>
                        <h1 className="shrink-0 mt-0 text-left text-gray-500 text-base font-normal">Total Balance</h1>
                        <h2 className="mt-0 shrink-0 text-left text-gray-700 text-3xl font-semibold">{formatNumber(stats.balance.total/100)} DKK</h2>
                        <Divider/>
                        <h1 className="shrink-0 mt-0 text-left text-gray-500 text-base font-normal">Kan trækkes ud</h1>
                        <h2 className="mt-0 shrink-0 text-left text-gray-700 text-3xl font-semibold">{formatNumber(stats.balance.totalBalance/100)} DKK</h2>
                    </>
                )}
            </Card>
            <Card>
                { /* Placeholder to set height */ }
                <div className="h-28" />
            </Card>
        </Grid>
    )

}