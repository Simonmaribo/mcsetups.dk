import { IEarningsGraph } from "@/api/admin/statistics/getEarningsGraph"
import { BarChart } from "@tremor/react"

export default function EarningsGraph({ type, earnings }: { type: 'amount' | 'netVolume' | 'grossVolume', earnings: IEarningsGraph[] }){

    const data = earnings.map((earning) => {
        let newDate = new Date(earning.date)
        return {
            date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`,
            " DKK": earning[type]/100
        }
    })

    return (
        <BarChart
            className="h-96"
            data={data || []} 
            categories={[" DKK"]} 
            index="date"
            colors={["blue"]}
        />
    )
}