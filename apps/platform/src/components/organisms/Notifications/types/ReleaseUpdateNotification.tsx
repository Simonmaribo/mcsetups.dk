import { metadataMatchesType } from "@/lib/notification";
import { Notification, ProductStatus } from "database";
import NotificationBase from "./NotificationBase";
import { Check, X } from "lucide-react";

type Metadata = {
    productId: number,
    releaseId: number,
    releaseTitle: string,
    releaseVersion: string,
    statusUpdate: ProductStatus
}

export default function ReleaseUpdateNotification({ notification }: { notification: Notification}){

    const metadata = notification.metadata as Metadata;
    if(!metadata || metadataMatchesType<Metadata>(
        {
            productId: 0,
            releaseId: 0,
            releaseTitle: "string",
            releaseVersion: "string",
            statusUpdate: "PENDING"
        },
        metadata
    ) == false) return null;

    return (
        <NotificationBase
            id={notification.id}
            icon={metadata.statusUpdate == "APPROVED" ? (
                <div className="overflow-hidden rounded-full h-10 w-10 bg-emerald-100 text-[#064e3b] flex justify-center items-center">
                    <Check/>
                </div>
                ) : (
                <div className="overflow-hidden rounded-full h-10 w-10 bg-rose-100 text-[#881337] flex justify-center items-center">
                    <X/>
                </div>
                )
            }
            text={
                <p className="font-regular">
                    {
                        metadata.statusUpdate == "APPROVED" && (
                            <span className="text-slate-900 font-semibold">Din udgivelse er blevet godkendt</span>
                        )
                    }
                    {
                        metadata.statusUpdate == "REJECTED" && (
                            <span className="text-slate-900 font-semibold">Din udgivelse er blevet afvist</span>
                        )
                    }
                </p>
            }
            subtext={`${metadata.releaseTitle} (${metadata.releaseVersion})`}
            timestamp={notification.createdAt}
            link={
                metadata.statusUpdate == "APPROVED" ?
                `/profile/products/${metadata.productId}` :
                `/profile/products/`
            }
        />
    )
}