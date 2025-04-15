import { ComparisonData } from "@/api/admin/statistics/getComparisonGraph"
import { LineChart } from "@tremor/react"

export default function ComparisonGraph({ type1, type2, comparisonData }: { 
    type2: 'argonClicks' | 'argonDownloads', 
    type1: 'mcsetupsViews' | 'mcsetupsDownloads',
    comparisonData: ComparisonData[] 
}){

    const getCategoryName = (type: 'mcsetupsViews' | 'mcsetupsDownloads' | 'argonClicks' | 'argonDownloads') => {
        switch(type){
            case 'mcsetupsViews': return 'McSetups Clicks'
            case 'mcsetupsDownloads': return 'McSetups Downloads'
            case 'argonClicks': return 'Argon Clicks'
            case 'argonDownloads': return 'Argon Downloads'
        }
    }

    const data = comparisonData.map((comparison: ComparisonData) => {
        let newDate = new Date(comparison.date)
        return {
            [getCategoryName(type1)]: comparison[type1],
            [getCategoryName(type2)]: comparison[type2],
            date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`
        }
    })

    return (
        <LineChart
            className="h-96"
            data={data || []} 
            categories={[getCategoryName(type1),getCategoryName(type2)]} 
            index="date"
            colors={["blue", "emerald"]}
        />
    )
}