import getSaleTransactions from "@/api/users/graph/getSaleTransactions"
import { useQuery } from "@tanstack/react-query"
import { BarChart } from "@tremor/react"

export default function UserIncomeGraph({ userId = '@me' }: { userId?: string | number } = {}){

    const { data: transactions } = useQuery({
        queryKey: ["transaction-sales-graph", userId],
        queryFn: async () => await getSaleTransactions()
    })

    let transactionsData = transactions?.map((transaction) => {
        let newDate = new Date(transaction.date)
        return {
            date: `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`,
            " DKK": transaction.amount/100
        }
    })

    return (
        <BarChart
            className="h-96"
            data={transactionsData || []} 
            categories={[" DKK"]} 
            index="date"
            colors={["blue"]}
        />
    )
}