import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import updateStatus from "@/api/admin/releases/updateStatus";

export default function HandleRelease({ release }: { release: { id: number, title: string, version: string, createdAt: Date }}){

    const queryClient = useQueryClient()
    const [isOpen, setOpen] = useState<string>();

    const handleReject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        form.reset();

        setOpen('');
        if(!data.comment || typeof data.comment !== 'string') return toast.error("Du skal skrive en kommentar til udvikleren")
        await updateStatus({ id: release.id, status: 'REJECTED', comment: data.comment })
        .then(() => toast.success("Udgivelsen blev afvist", { description: "Udgivelsen blev afvist og udvikleren er blevet notificeret"}))
        .catch(() => toast.error("Der skete en fejl, prøv igen senere"))
        .finally(() => {
            queryClient.invalidateQueries({ queryKey: ['release', `${release.id}`]})
        })
    }

    const handleApprove = async () => {
        setOpen('');
        await updateStatus({ id: release.id, status: 'APPROVED' })
        .then(() => toast.success("Udgivelsen blev godkendt", { description: "Udgivelsen blev godkendt og udvikleren er blevet notificeret"}))
        .catch(() => toast.error("Der skete en fejl, prøv igen senere"))
        .finally(() => {
            queryClient.invalidateQueries({ queryKey: ['release', `${release.id}`]})
        })
    }

    return (
        <div className="flex gap-4">
            <Dialog open={isOpen == 'REJECT'} onOpenChange={(open) => setOpen('')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Afvis udgivelse</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReject}>
                        <textarea 
                            name="comment"
                            className={`w-full m-h-8 border rounded-md p-2 border-gray-300`}
                            placeholder="Skriv en kommentar til udvikleren..."
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit" variant={"subtle-destructive"}>Bekræft</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Tippy content="Afvis udgivelse">
                <Button variant="subtle-destructive" onClick={() => setOpen("REJECT")}>
                    <X/>
                </Button>
            </Tippy>

            <Dialog open={isOpen == 'APPROVE'} onOpenChange={(open) => setOpen('')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accepter udgivelse</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="submit" variant={"subtle-success"} onClick={() => handleApprove()}>Godkend</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Tippy content="Accepter & udgiv release">
                <Button variant="subtle-success"  onClick={() => setOpen("APPROVE")}>
                    <Check/>
                </Button>
            </Tippy>

        </div>
    )
}