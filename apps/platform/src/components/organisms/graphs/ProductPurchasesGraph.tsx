import getPurchases from "@/api/products/graph/getPurchases"
import { useQuery } from "@tanstack/react-query"
import { BarChart } from "@tremor/react"

export default function ProductPurchasesGraph({ productId, }: { productId: string | number}){

    const { data: purchases } = useQuery({
        queryKey: ["purchases-graph", productId],
        queryFn: async () => await getPurchases({ productId })
    })

    let purchasesData = purchases?.map((purchase) => {
        let newDate = new Date(purchase.date)
        return {
            date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`,
            "Køb": purchase.purchases
        }
    })

    return (
        <BarChart
            className="h-96"
            data={purchasesData || []} 
            categories={["Køb"]} 
            index="date"
            colors={["blue"]}
        />
    )
}