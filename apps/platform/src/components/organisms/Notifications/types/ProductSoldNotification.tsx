import { metadataMatchesType } from "@/lib/notification";
import { Notification } from "database";
import NotificationBase from "./NotificationBase";

type Metadata = {
    productId: number,
    productName: string,
    buyerId: number,
    buyerName: string
    buyerAvatar: string
}

export default function ProductSoldNotification({ notification }: { notification: Notification}){

    const metadata = notification.metadata as Metadata;
    if(!metadata || metadataMatchesType<Metadata>(
        {
            productId: 0, 
            productName: "string",
            buyerId: 0, 
            buyerName: "string",
            buyerAvatar: "string" 
        },
        metadata
    ) == false) return null;

    return (
        <NotificationBase
            id={notification.id}
            icon={
                <img src={metadata.buyerAvatar} className="overflow-hidden rounded-full h-10 w-10" alt={metadata.buyerName}/>
            }
            text={
                <p className="font-regular">
                    <span className="font-semibold">{metadata.buyerName}</span> har købt dit produkt.
                </p>
            }
            subtext={metadata.productName}
            timestamp={notification.createdAt}
            link={`/profile/products/${metadata.productId}/purchases`}
        />
    )
}