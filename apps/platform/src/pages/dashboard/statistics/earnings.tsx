import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import withAuth from "@/hoc/withAuth";
import AdminLayout from "@/layouts/AdminLayout";
import EarningsGraph from "@/components/organisms/graphs/statistics/EarningsGraph";
import { useQuery } from "@tanstack/react-query";
import getEarningsGraph from "@/api/admin/statistics/getEarningsGraph";
import { useState } from "react";
import { DatePicker } from "@/components/molecules/DatePicker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

function Earnings(){
    
    let { user } = useUser();

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
    })

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate)
    }

    const { data: earnings, isLoading } = useQuery({
        queryKey: ["earnings-graph", date],
        queryFn: async () => await getEarningsGraph({ startDate: date?.from, endDate: date?.to })
    })
    
    if(!user) return <div className="h-screen"> <LoadingState/></div>

    return (
        <AdminLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Indtægter</h1>
                    <div>
                        <DatePicker date={date} onDateChange={handleDateChange}/>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Total Deposits</h1>
                            <p className="text-slate-700">Total amount being deposited onto the site</p>
                            <div>
                                <p className="text-slate-900 text-3xl font-bold mt-4">{((earnings?.totalAmount || 0)/100).toFixed(2)} DKK</p>
                            </div>
                        </div>
                    </div>
                    {
                        isLoading ? <LoadingState/> : <EarningsGraph type="amount" earnings={earnings?.data || []}/>
                    }
                </div>
                <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Gross volume</h1>
                            <p className="text-slate-700">Estimated revenue from payments that are settled to PayPal Balance.</p>
                            <div>
                                <p className="text-slate-900 text-3xl font-bold mt-4">{((earnings?.totalGrossVolume || 0)/100).toFixed(2)} DKK</p>
                            </div>
                        </div>
                    </div>
                    {
                        isLoading ? <LoadingState/> : <EarningsGraph type="grossVolume" earnings={earnings?.data || []}/>
                    }
                </div>
                <div className="my-5 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Net volume</h1>
                            <p className="text-slate-700">Estimated revenue from payments after fees have been deducted.</p>
                            <div>
                                <p className="text-slate-900 text-3xl font-bold mt-4">{((earnings?.totalNetVolume || 0)/100).toFixed(2)} DKK</p>
                            </div>
                        </div>
                    </div>
                    {
                        isLoading ? <LoadingState/> : <EarningsGraph type="netVolume" earnings={earnings?.data || []}/>
                    }
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(Earnings, { maxGroup: 0 });