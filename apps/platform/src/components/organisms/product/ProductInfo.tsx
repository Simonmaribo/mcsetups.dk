import { ProductResponse } from "@/api/products/getProduct";
import { dateToString } from "@/lib/date";
import BuyOrDownload from "./BuyOrDownload";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MinecraftVersionsBadges from "@/components/molecules/MinecraftVersionsBadges";
import { Check } from "lucide-react";
import Tippy from "@tippyjs/react";
import { Badge } from "@/components/molecules/Badge";

export default function ProductInfo({ product, tab = "showcase", setTab }: { product: ProductResponse, tab?: "showcase" | "versions", setTab?: (tab: "showcase" | "versions") => void }){

    return (
        <div className="flex flex-col gap-2">
            <div className="border shadow rounded-lg flex flex-col overflow-hidden lg:max-w-[400px] bg-white">
                <div className="overflow-hidden rounded-tr-lg rounded-tl-lg">
                    <img src={product.bannerUrl} alt={product.title} className="w-full max-h-[400px] lg:max-h-[200px] object-cover"/>
                </div>
                <div className="p-2">
                    <div className="flex flex-col items-center gap-2 justify-center">
                        <h1 className="text-xl font-bold text-slate-900">{product.title}</h1>
                        <p className="text-sm whitespace-pre-line text-center text-wrap text-gray-500 ">
                            {product.brief}
                        </p>
                        {
                            product.tags && product.tags.length > 0 && (
                                <MinecraftVersionsBadges versions={product.tags}/>
                            )
                        }
                    </div>
                    <div className="w-full flex mt-4">
                        <BuyOrDownload product={product}/>
                    </div>
                    <hr className="my-2"/>
                    <p className="text-sm text-slate-700 text-center">
                        Opdateret { dateToString(new Date(product?.releases[0]?.createdAt))} • Udgivet { dateToString(new Date(product.createdAt))}
                    </p>
                    <div className="flex justify-center">
                        <Button 
                            variant={"link"}
                            onClick={() => setTab?.(tab == "showcase" ? "versions" : "showcase")}
                        >
                            {
                                tab == "versions" ? "Se produkt beskrivelse" : "Se tidligere udgivelser"
                            }
                        </Button>
                    </div>
                </div>
            </div>
            <div className="border p-2 shadow rounded-lg items-center flex flex-col gap-1 overflow-hidden lg:max-w-[400px] bg-white">
                <h1 className="text-lg font-semibold text-slate-900">Testede versioner</h1>
                <MinecraftVersionsBadges versions={product.minecraftVersions}/>
            </div>
            <Link href={`/users/${product.creator.displayName.toLowerCase()}`}>
                <div className="border p-6 shadow rounded-lg items-center flex flex-row overflow-hidden lg:max-w-[400px] bg-white gap-2">
                    <img src={product.creator.avatarUrl} alt={product.creator.displayName} className="w-12 h-12 rounded-full"/>
                    <div>
                        <div className="flex gap-2 items-center">
                            <h1 className="text-lg font-bold">{product.creator.displayName}</h1>
                            { product.creator.verified &&
                                <Tippy content="Verificeret bruger">
                                    <Badge size="xs" color="blue" variant={"subtle"} padding="icon"><Check size={16}/></Badge>
                                </Tippy>
                            }
                        </div>
                    </div>
                </div>
            </Link>
            <Link href={"https://discord.mcsetups.dk"}>
                <div className="bg-[#5865F2] hover:bg-[#4650c1] transition-all shadow rounded-lg p-4 cursor-pointer text-white border flex flex-row gap-4 items-center">
                    <img src="/images/icons/discord.svg" alt="Discord Logo" className="w-10"/>
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold">Tilslut vores Discord</p>
                        <p className="text-sm font-medium">Deltag i Danmarks største udvikler community.</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}