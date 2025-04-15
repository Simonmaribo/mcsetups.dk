import { metadataMatchesType } from "@/lib/notification";
import { Notification } from "database";
import NotificationBase from "./NotificationBase";
import { Check, DollarSign } from "lucide-react";

type Metadata = {
    productId: number,
    productName: string,
    productSale: number,
}

export default function FavoriteSaleNotification({ notification }: { notification: Notification}){

    const metadata = notification.metadata as Metadata;
    if(!metadata || metadataMatchesType<Metadata>(
        {
            productId: 0, 
            productName: "string",
            productSale: 0,
        },
        metadata
    ) == false) return null;

    return (
        <NotificationBase
            id={notification.id}
            icon={(
                <div className="overflow-hidden rounded-full h-10 w-10 bg-yellow-100 text-yellow-700 flex justify-center items-center">
                    <DollarSign/>
                </div>
                )
            }
            text={
                <p className="font-regular">
                    <span className="font-semibold">{metadata.productName}</span> er blevet sat på udsalg til <span className="font-semibold">{metadata.productSale/100} kr.</span>
                </p>
            }
            subtext={metadata.productName}
            timestamp={notification.createdAt}
            link={`/products/${metadata.productId}`}
        />
    )
}