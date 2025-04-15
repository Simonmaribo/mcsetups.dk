import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";
import { Button } from "../ui/button";
import deleteRelease from "@/api/products/release/deleteRelease";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default NiceModal.create(({ productId, release }: { 
    productId: string | number;
    release: {
        id: string | number;
        title: string;
    }
}) => {
    
    const modal = useModal();
    const queryClient = useQueryClient();

    const handleDeleteRelease = async (releaseId: string | number) => {
        await deleteRelease({ releaseId })
        .then(() => {
            toast("Udgivelsen er blevet slettet")
            queryClient.invalidateQueries(["product", productId])
        })
        .catch(() => toast.error("Der skete en fejl under sletningen af udgivelsen"))
        .finally(() => modal.remove())
    }

    return (
        <Modal modal={modal}
            title="Slet udgivelse"
            description={<>Er du sikker på at du vil slette udgivelsen <span className="font-medium">{release.title}</span>?</>}
        >
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => modal.remove()}>Annuller</Button>
                <Button variant="destructive" onClick={() => handleDeleteRelease(release.id)}>Slet</Button>
            </div>
        </Modal>
    )
})