import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getUnreadNotifications from "@/api/users/notifications/getUnreadNotifications";
import { Notification } from "database";
import ProductSoldNotification from "./types/ProductSoldNotification";
import React from "react";
import ReleaseUpdateNotification from "./types/ReleaseUpdateNotification";
import LoadingState from "@/components/atoms/state/LoadingState";
import readNotifications from "@/api/users/notifications/readNotifications";
import { toast } from "sonner";
import FavoriteSaleNotification from "./types/FavoriteSaleNotification";
import FavoritePriceChangeNotification from "./types/FavoritePriceChangeNotification";

export default function NotificationMenu() {
    
    const queryClient = useQueryClient();

    const [isOpen, setOpen] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const { isLoading, isError, data: notifications } = useQuery({
        queryKey: ['notifications-unread', "@me"],
        queryFn: async() => await getUnreadNotifications(),
        retry: false,
    });

    if(isLoading || isError) {
        return (
            <div className="hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                <div className="relative">
                    <Bell/>
                </div>
            </div>
        )
    }

    const NotificationItem = ({ notification }: { notification: Notification}) => {
        switch(notification.type){
            case "PRODUCT_SOLD":
                return <ProductSoldNotification notification={notification}/>
            case "PRODUCT_RELEASE_UPDATE":
                return <ReleaseUpdateNotification notification={notification}/>
            case "FAVORITE_ON_SALE": 
                return <FavoriteSaleNotification notification={notification}/>
            case "FAVORITE_PRICE_CHANGE":
                return <FavoritePriceChangeNotification notification={notification}/>
            default:
                return null;
        }
    }

    const markAllAsRead = async () => {
        setShowLoading(true);
        await readNotifications({ notificationId: 'all' })
        .then((res) => {
            setShowLoading(false);
            setOpen(false);
            queryClient.invalidateQueries(['notifications-unread', "@me"]);
            toast.success("Alle notifikationer er blevet markeret som læst");
        })
        .catch((err) => {
            toast.error("Kunne ikke markere alle notifikationer som læst");
        })
        .finally(() => {
            setShowLoading(false);
        })
    }

    return (
        <Popover open={isOpen} onOpenChange={(value) => setOpen(value)}>
            <PopoverTrigger>
                <div className="hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                    <div className="relative">
                        <Bell/>
                        {
                            (notifications.length || 0) > 0 ? (
                                <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"/>
                            ) : null
                        }
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-screen sm:w-96 p-0">
                <div className="px-4 py-2 flex flex-row justify-between items-center">
                    <h1 className="text-lg font-bold text-slate-900">Notifikationer</h1>
                    {
                        notifications.length > 0 ? (
                            <Button variant={"link"} onClick={() => markAllAsRead()}>Marker alle som læst</Button>
                        ) : null    
                    }
                </div>
                <hr/>
                {
                    notifications.length == 0 ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <p className="text-slate-900 font-semibold">Her er helt tomt</p>
                            <p className="text-slate-700">Du har ingen notifikationer</p>
                            <Button className="mt-3" variant={"subtle"}>
                                Vis gamle notifikationer
                            </Button>
                        </div>
                    ) : null
                }

                {
                    showLoading ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <LoadingState/>
                        </div>
                    ) : null
                }
                {
                    notifications.length > 0 && showLoading == false ? (
                        <div className="bg-white">
                            <ScrollArea className="h-64 w-full rounded">
                                {
                                    notifications.map((notification) => (
                                        <NotificationItem key={notification.id} notification={notification}/>
                                    ))
                                }
                            </ScrollArea>
                        </div>
                    ) : null
                }
            </PopoverContent>
        </Popover>
      )
}