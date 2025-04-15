import getRelease from "@/api/products/release/getRelease";
import { dateToString } from "@/lib/date";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Integration, Payout, ProductStatus } from "database";
import { Badge } from "../molecules/Badge";
import { Callout } from "../molecules/Callout";
import Markdown from "../organisms/Markdown/Markdown";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";
import LoadingState from "../atoms/state/LoadingState";
import { PendingPayout } from "@/api/admin/payouts/getPendingPayouts";
import { Asterisk, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import Tippy from "@tippyjs/react";
import { useState } from "react";
import confirmPayout from "@/api/admin/payouts/confirmPayout";

export default NiceModal.create(({ payout }: { payout: PendingPayout }) => {
    
    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();
    const modal = useModal()

    const { getValues, register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: "onChange"
    });

    watch(["transactionId"]);

    // @ts-ignore
    const paypalIntegrationData: {
        payerId: string;
        email: string;
    } = payout.user.integrations.find((integration) => integration.type === 'PAYPAL')?.data;

    const submitPayout = async (data: any) => {
        modal.hide();

        setLoading(true);
        await confirmPayout({ payoutId: payout.id, transactionId: data.transactionId })
        .then((res) => {
            toast.success("Udbetaling er blevet bekræftet");
            queryClient.invalidateQueries(['payouts', 'pending']);
        })
        .catch((err) => {
            console.log(err);
            toast.error(err?.error || "Der skete en fejl");
        }).finally(() => {
            setLoading(false);
            modal.remove();
        })
    }

    if(loading){
        return (
            <div className="w-screen h-screen flex justify-center items-center z-50 fixed top-0 left-0 bg-black bg-opacity-50">
                <div className="flex flex-col gap-2 items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"/>
                </div>
            </div>
        )
    }

    return (
        <Modal modal={modal}
            title={`Udbetaling #${payout.id}`}
        >
            <Callout color={"gray"} title={"Udbetalingsinformationer"}>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Beløb</span>
                        <span className="text-sm text-gray-900">{payout.amount/100} DKK</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Payer ID (paypal ID)</span>
                        <div className="flex gap-1 items-center">
                            <span className="text-sm text-gray-900">{paypalIntegrationData?.payerId || "Ikke integreret"}</span>
                            <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                onClick={() => {
                                    navigator.clipboard.writeText(paypalIntegrationData?.payerId || "Ikke integreret");
                                    toast('Kopieret!', { description: 'Brugerens Paypal ID er blevet kopieret til udklipsholderen.' })
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Paypal Email</span>
                        <div className="flex gap-1 items-center">
                            <span className="text-sm text-gray-900">{paypalIntegrationData?.email || "Ikke integreret"}</span>
                            <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                onClick={() => {
                                    navigator.clipboard.writeText(paypalIntegrationData?.email || "Ikke integreret");
                                    toast('Kopieret!', { description: 'Brugerens Paypal Email er blevet kopieret til udklipsholderen.' })
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Callout>

            <div>
                <div>
                    <div className="flex flex-row">
                        <label htmlFor="transactionId" className="text-md font-medium text-gray-700">Transaction ID</label>
                        <Tippy content="Dette felt er påkrævet">
                            <Asterisk className="text-red-700" size={16}/>
                        </Tippy>
                    </div>
                    <div 
                        className={`${errors?.transactionId?.message ? "border-red-500" : "border-gray-300"} w-full bg-white flex flex-1 items-center py-2 px-4 rounded-md gap-2 group border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:border-transparent`}
                    >
                        <input type="text" {...register("transactionId", { 
                            required: "Dette felt er påkrævet",
                            })} className="outline-none ring-0 w-full"/>
                    </div>
                    { errors?.transactionId?.message &&
                        <div className="flex flex-row mt-1">
                            <p className="text-red-500">{ `${errors?.transactionId?.message}` }</p>
                        </div>
                    }
                </div>
            </div>
            <hr/>
            <div className="flex justify-end gap-2">
                <Button variant={"ghost"} onClick={() => modal.remove()}>Annuller</Button>
                <Button onClick={handleSubmit((data) => submitPayout(data))} >Bekræft udbetaling</Button>
            </div>
        </Modal>
    )
})