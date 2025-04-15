import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import withAuth from "@/hoc/withAuth";
import AdminLayout from "@/layouts/AdminLayout";
import EarningsGraph from "@/components/organisms/graphs/statistics/EarningsGraph";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DatePicker } from "@/components/molecules/DatePicker";
import { DateRange } from "react-day-picker";
import getComparisonGraph from "@/api/admin/statistics/getComparisonGraph";
import ComparisonGraph from "@/components/organisms/graphs/statistics/ComparisonGraph";

function Comparison(){
    
    let { user } = useUser();

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
    })

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate)
    }

    const { data, isLoading } = useQuery({
        queryKey: ["comparison-graph", date],
        queryFn: async () => await getComparisonGraph({ startDate: date?.from, endDate: date?.to })
    })
    
    if(!user) return <div className="h-screen"> <LoadingState/></div>


    if(data && data.length > 0){
        data.forEach((entry, index) => {
            if(entry.argonClicks === 0 || entry.argonDownloads === 0 || entry.mcsetupsViews === 0 || entry.mcsetupsDownloads === 0){
                data.splice(index, 1)
            }
        })
    }

    return (
        <AdminLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Comparison to Argon</h1>
                    <div>
                        <DatePicker date={date} onDateChange={handleDateChange}/>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Total Views</h1>
                            <p className="text-slate-700">
                                Total views of products on the platform.
                            </p>
                        </div>
                    </div>
                    {
                        isLoading ? <LoadingState/> : <ComparisonGraph type2="argonClicks" type1="mcsetupsViews" comparisonData={data || []}/>
                    }
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Total Downloads</h1>
                            <p className="text-slate-700">
                                Total downloads of products on the platform.
                            </p>
                        </div>
                    </div>
                    {
                        isLoading ? <LoadingState/> : <ComparisonGraph type2="argonDownloads" type1="mcsetupsDownloads" comparisonData={data || []}/>
                    }
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(Comparison, { maxGroup: 1 });