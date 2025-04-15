import ProfileLayout from "@/layouts/ProfileLayout";
import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react";
import UploadFile from "@/components/molecules/UploadFile";
import * as z from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import createProduct from "@/api/products/change/createProduct";
import { useRouter } from "next/router";
import { toast }  from "sonner";
import { ArrowLeft, Asterisk, Codesandbox, FileCode, Info, Map, Settings } from "lucide-react";
import Tippy from "@tippyjs/react";
import Link from "next/link";
import React from "react";
import NavigationPrompt from "@/components/atoms/NavigationPrompt";
import withAuth from "@/hoc/withAuth";
import MarkdownEditor from "@/components/organisms/Markdown/MarkdownEditor";
import Meta from "@/layouts/Meta";
import { Switch } from "@/components/ui/switch";
import NiceModal from "@ebay/nice-modal-react";
import MarkdownGuideModal from "@/components/modals/MarkdownGuideModal";
import TagInput from "@/components/organisms/TagInput";
import ImageUpload from "@/components/organisms/ImageUpload";

const schema = z.object({
    title: z.string().min(1).max(45),
    type: z.enum(["skript", "plugin", "map", "setup"]),
    skriptVersion: z.string().max(30).optional(),
    licensable: z.boolean().optional(),
    licensePluginName: z.string().max(30).optional(),
    minecraftVersions: z.array(z.string()).min(1),
    tags: z.array(z.string()).max(6),
    price: z.number().min(0).max(1000.0),
    version: z.string().min(1).max(20),
    resource: z.any(),
    banner: z.any(),
    description: z.string().min(0).max(5000),
    brief: z.string().min(0).max(250)
}).refine(data => data.type == 'skript' ? data.skriptVersion != null : true, {
    message: "Du skal angive en skript version",
    path: ["skriptVersion"]
}).refine(data => data.licensable ? data.licensePluginName != null : true, {
    message: "Du skal angive et licens plugin navn",
    path: ["licensePluginName"]
});

const MINECRAFT_VERSIONS = [
    "1.8", "1.9", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.16", "1.17", "1.19"
]

function NewProduct(){

    const { register, handleSubmit, watch, getValues, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched"
    });


    const [requestLoading, setRequestLoading] = useState(false);
    const router = useRouter();
    
    watch([ "title", "version", "banner", "type", "minecraftVersions", "tags", "brief", "description", "licensable", "licensePluginName"]);

    const { user, isLoading, isError } = useUser();
    useEffect(() => {
        if (isError) {
            window.location.href = "/";
        } else if(user && !user.verified) {
            window.location.href = "/profile";
        }
    }, [user, isError])

    if (isLoading || isError || !user || !user.verified) return <LoadingState/>

    const uploadResource = (file: File | null) => {
        if(file != null) {
            setValue("resource", file);
        } else {
            setValue("resource", null);
        }
    }

    const uploadBanner = (file: File | null) => {
        if(file != null) {
            setValue("banner", file);
        } else {
            setValue("banner", null);
        }
    }

    const submit = async (data: FieldValues) => {
        if(requestLoading) return;

        if(data.resource == null || data.resource == '' || typeof data.resource !== "object") return;
        if(data.banner == null || data.banner == '' || typeof data.banner !== "object") return;
        try { JSON.parse(JSON.stringify(data.minecraftVersions)) } catch (e) { return toast.error("Minecraft Versioner ikke gyldig") }
        setRequestLoading(true);

        const promise = createProduct({
            title: data.title, 
            type: data.type, 
            version: data.version, 
            resource: data.resource,
            banner: data.banner,
            description: data.description,
            brief: data.brief,
            skriptVersion: data.skriptVersion,
            licensable: data.licensable,
            licensePluginName: data.licensePluginName,
            minecraftVersions: data.minecraftVersions,
            price: data.price,
            tags: data.tags
        });
        promise.then((data) => {
            router.push(`/profile/products/`);
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            setRequestLoading(false);
        })

        toast.promise(promise, {
            loading: "Uploader produkt...",
            success: "Produktet er blevet uploadet!",
            error: "Der skete en fejl, prøv igen senere."
        })

        await promise;
    }

    return (
        <>
            <Meta title="McSetups | Profil - opret nyt produkt"/>
            <ProfileLayout>
                <NavigationPrompt when={requestLoading == false} message="Ændringer, du har foretaget, gemmes muligvis ikke."/>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                        <Link href={`/profile/products`} passHref>
                            <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Opret et nyt produkt</h1>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 mt-10 mb-5">
                    <form onSubmit={handleSubmit((data) => submit(data))}>
                        <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <h3 className="text-2xl font-medium mb-4 text-slate-900">Produkt information</h3>
                            <div className="flex flex-col gap-4 justify-start md:flex-row">
                                <div className="flex-1">
                                    <div className="flex flex-row">
                                        <label htmlFor="title" className="text-md font-medium text-gray-700">Titel</label>
                                        <Tippy content="Dette felt er påkrævet">
                                            <Asterisk className="text-red-700" size={16}/>
                                        </Tippy>
                                    </div>
                                    <input {...register("title")} className={`w-full border rounded-md p-2 ${errors?.title?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Epic Bande Plugin"/>
                                    <div className="flex flex-row justify-end">
                                        <p className={`${(getValues()?.title?.length || 0) > 45 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.title?.length || 0} / 45`}</p>
                                    </div> 
                                </div>
                                <div className="flex-1 flex flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-row">
                                            <label htmlFor="version" className="text-md font-medium text-gray-700">Produkt Version</label>
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
                                <div>
                                    <div className="flex flex-row">
                                        <label htmlFor="price" className="text-md font-medium text-gray-700">Pris</label>
                                        <Tippy content="Dette felt er påkrævet">
                                            <Asterisk className="text-red-700" size={16}/>
                                        </Tippy>
                                    </div>
                                    <div 
                                        className={`${errors?.price?.message ? "border-red-500" : "border-gray-300"} w-full bg-white flex flex-1 items-center py-2 px-4 rounded-md gap-2 group border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:border-transparent`}
                                    >
                                        <div className="text-gray-500">
                                            DKK
                                        </div>
                                        <input type="number" {...register("price", { valueAsNumber: true })} className="outline-none ring-0" placeholder="39.95"/>
                                    </div>
                                    { errors?.price?.message &&
                                        <div className="flex flex-row">
                                            <p className="text-red-500">{ `${errors?.price?.message}` }</p>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 justify-start md:flex-row">
                                <div className="flex-1">
                                    <div className="flex flex-row">
                                        <label htmlFor="brief" className="text-md font-medium text-gray-700">Kort Beskrivelse</label>
                                        <Tippy content="Dette felt er påkrævet">
                                            <Asterisk className="text-red-700" size={16}/>
                                        </Tippy>
                                    </div>
                                    <textarea {...register("brief")} className={`w-full border rounded-md p-2 ${errors?.brief?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Bande er et enormt konfigurerbart plugin til Prison servere."/>
                                    <div className="flex flex-row justify-end">
                                        <p className={`${(getValues()?.brief?.length || 0) > 250 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.brief?.length || 0} / 250`}</p>
                                    </div> 
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-row">
                                        <label htmlFor="tags" className="text-md font-medium text-gray-700">Keywords</label>
                                    </div>
                                    <TagInput value={getValues("tags") || []} onChange={(value) => setValue("tags", value)} maxTags={6}/>
                                    { errors?.tags?.message &&
                                        <div className="flex flex-row">
                                            <p className="text-red-500">{ `${errors?.tags?.message}` }</p>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="flex flex-row">
                                    <label htmlFor="version" className="text-md font-medium text-gray-700 mb-2">Produkt Type</label>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                    <select {...register("type")} className={`hidden`}>
                                        <option value="skript"/>
                                        <option value="plugin"/>
                                        <option value="map"/>
                                        <option value="setup"/>
                                    </select>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-start md:flex-row">
                                    <div onClick={() => setValue("type", "skript")} className={`flex-1 cursor-pointer rounded-lg border p-5 flex flex-col items-center hover:bg-gray-100 ${getValues('type') == 'skript' ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                                        <FileCode/>
                                        <p className="text-sm">Skript</p>
                                    </div>
                                    <div onClick={() => setValue("type", "plugin")} className={`flex-1 cursor-pointer rounded-lg border p-5 flex flex-col items-center hover:bg-gray-100 ${getValues('type') == 'plugin' ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                                        <Codesandbox/>
                                        <p className="text-sm">Plugin</p>
                                    </div>
                                    <div onClick={() => setValue("type", "map")} className={`flex-1 cursor-pointer rounded-lg border p-5 flex flex-col items-center hover:bg-gray-100 ${getValues('type') == 'map' ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                                        <Map/>
                                        <p className="text-sm">Map</p>
                                    </div>
                                    <div onClick={() => setValue("type", "setup")} className={`flex-1 cursor-pointer rounded-lg border p-5 flex flex-col items-center hover:bg-gray-100 ${getValues('type') == 'setup' ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                                        <Settings/>
                                        <p className="text-sm">Setup</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="flex flex-row">
                                    <label className="text-md font-medium text-gray-700 mb-2">Minecraft Versioner</label>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                </div>
                                <div className="flex flex-wrap justify-start md:flex-row">
                                    { MINECRAFT_VERSIONS.map((version, index) => (
                                        <div 
                                            className="flex-1"
                                            key={`${version}-${index}`} 
                                            onClick={() => {
                                                if (getValues("minecraftVersions")?.includes(version)) {
                                                    setValue("minecraftVersions", [...getValues("minecraftVersions")?.filter((v: string) => v != version)])
                                                } else {
                                                    if(!getValues("minecraftVersions")) setValue("minecraftVersions", [])
                                                    setValue("minecraftVersions", [...getValues("minecraftVersions"), version])
                                                }
                                            }}
                                        >
                                            <div className={`${index == 0 ? 'md:rounded-tl-lg md:rounded-bl-lg' : ''} ${index == MINECRAFT_VERSIONS.length-1 ? 'md:rounded-tr-lg md:rounded-br-lg' : ''} cursor-pointer border p-4 flex flex-col items-center hover:bg-gray-100 ${getValues("minecraftVersions")?.includes(version) ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                                                <p className="text-sm">{version}</p>
                                            </div>
                                        </div>
                                    )) }
                                </div>
                                { errors?.minecraftVersions?.message &&
                                    <div className="flex flex-row">
                                        <p className="text-red-500">{ `${errors?.minecraftVersions?.message}` }</p>
                                    </div>
                                }
                            </div>
                            <div className="flex flex-col gap-4 justify-start md:flex-row">
                                { getValues()?.type == "skript" &&
                                    <div>
                                        <div className="flex flex-row">
                                            <label htmlFor="skriptVersion" className="text-md font-medium text-gray-700">Skript Version</label>
                                            <Tippy content="Dette felt er påkrævet">
                                                <Asterisk className="text-red-700" size={16}/>
                                            </Tippy>
                                        </div>
                                        <input {...register("skriptVersion")} className={`w-full border rounded-md p-2 ${errors?.skriptVersion?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Skript-dev36"/>
                                        { errors?.skriptVersion?.message &&
                                            <div className="flex flex-row">
                                                <p className="text-red-500">{ `${errors?.skriptVersion?.message}` }</p>
                                            </div>
                                        }
                                    </div>
                                } 
                                { getValues()?.type == "plugin" && (
                                    <div className="flex flex-row gap-4">
                                        <div>
                                            <div className="flex flex-row">
                                                <label htmlFor="licensable" className="text-md font-medium text-gray-700">Licensdrevet</label>
                                                <Tippy content="Dette felt er påkrævet">
                                                    <Asterisk className="text-red-700" size={16}/>
                                                </Tippy>
                                            </div>
                                            <div className="mt-1">
                                                <Switch checked={getValues()?.licensable == true} onCheckedChange={(v) => setValue("licensable", v)}/>
                                            </div>
                                        </div>
                                        { getValues()?.licensable == true &&
                                            <div>
                                                <div className="flex flex-row">
                                                    <label htmlFor="licensePluginName" className="text-md font-medium text-gray-700">Licens Plugin Navn</label>
                                                    <Tippy content="Dette felt er påkrævet">
                                                        <Asterisk className="text-red-700" size={16}/>
                                                    </Tippy>
                                                </div>
                                                <input {...register("licensePluginName")} className={`w-full border rounded-md p-2 ${errors?.licensePluginName?.message ? "border-red-500" : "border-gray-300"}`} placeholder="PrisonCells"/>
                                                { errors?.licensePluginName?.message &&
                                                    <div className="flex flex-row">
                                                        <p className="text-red-500">{ `${errors?.licensePluginName?.message}` }</p>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                    )
                                } 
                            </div>
                        </div>
                        <div className="flex flex-row gap-5 my-5">
                            <div className="relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                                <div className="flex">
                                    <h3 className="text-2xl font-medium mb-4 text-slate-900">Upload dit produkt</h3>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                </div>

                                <input type="resource" {...register("resource")} hidden={true}/>
                                <UploadFile fileChange={(files) => uploadResource(files[0])}
                                    description='ZIP, JAR, SK eller SCHEMATIC'
                                    maxSize={10485760*3}
                                    className="h-[200px] aspect-[400/200]"
                                />
                            </div>  
                            <div className="relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                                <div className="flex flex-row items-center gap-2  mb-4">
                                    <div className="flex flex-row">
                                        <h3 className="text-2xl font-medium text-slate-900">Banner</h3>
                                        <Tippy content="Dette felt er påkrævet">
                                            <Asterisk className="text-red-700" size={16}/>
                                        </Tippy>
                                    </div>
                                </div>
                                <div> 
                                    <ImageUpload
                                        className="h-[200px] aspect-[400/200]"
                                        initialImage={getValues("banner")}
                                        onImageCrop={(file) => {
                                            uploadBanner(file);
                                        }}
                                        removable={false}
                                        maxSize={10485760}
                                        aspectRatio={400/200}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <div className="flex mb-4 gap-4">
                                <div className="flex">
                                    <h3 className="text-2xl font-medium text-slate-900">Produkt beskrivelse</h3>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                </div>
                                <Button variant={"link"} type="button" onClick={() => NiceModal.show(MarkdownGuideModal)}>Guide til styling</Button>
                            </div>
                            <div>
                                <MarkdownEditor value={getValues("description")} onChange={(value) => setValue("description", value)}/>
                            </div>
                            <div className="flex flex-row justify-end">
                                <p className={`${(getValues()?.description?.length || 0) > 5000 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.description?.length || 0} / 5000`}</p>
                            </div>
                        </div>
                        <div className="flex justify-center items-center">
                            <Button type="submit" disabled={requestLoading}>
                                Opret produkt
                            </Button>
                        </div>
                    </form>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(NewProduct, { verified: true });