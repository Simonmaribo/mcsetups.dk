import { Image, Trash } from "lucide-react";
import { useState } from "react";
import Dropzone from "react-dropzone";
import ImageCropperModal from "./ImageCropperModal";
import NiceModal from "@ebay/nice-modal-react";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
    initialImage?: string; // The current image URL
    aspectRatio?: number; // The aspect ratio of the image
    maxSize?: number; // The maximum size of the image in bytes
    removable?: boolean; // Whether the image can be removed
    onImageCrop: (file: File | null) => void; // Called when the image is cropped
    className?: string;
}

type STEP = "upload" | "crop" | "preview";

export default function ImageUpload({
    initialImage,
    aspectRatio = 1/1,
    maxSize = 1024 * 1024 * 5,
    removable = true,
    onImageCrop,
    className,
}: ImageUploadProps){

    const [step, setStep] = useState<STEP>(initialImage ? "preview" : "upload");
    const [image, setImage] = useState<string | File>(initialImage || "");

    function onDrop(acceptedFiles: File[]){
        if(!acceptedFiles || acceptedFiles?.length == 0) return;
        let file = acceptedFiles[0];
        if(!file) return;

        setStep("crop");

        NiceModal.show(ImageCropperModal, {
            file,
            aspectRatio
        })
            .then((file: any) => {
                onImageCrop(file);
                setImage(file);
                setStep("preview");
            })
            .catch(() => {
                setStep("upload");
            })
    }

    function onImageRemove(){
        setStep("upload");
        if(removable) onImageCrop(null);
    }

    function onImageUndo(){
        setStep("preview");
        if(removable){
            if(image instanceof File) onImageCrop(image);
            else {
                onImageCrop(new File([], image));
            }
        }
    }

    if(step == "upload" || step == "crop"){
        return (
            <div>
                <Dropzone 
                    disabled={step == "crop"}
                    maxSize={maxSize} 
                    accept={{
                        "image/png": [".png"],
                        "image/jpeg": [".jpg", ".jpeg"],
                    }}
                    maxFiles={1}
                    onDrop={onDrop}
                >
                    {({getRootProps, getInputProps}) => (
                        <div  {...getRootProps()} className={cn(
                            "rounded-md bg-gray-100 border-2 border-dashed border-slate-400 text-sm hover:bg-gray-200 cursor-pointer transition-all ease-in-out delay-50",
                            step == "crop" && "opacity-50 hover:bg-gray-200 cursor-not-allowed",
                            className
                        )}>
                            <div className="p-1 w-full h-full flex flex-col gap-4 items-center justify-center">
                                <input {...getInputProps()} />
                                <Image size={30}/>
                                <div className="flex items-center flex-col text-slate-900">
                                    <p className="font-medium text-lg">Vælg en fil <span  className="font-normal">eller træk hertil</span></p>
                                    <p className="text-sm text-gray-600">PNG eller JPG</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Dropzone>
                {
                    image && (
                        <p className="text-sm font-semibold text-slate-700 mt-2">
                            Billed fjernet. <span className="text-slate-900 cursor-pointer hover:underline" onClick={onImageUndo}>Fortryd</span>
                        </p>
                    )
                }
            </div>
        )
    } 
    if(step == "preview"){
        return (
            <div className={cn("group relative border border-slate-400 bg-gray-200 rounded", className)}>
                <img src={
                    typeof image == "string" ? image : URL.createObjectURL(image)
                } className="rounded-md"/>
                <button className="hidden drop-shadow-lg group-hover:flex absolute rounded bg-rose-900 p-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                    onClick={onImageRemove}>
                    <Trash className="text-white" size={16}/>
                </button>
            </div>
        )
    }

    return null;
}