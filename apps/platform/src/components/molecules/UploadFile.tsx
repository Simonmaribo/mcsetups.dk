import { formatBytes } from "@/lib/file";
import Tippy from "@tippyjs/react";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { Callout } from "./Callout";
import { cn } from "@/lib/utils";

interface Props {
    fileChange?: (files: File[]) => void;
    maxSize?: number;
    maxFiles?: number;
    accept?: {
        [key: string]: string[];
    },
    description?: string;
    className?: string;
}

export default function UploadFile({
    fileChange = (files: File[]) => {},
    maxSize = 10485760,
    maxFiles = 1,
    accept = {
        "application/zip": ["zip"],
        "application/x-rar-compressed": ["rar"],
        "application/java-archive": ["jar"],        
        "text/plain": ["sk", "schematic", "schem"],
    },
    description,
    className
}: Props){
    const [uploadedFiles, setFiles] = useState<File[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uploadFiles = (files: File[]) => {
        setError(null);
        const validateFiles = (files: File[]): Boolean => {
            if((uploadedFiles?.length || 0) + files.length > maxFiles) {
                setError(`Du kan kun uploade ${maxFiles} fil${maxFiles > 1 ? "er" : ""}`);
                return false;
            }
            if(uploadedFiles != null && uploadedFiles.length > 0){
                for(let i = 0; i < files.length; i++) {
                    for(let j = 0; j < uploadedFiles.length; j++) {
                        if(files[i].name == uploadedFiles[j].name) {
                            setError(`Filen ${files[i].name} er allerede uploadet`);
                            return false;
                        }
                    }
                }
            }

            for(let i = 0; i < files.length; i++) {
                if(files[i].size > maxSize) {
                    setError(`Filen er for stor. Den må max være ${formatBytes(maxSize)}`);
                    return false;
                }
                if(accept != null) {
                    let accepted = false;
                    for(let key in accept) {
                        if(files[i].type == key || files[i].type == ``) {
                            let extensions = accept[key];
                            for(let j = 0; j < extensions.length; j++) {
                                // manuel endsWith
                                let subString = files[i].name.substring(files[i].name.length - extensions[j].length, files[i].name.length);
                                if(subString.toLowerCase() == extensions[j].toLowerCase()) {
                                    accepted = true;
                                    break;
                                }
                            }
                        }
                    }
                    if(!accepted) {
                        setError(`Denne filtype er ikke tilladt.`);
                        return false;
                    }
                }
            }
            return true;
        }
        if(validateFiles(files)) {
            let newFiles = (uploadedFiles == null) ? files : [...uploadedFiles, ...files];

            setFiles(newFiles);
            fileChange(newFiles);
        }
    }

    return (
        <div>
            {error != null && 
                <div className="mb-5">
                    <Callout
                        color={"red"} 
                        title={"Der opstod en fejl"}
                    >{error}</Callout>
                </div>
            }
            {(uploadedFiles == null || (maxFiles > uploadedFiles.length)) && 
                <Dropzone onDrop={acceptedFiles => uploadFiles(acceptedFiles)}>
                    {({getRootProps, getInputProps}) => (
                        <div  {...getRootProps()} className={cn(
                            "rounded-md bg-gray-100 border-2 border-dashed border-slate-400 text-sm hover:bg-gray-200 cursor-pointer transition-all ease-in-out delay-50",
                            className
                        )}>
                            <div className="m-10 flex flex-col gap-4 items-center justify-center">
                                <input {...getInputProps()} />
                                <Upload/>
                                <div className="flex items-center flex-col text-slate-900">
                                    <p className="font-medium text-lg">Vælg en fil <span  className="font-normal">eller træk hertil</span></p>
                                    { description && (<p className="text-sm text-gray-600">{description}</p>)}
                                </div>
                            </div>
                        </div>
                    )}
                </Dropzone>
            }
            { (uploadedFiles != null && uploadedFiles.length >= 0) && uploadedFiles.map((file, index) => ( 
                <div className="flex flex-row justify-between items-center" key={file.name}>
                    <div>
                        <p className="font-medium text-lg">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                    </div>
                    <Tippy content={<span>Fjern fil</span>}>
                        <X onClick={() => {
                            let newFiles = uploadedFiles.filter((uFile) => uFile.name != file.name);
                            setFiles(newFiles);
                            fileChange(newFiles);
                        }} className="cursor-pointer transition-all ease-in-out stroke-red-400 hover:stroke-red-700"/>
                    </Tippy>
                </div>
            ))}
        </div> 
    )
}