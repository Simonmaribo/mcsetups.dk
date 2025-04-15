import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import Link from "next/link";
import { useRouter } from "next/router";
import DefaultLayout from "./DefaultLayout";
const tabs = [
    { name: "Dashboard", href: "/dashboard", maxGroup: 1 },
    { name: "Brugere", href: "/dashboard/users", maxGroup: 1 },
    { name: "Produkter", href: "/dashboard/products", maxGroup: 1 },
    { name: "Udbetaling", href: "/dashboard/payout", maxGroup: 0 },
    { name: "Salg", href: "/dashboard/purchases", maxGroup: 0 },
    { name: "Indtægter", href: "/dashboard/statistics/earnings", maxGroup: 0 },
    { name: "Sammenligning", href: "/dashboard/statistics/comparison", maxGroup: 1 },
]

export default function AdminLayout({ 
    size = "xl",
    bgColor = "gray-50",
    children 
}: { size?: string, bgColor?: string, children: React.ReactNode }){

    const { user, isLoading, isError } = useUser();
    const router = useRouter();

    if (isError || !user) return <ErrorState/>;

    const tab = tabs.find(tab => tab.href === router.asPath.split("?")[0].split("/").slice(0, 3).join("/"));
    const canView = tab?.maxGroup ? user.group <= tab.maxGroup : true;
    
    return (
        <DefaultLayout size={size} bgColor={bgColor}>
            <div className="border-b border-gray-200 bg-white">
                <div className={`mx-auto max-w-screen-${size} px-2.5 md:px-20`}>
                    <div className="-mb-0.5 flex h-12 items-center justify-start space-x-2">
                        {(!isLoading && user) && tabs.map(({ name, href, maxGroup }) => {
                            if(maxGroup && user.group > maxGroup) return null;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`border-b-2 p-1 ${
                                        router.asPath.split("?")[0].split("/").slice(0, 3).join("/") ===
                                        href
                                        ? "border-black text-black"
                                        : "border-transparent text-gray-600 hover:text-black hover:border-black/20"
                                    }`}
                                >
                                    <div className="rounded-md px-3 py-2 transition-all duration-75">
                                        <p className="text-sm">{name}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
            {isLoading && <LoadingState/>}
            { (!isLoading && user && canView) ? children : null }
        </DefaultLayout>
    )
}