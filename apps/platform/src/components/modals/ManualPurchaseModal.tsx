import NiceModal, { useModal } from "@ebay/nice-modal-react"
import Modal from "./Modal"
import { useState } from "react";
import addManualPurchase from "@/api/products/addManualPurchase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default NiceModal.create(({ productId }: { productId: string }) => {
    
    const modal = useModal()
    const queryClient = useQueryClient();

    const [userId, setUserId] = useState<string>("");

    const addPurchase = async () => {
        if(!userId) {
            toast.error("Du skal indtaste en bruger ID");
            return;
        }
        await addManualPurchase({ productId, userId: userId})
        .then(() => {
            queryClient.invalidateQueries(["product", productId, "purchases"]);
            toast.success("Du har manuelt tilføjet et køb til produktet");
        })
        .catch((err) => {
            console.log(err);
            toast.error(err?.error || "Der skete en fejl");
        }).finally(() => {
            modal.hide();
            modal.remove();
        })
    }

    return (
        <Modal modal={modal}
            title="Tilføj Køb"
            description="Tilføjet et manuelt køb, hvis du har solgt et produkt uden at brugeren har købt det igennem McSetups eller blot ønsker at give gratis adgang til en bruger."
        >
            <div className="mt-4">
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                    Bruger
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="user"
                        id="user"
                        className="w-full border rounded-md p-2 shadow-sm sm:text-sm border-gray-300"
                        placeholder="Bruger ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <p className="text-sm text-gray-500">Indtast brugerens ID eller discord ID</p>
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost">Annuller</Button>
                <Button onClick={() => addPurchase()}>Tilføj</Button>
            </div>
        </Modal>
    )
})