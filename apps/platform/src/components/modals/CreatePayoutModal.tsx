import { useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";
import getPayouts from "@/api/users/getPayouts";
import { Button } from "../ui/button";
import { Callout } from "../molecules/Callout";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import Tippy from "@tippyjs/react";
import { Asterisk } from "lucide-react";
import createPayout from "@/api/users/createPayout";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";


export default NiceModal.create(() => {

    const modal = useModal();

    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();
    const { user } = useUser();

    const { data: payouts } = useQuery({
        queryKey: ['payouts', '@me'],
        queryFn: async () => await getPayouts() 
    })

    const { getValues, register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: "onChange"
    });

    watch(["amount"]);

    let canCreateNewPayout = (() => {
        if (payouts) {
            return payouts.filter(payout => payout.status === 'PENDING').length === 0
        } return true
    })();
    
    const submitPayout = async (data: any) => {
        modal.hide();

        setLoading(true);
        await createPayout({ amount: data.amount*100 })
        .then((res) => {
            toast.success("Udbetalingen er nu igang");
            queryClient.invalidateQueries(['payouts', '@me']);
            queryClient.invalidateQueries(['user']);
            queryClient.invalidateQueries(['user-balance', `@me`]);
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
        <Modal modal={modal}>
            <div className="flex flex-col gap-1">
                <h3 className="font-medium text-slate-900 text-2xl">Start ny udbetaling</h3>
                <p className="text-gray-700">Her kan du starte en ny udbetaling. Du kan kun have én udbetaling igang ad gangen.</p>
            </div>
            {
                canCreateNewPayout ? (
                    <div>
                        <div>
                            <div className="flex flex-row">
                                <label htmlFor="amount" className="text-md font-medium text-gray-700">Beløb</label>
                                <Tippy content="Dette felt er påkrævet">
                                    <Asterisk className="text-red-700" size={16}/>
                                </Tippy>
                            </div>
                            <div 
                                className={`${errors?.amount?.message ? "border-red-500" : "border-gray-300"} w-full bg-white flex flex-1 items-center py-2 px-4 rounded-md gap-2 group border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:border-transparent`}
                            >
                                <div className="text-gray-500">
                                    DKK
                                </div>
                                <input type="number" {...register("amount", { 
                                    valueAsNumber: true,
                                    required: "Dette felt er påkrævet",
                                    min: {
                                        value: 25.00,
                                        message: "Minimum beløb er 25 DKK"
                                    },
                                    max: {
                                        value: (user?.balance || 0)/100,
                                        message: "Du har ikke nok penge på din balance"
                                    }
                                    })} className="outline-none ring-0 w-full" placeholder="39.95"/>
                            </div>
                            { errors?.amount?.message &&
                                <div className="flex flex-row mt-1">
                                    <p className="text-red-500">{ `${errors?.amount?.message}` }</p>
                                </div>
                            }
                            {getValues('amount') > 0 && (
                                <Callout className="mt-4" color={"gray"} title={"Din udbetaling"}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-row justify-between">
                                            <p className="text-gray-700">Beløb</p>
                                            <p className="text-gray-700">{getValues('amount')} DKK</p>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <p className="text-gray-700">Gebyr (15%)</p>
                                            <p className="text-gray-700">-{getValues('amount')*0.15} DKK</p>
                                        </div>
                                        <hr className="my-2"/>
                                        <div className="flex flex-row justify-between">
                                            <p className="text-gray-700 font-medium">Total</p>
                                            <p className="text-gray-700 font-medium">{getValues('amount')*0.85} DKK</p>
                                        </div>
                                    </div>
                                </Callout>
                            )}
                        </div>
                    </div>
                ) : (
                    <Callout color={"red"} title={"Du kan ikke starte en ny udbetaling"}>
                        <p className="text-slate-900">Du kan kun have én udbetaling igang ad gangen.</p>
                    </Callout>
                )
            }
            <div className="flex justify-end gap-2">
                <Button variant={"ghost"} onClick={() => modal.remove()}>Annuller</Button>
                <Button disabled={!canCreateNewPayout} onClick={handleSubmit((data) => submitPayout(data))} >Start udbetaling</Button>
            </div>
        </Modal>
    )
});

