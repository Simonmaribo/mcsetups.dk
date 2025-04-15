import { metadataMatchesType } from "@/lib/notification";
import { Notification } from "database";
import NotificationBase from "./NotificationBase";
import { DollarSign } from "lucide-react";

type Metadata = {
    productId: number,
    productName: string,
    productPrice: number,
}

export default function FavoritePriceChangeNotification({ notification }: { notification: Notification}){

    const metadata = notification.metadata as Metadata;
    if(!metadata || metadataMatchesType<Metadata>(
        {
            productId: 0, 
            productName: "string",
            productPrice: 0,
        },
        metadata
    ) == false) return null;

    return (
        <NotificationBase
            id={notification.id}
            icon={(
                <div className="overflow-hidden rounded-full h-10 w-10 bg-emerald-100 text-[#064e3b] flex justify-center items-center">
                    <DollarSign/>
                </div>
                )
            }
            text={
                <p className="font-regular">
                    <span className="font-semibold">{metadata.productName}</span> er blevet sat ned til <span className="font-semibold">{metadata.productPrice/100} kr.</span>
                </p>
            }
            subtext={metadata.productName}
            timestamp={notification.createdAt}
            link={`/products/${metadata.productId}`}
        />
    )
}