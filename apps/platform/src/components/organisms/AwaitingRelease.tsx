import { dateToFullString, relativeTimeAgo, timeDifference } from "@/lib/date";
import Tippy from "@tippyjs/react";
import { ProductRelease, ReleaseStatusUpdate } from "database";
import { ClockIcon } from "lucide-react";
import { Badge } from "../molecules/Badge";
import Link from "next/link";

export default function AwaitingRelease({ release }: {release: ProductRelease & { statusUpdate: ReleaseStatusUpdate | null }}) {
    return (
        <Link href={`/profile/products/${release.productId}`}>
            <div className="mt-2 mr-4">
                <div className="p-2 rounded-md border border-slate-100 bg-gray-50">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row gap-1 items-center">
                            <h1 className="font-medium text-xl text-slate-800">{release.title}</h1>
                            <p className="text-base text-gray-500">{release.version}</p>
                        </div>
                        { release.status === "PENDING" && 
                            <Tippy content={`Afventet i ${timeDifference(new Date(), release.createdAt)}`}>
                                <Badge color="orange" size="sm" leadingContent={<ClockIcon size={14}/>}>
                                    Afventer
                                </Badge>
                            </Tippy>
                        }
                    </div>
                    { (release.status === "REJECTED" && release.statusUpdate) && (
                        <div className="mt-2 text-center rounded py-1 px-4 bg-[#FFF5EE] border border-[#FDD5BC]">
                            <p className="text-base text-[#ED6C55]">Nyt produkt afvist</p>
                            <p className="text-sm text-[#01001F]">{ release.statusUpdate.message}</p>
                            <Tippy content={<span>{dateToFullString(release.statusUpdate.createdAt)}</span>}>
                                <p className="mt-2 text-sm font-medium">{relativeTimeAgo(release.statusUpdate.createdAt)}</p>
                            </Tippy>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}