import purchaseFunds from "@/api/users/purchaseFunds";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Button, DivButton } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import Tippy from "@tippyjs/react";
import { Asterisk } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    amount: z.number().min(10.00, {
        message: "Du kan minimum indsætte 10 kr."
    }).max(1000.00, {
        message: "Du kan maksimum indsætte 1000 kr."
    })
})

export default function PurchaseFunds() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched"
    });

    async function submit(data: any) {
        setLoading(true);
        await purchaseFunds({ amount: data.amount*100 })
        .then((res) => {
            window.location.href = res.link;
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
            toast.error(err.error || "Der skete en fejl");
        })
    }

    // return whole screen loading overlay 
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="text-white">Vent venligst...</p>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={(value) => setModalOpen(value)}>
            <DialogTrigger>
                <DivButton className="px-4 py-1" size="none" variant="subtle-success"><span>Indsæt <span className="hidden lg:inline"> penge</span></span></DivButton>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Indsæt penge</DialogTitle>
                    <DialogDescription>
                        Indsæt penge på din konto. Du kan minimum indsætte 10 kr.
                    </DialogDescription>
                    <div>
                        <div className="flex flex-row mb-1">
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
                            <input type="number" {...register("amount", { valueAsNumber: true })} className="outline-none ring-0 w-full" placeholder="39.95"/>
                        </div>
                        { errors?.amount?.message &&
                            <div className="flex flex-row mt-1">
                                <p className="text-red-500">{ `${errors?.amount?.message}` }</p>
                            </div>
                        }
                    </div>
                    <DivButton onClick={handleSubmit((data) => submit(data))}>Fortsæt til PayPal</DivButton>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
    
}