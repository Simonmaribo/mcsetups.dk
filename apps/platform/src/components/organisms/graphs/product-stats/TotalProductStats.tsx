import { LineChart } from "@tremor/react"
import { ProductHistoryStat } from "database"

export default function TotalProductStats({ stats }: { stats: ProductHistoryStat[] }) {


    let data = stats.map((stat: ProductHistoryStat) => {

        let newDate = new Date(stat.date)
        return {
            "Visninger": stat.views,
            "Køb": stat.purchases,
            "Downloads": stat.downloads,
            date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`
        }
    })

    return (
        <LineChart
            className="h-96"
            data={data || []} 
            categories={[
                "Visninger", "Køb", "Downloads"
            ]}
            index="date"
            colors={["blue", "emerald", "red"]}
        />
    )
}