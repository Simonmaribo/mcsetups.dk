import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Button, DivButton } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import editUser from "@/api/admin/users/editUser";
import { toast } from "sonner";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";

type User = {
    discordId: string;
    displayName: string;
    email: string;
    discordName: string;
    id: number;
    avatarUrl: string;
    createdAt: Date;
    lastLogin: Date;
    verified: boolean;
    group: number;
}

const schema = z.object({
   verified: z.boolean(),
})

export default NiceModal.create(({ user }: { user: User }) => {

    const modal = useModal()

    const { getValues, setValue, watch, register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            verified: user.verified,
        }
    });
    
    watch(["verified"])

    async function submit(data: any) {
        await editUser({ userId: user.id, verified: data.verified })
        .then(() => {
            toast.success("Bruger opdateret")
            window.location.reload()
        }).catch((err) => {
            toast.error(err?.message || "Der skete en fejl")
        }).finally(() => {
            modal.hide();
            modal.remove();
        })

    }

    return (
        <Modal modal={modal}
            title={`Bruger: ${user.displayName}`}
        >
            <div className="p-1 flex flex-col gap-1">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <h3 className="font-medium text-slate-900">Verificeret</h3>
                        <p className="text-gray-500 text-sm">Skal brugeren have adgang til at upload produkter?</p>
                    </div>
                    <Switch
                        onCheckedChange={(checked) => {
                            setValue("verified", checked)
                        }}
                        checked={getValues()?.verified}
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <Button onClick={handleSubmit((data) => submit(data))}>Gem</Button>
                </div>
            </div>
    
        </Modal>
    )
})