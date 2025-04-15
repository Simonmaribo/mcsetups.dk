import readNotifications from "@/api/users/notifications/readNotifications"
import { relativeTimeAgoShort } from "@/lib/date"
import Link from "next/link"
import { useRouter } from "next/router"

export default function NotificationBase({
    id,
    icon,
    text,
    subtext,
    timestamp,
    link,
    children
}: {
    id: number
    icon: React.ReactNode
    text: React.ReactNode
    subtext: string
    timestamp: Date,
    link: string,
    children?: React.ReactNode
}){

    const router = useRouter();

    const readNotification = async () => {
        router.push(link);
        await readNotifications({ notificationId: id});
    }

    return (
        <div className="flex gap-4 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-all" onClick={async () => await readNotification()}>
            <div className="overflow-hidden rounded-full h-10 w-10 bg-gray-300">
                {icon}
            </div>
            <div className="flex flex-col flex-1">
                <p className="font-regular">
                    {text}
                </p>
                <p>
                    <span className="text-sm text-slate-700">{relativeTimeAgoShort(timestamp)}</span>
                    <span className="text-gray-300"> • </span>
                    <span className="text-sm text-slate-700">{subtext}</span>
                </p>
            </div>
            {children}
        </div>
    )
}