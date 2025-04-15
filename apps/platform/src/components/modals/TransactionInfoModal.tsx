import NiceModal, { useModal } from "@ebay/nice-modal-react"
import Modal from "./Modal"
import { useQuery } from "@tanstack/react-query";
import getTransaction from "@/api/users/getTransaction";
import { PurchasesReponse } from "@/api/users/getPurchases";
import { prettyDate } from "@/lib/date";
import LoadingState from "../atoms/state/LoadingState";

export default NiceModal.create(({ purchase, transactionId }: { purchase: PurchasesReponse, transactionId: number }) => {
    
    const modal = useModal()
    
    const { isLoading, isError, data: transaction } = useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: async() => await getTransaction({ transactionId: parseInt(`${transactionId}`) }),
    })

    return (
        <Modal modal={modal}>
            { (isLoading || isError) ?
                <LoadingState/>
            :  
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-gray-900">Transaktion</p>
                            <p className="text-sm text-gray-900">{purchase.transactionId}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-gray-900">Købt</p>
                            <p className="text-sm text-gray-900">{prettyDate(purchase.createdAt)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-gray-900">Produkt</p>
                            <p className="text-sm text-gray-900">{purchase.product.title}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-gray-900">Pris betalt</p>
                            <p className="text-sm text-gray-900">{transaction.amount/100} DKK</p>
                        </div>
                    </div>
                </div>
            </div>
            }
        </Modal>
    )
})