import { BarChart } from "@tremor/react"
import { ProductHistoryStat } from "database"

export default function ProductStatsGraph({ stats, type }: { stats: ProductHistoryStat[], type: "views" | "purchases" | "downloads" }) {

    let data = stats.map((stat: ProductHistoryStat) => {

        let newDate = new Date(stat.date)
        let obj = { date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}` }
        switch(type){
            case "views":
                return { ...obj, "Visninger": stat.views }
            case "purchases":
                return { ...obj, "Køb": stat.purchases }
            case "downloads":
                return { ...obj, "Downloads": stat.downloads }
        }
    })

    const category = type === "views" ? "Visninger" : type === "purchases" ? "Køb" : "Downloads"

    return (
        <BarChart
            className="h-96"
            data={data || []} 
            categories={[category]} 
            index="date"
            colors={["blue"]}
        />
    )
}