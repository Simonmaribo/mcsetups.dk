import updateProduct from "@/api/products/change/updateProduct";
import getProduct from "@/api/products/getProduct";
import NavigationPrompt from "@/components/atoms/NavigationPrompt";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import MarkdownGuideModal from "@/components/modals/MarkdownGuideModal";
import UploadFile from "@/components/molecules/UploadFile";
import ImageUpload from "@/components/organisms/ImageUpload";
import MarkdownEditor from "@/components/organisms/Markdown/MarkdownEditor";
import TagInput from "@/components/organisms/TagInput";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import ProfileLayout from "@/layouts/ProfileLayout";
import NiceModal from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ArrowLeft, Asterisk, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    title: z.string().min(1).max(45),
    minecraftVersions: z.array(z.string()).min(1),
    price: z.number().min(0).max(1000.0),
    sale: z.number(),
    onSale: z.boolean(),
    banner: z.any(),
    description: z.string().min(1).max(5000),
    brief: z.string().min(1).max(250),
    tags: z.array(z.string()).max(6)
})

const MINECRAFT_VERSIONS = [
    "1.8", "1.9", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.16", "1.17", "1.19"
]

function Edit(){
    const router = useRouter();
    var { productId } = router.query as { productId: string };
    if(Array.isArray(productId)) productId = productId[0]

    const [requestLoading, setRequestLoading] = useState(false);
    const { isLoading, isError, data: product } = useQuery({
        queryKey: ["product", productId],
        queryFn: async () => await getProduct({ productId })
    })

    const { register, handleSubmit, watch, getValues, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
        values: {
            title: product?.title,
            minecraftVersions: product?.minecraftVersions || [],
            tags: product?.tags || [],
            price: (product?.price || 0) / 100,
            brief: product?.brief,
            banner: null,
            description: product?.description,
            sale: ((product?.sale || -1) >= 0 ? (product?.sale || -1) : 0) / 100,
            onSale: (product?.sale != undefined && product?.sale >= 0)
        }
    });


    watch([ "title", "price", "sale", "onSale", "banner", "brief", "minecraftVersions", "tags", "description"]);

    const uploadBanner = (file: File | null) => {
        if(file != null) {
            // @ts-ignore
            setValue("banner", file);
        } else {
            setValue("banner", null);
        }
    }

    if(isLoading) return <div className="h-screen"><LoadingState/></div>
    if(isError) return <div className="h-screen"><ErrorState message="Der skete en fejl under indlæsning af produktet."/></div>

    const submit = async (data: any) => {
        if(requestLoading) return;

        try { JSON.parse(JSON.stringify(data.minecraftVersions)) } catch (e) { return toast.error("Minecraft Versioner ikke gyldig") }
        setRequestLoading(true);

        const promise = updateProduct({
            currentProduct: product,
            newProduct: {
                title: data.title, 
                banner: data.banner,
                description: data.description,
                brief: data.brief,
                minecraftVersions: data.minecraftVersions,
                tags: data.tags || [],
                price: data.price,
                sale: (data.onSale && data.sale >= 0) ? data.sale : -1
            }
        });
        promise.then((data) => {
            router.push(`/profile/products/${productId}`);
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            setRequestLoading(false);
        })

        toast.promise(promise, {
            loading: "Opdaterer produkt...",
            success: "Produktet er blevet opdateret!",
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
                        <Link href={`/profile/products/${productId}`} passHref>
                            <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Rediger {product.title}</h1>
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
                                    <textarea {...register("brief")} className={`w-full border rounded-md p-2 ${errors?.brief?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Bande er et af de bedste og mest avanceret plugins på markedet."/>
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
                            <div>
                                <div className="flex flex-row">
                                    <label htmlFor="sale" className="text-md font-medium text-gray-700">Rabatpris</label>
                                    <Tippy content="Dette felt er påkrævet">
                                        <Asterisk className="text-red-700" size={16}/>
                                    </Tippy>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <Switch
                                        className="mt-2"
                                        onCheckedChange={(checked: boolean) => {
                                            setValue("onSale", checked)
                                        }}
                                        checked={getValues()?.onSale}
                                    />
                                    <div className={`${getValues().onSale ? 'flex flex-col' : 'hidden'}`}>
                                        <div 
                                            className={`${errors?.sale?.message ? "border-red-500" : "border-gray-300"} bg-white flex flex-1 items-center py-2 px-4 rounded-md gap-2 group border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:border-transparent`}
                                        >
                                            <div className="text-gray-500">
                                                DKK
                                            </div>
                                            <input type="number" {...register("sale", { 
                                                valueAsNumber: true,
                                                max: {
                                                    value: getValues()?.price-1,
                                                    message: "Rabatpris kan ikke være større end pris"
                                                },
                                                min: {
                                                    value: 0,
                                                    message: "Rabatpris kan ikke være mindre end 0"
                                                }
                                                })} className="outline-none ring-0 flex-1 " placeholder="29.95"/>
                                        </div>
                                        { errors?.sale?.message &&
                                            <div className="flex flex-row">
                                                <p className="text-red-500">{ `${errors?.sale?.message}` }</p>
                                            </div>
                                        }
                                        {
                                            getValues()?.onSale && getValues()?.price && getValues()?.sale > getValues()?.price &&
                                            <div className="flex flex-row">
                                                <p className="text-red-500">Rabatpris kan ikke være større end pris</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-5 my-5">
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
                                        initialImage={product.bannerUrl}
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
                                <MarkdownEditor value={getValues("description") || ""} onChange={(value) => setValue("description", value)}/>
                            </div>
                            <div className="flex flex-row justify-end">
                                <p className={`${(getValues()?.description?.length || 0) > 5000 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.description?.length || 0} / 5000`}</p>
                            </div>
                        </div>
                        <div className="flex justify-center items-center">
                            <Button type="submit" disabled={requestLoading}>
                                Gem ændringer
                            </Button>
                        </div>
                    </form>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(Edit, { verified: true });