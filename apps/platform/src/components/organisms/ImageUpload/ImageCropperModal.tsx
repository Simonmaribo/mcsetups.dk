import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modals/Modal";

type ImageCropperModalProps = {
    file: File;
    aspectRatio: number;
}

export default NiceModal.create(({
    file,
    aspectRatio
}: ImageCropperModalProps) => {

    const modal = useModal();

    const cropperRef = useRef<ReactCropperElement>(null);

    async function cancel() {
        modal.reject();
        modal.hide();
    }

    async function confirm() {
        const cropper = cropperRef?.current?.cropper;
        if (!cropper) return cancel();
        let base64 = cropper.getCroppedCanvas().toDataURL();

        let blob = await fetch(base64).then(r => r.blob());

        let fileName = file.name || "image.png";

        let newFile = new File([blob], fileName, { type: "image/png" });
        modal.resolve(newFile);
        modal.hide();
    }

    let fileUrl = URL.createObjectURL(file);

    return (
        <Modal modal={modal} title={"Crop billede"} closeable={false}>
            
            <Cropper ref={cropperRef}
                src={fileUrl}
                aspectRatio={aspectRatio}
                zoomOnWheel={false}
            />
            <div className="justify-end flex gap-2">
                <Button onClick={cancel} variant="subtle">Annuller</Button>
                <Button onClick={confirm}>Crop</Button>
            </div>
        </Modal>
    )
})