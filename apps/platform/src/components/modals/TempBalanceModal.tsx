import NiceModal, { useModal } from "@ebay/nice-modal-react"
import Modal from "./Modal"
import { getBalanceResponse } from "@/api/users/getBalance";
import { Callout } from "../molecules/Callout";
import { timeDifference } from "@/lib/date";

export default NiceModal.create(({ balance }: { balance: getBalanceResponse }) => {
    
    const modal = useModal()

    return (
        <Modal modal={modal}>
            <div className="flex flex-col gap-2">
                <h3 className="font-medium text-slate-900">Snart tilgængelige penge</h3>
                {
                    balance.tempBalance.length <= 0 ?(
                        <Callout title="Ingen afventende penge" color="red">
                            Du har ingen penge på vej til din konto.
                        </Callout>
                    )
                    : (
                        <div className="flex flex-col gap-2">
                            <p className="text-slate-900">Der er <span className="font-medium">{balance.tempBalance.map((item) => item.amount).reduce((a, b) => a + b, 0)/100} DKK</span> på vej til din konto.</p>
                            {
                                balance.tempBalance.map((item) => (
                                    <div className="rounded-lg flex justify-between bg-gray-100 px-4 py-2">
                                        <p className="text-emerald-500">{item.amount/100} DKK</p>
                                        <p className="text-sm text-slate-900">Modtager om <span className="font-medium">{timeDifference(item.availableAt, new Date())}</span></p>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </Modal>
    )
})