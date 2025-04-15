import ProfileLayout from "@/layouts/ProfileLayout";
import { useState } from "react";
import UploadFile from "@/components/molecules/UploadFile";
import * as z from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { toast }  from "sonner";
import { ArrowLeft, Asterisk } from "lucide-react";
import Tippy from "@tippyjs/react";
import Link from "next/link";
import React from "react";
import NavigationPrompt from "@/components/atoms/NavigationPrompt";
import withAuth from "@/hoc/withAuth";
import MarkdownEditor from "@/components/organisms/Markdown/MarkdownEditor";
import Meta from "@/layouts/Meta";
import { useQuery } from "@tanstack/react-query";
import getProduct from "@/api/products/getProduct";
import createRelease from "@/api/products/release/createRelease";
import MarkdownGuideModal from "@/components/modals/MarkdownGuideModal";
import NiceModal from "@ebay/nice-modal-react";

const schema = z.object({
    title: z.string().min(1).max(45),
    version: z.string().min(1).max(20),
    resource: z.any(),
    changelog: z.string().min(0).max(2000)
})

function NewRelease(){
    const router = useRouter();
    var { productId } = router.query as { productId: string };
    if(Array.isArray(productId)) productId = productId[0]

    const [requestLoading, setRequestLoading] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);
    
    const { isLoading, isError, data: product } = useQuery({
        queryKey: ["product", productId],
        queryFn: async () => await getProduct({ productId })
    })

    const { register, handleSubmit, watch, getValues, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
    });

    watch([ "title", "version", "resource", "changelog" ]);


    const uploadResource = (file: File | null) => {
        if(file != null) {
            setValue("resource", file);
        } else {
            setValue("resource", null);
        }
    }

    const submit = async (data: FieldValues) => {
        if(requestLoading) return;

        if(data.resource == null || data.resource == '' || typeof data.resource !== "object") return;
        setRequestLoading(true);

        const promise = createRelease({
            productId: productId,
            title: data.title, 
            version: data.version, 
            resource: data.resource,
            changelog: data.changelog
        });
        promise.then((data) => {
            router.push(`/profile/products/${productId}`);
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            setRequestLoading(false);
        })

        toast.promise(promise, {
            loading: "Opretter ny udgivelse...",
            success: "Udgivelse er blevet uploadet!",
            error: "Der skete en fejl, prøv igen senere."
        })

        await promise;
    }

    return (
        <>
            <Meta title={`Udgiv ny version | ${product?.title ? `${product.title} | MCSetups` : "MCSetups"}`}/>
            <ProfileLayout>
                <NavigationPrompt when={requestLoading == false} message="Ændringer, du har foretaget, gemmes muligvis ikke."/>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                        <Link href={`/profile/products/${productId}`} passHref>
                            <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Udgiv ny version {product?.title ? `til ${product.title}` : ""}</h1>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 mt-10 mb-5">
                    <form onSubmit={handleSubmit((data) => submit(data))}>
                        <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <h3 className="text-2xl font-medium mb-4 text-slate-900">Information</h3>
                            <div className="flex flex-col gap-4 justify-start md:flex-row">
                                <div className="flex-1">
                                    <div className="flex flex-row">
                                        <label htmlFor="title" className="text-md font-medium text-gray-700">Titel</label>
                                        <Tippy content="Dette felt er påkrævet">
                                            <Asterisk className="text-red-700" size={16}/>
                                        </Tippy>
                                    </div>
                                    <input {...register("title")} className={`w-full border rounded-md p-2 ${errors?.title?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Epic Bande Plugin - New KOTH Event"/>
                                    <div className="flex flex-row justify-end">
                                        <p className={`${(getValues()?.title?.length || 0) > 45 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.title?.length || 0} / 45`}</p>
                                    </div> 
                                </div>
                                <div className="flex-1 flex flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-row">
                                            <label htmlFor="version" className="text-md font-medium text-gray-700">Version</label>
                                            <Tippy content="Dette felt er påkrævet">
                                                <Asterisk className="text-red-700" size={16}/>
                                            </Tippy>
                                        </div>
                                        <input {...register("version")} className={`w-full border rounded-md p-2 ${errors?.version?.message ? "border-red-500" : "border-gray-300"}`} placeholder="0.0.1-BETA"/>
                                        <div className="flex flex-row justify-end">
                                            <p className={`${(getValues()?.version?.length || 0) > 20 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.version?.length || 0} / 20`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-5 my-5">
                            <div className="relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                                <h3 className="text-2xl font-medium mb-4 text-slate-900">Upload produktet
                                    <span className="font-normal text-base"> (Max 10 MB)</span>
                                </h3>
                                <input type="resource" {...register("resource")} hidden={true}/>
                                <UploadFile fileChange={(files) => uploadResource(files[0])}
                                    description='ZIP, JAR, SK eller SCHEMATIC'
                                    maxSize={10485760*3}
                                />
                            </div>  
                        </div>
                        <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <div className="flex mb-4 gap-4">
                                <div className="flex">
                                    <h3 className="text-2xl font-medium text-slate-900">Changelog</h3>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                </div>
                                <Button variant={"link"} type="button" onClick={() => NiceModal.show(MarkdownGuideModal)}>Guide til styling</Button>
                            </div>
                            <div>
                                <MarkdownEditor value={getValues("changelog")} onChange={(value) => setValue("changelog", value)}/>
                            </div>
                            {
                                errors?.changelog?.message ? (
                                    <div className="flex flex-row justify-between">
                                        <p className="text-red-500">{ `${errors?.changelog?.message}` }</p>
                                        <p className={`${(getValues()?.changelog?.length || 0) > 2000 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.changelog?.length || 0} / 2000`}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-row justify-end">
                                        <p className={`${(getValues()?.changelog?.length || 0) > 2000 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.changelog?.length || 0} / 2000`}</p>
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex justify-center items-center">
                            <Button type="submit" disabled={requestLoading}>
                                Udgiv ny version
                            </Button>
                        </div>
                    </form>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(NewRelease, { verified: true });