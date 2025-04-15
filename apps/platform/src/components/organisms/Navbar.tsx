import Image from "next/image";

import useUser from "@/hooks/useUser";
import Link from "next/link";
import ProfileDropdown from "../molecules/ProfileDropdown";
import { ArrowRight, Bell, Codesandbox, FileCode, Heart, HeartHandshake, Mail, Map, Search, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import NotificationMenu from "./Notifications/NotificationMenu";
import useFavorites from "@/hooks/useFavorites";
import { BsHeart } from "react-icons/bs";

const NavbarLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    return (
        <Link className="cursor-pointer rounded-full py-2 px-4 text-sm lg:text-base font-medium text-slate-900 hover:bg-blue-100 hover:text-blue-900 transition-all delay-50" href={href}>
            <div className="flex flex-row gap-2">
                {children}          
            </div>
        </Link>
    )
};

export default function Navbar({
    size = "xl"
}){

    const { user } = useUser();
    const { favorites } = useFavorites();

    const Login = () => {
        const currentUrl = (typeof window === "undefined") ? "" : encodeURIComponent(window.location.href);
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login?page=${currentUrl}`
    }
    
    const router = useRouter();
    const loadingRef = useRef(null);

    useEffect(() => {

        const handleRouteChange = (url: string, { shallow }: { shallow: boolean }) => {
            if(!router.isReady || shallow) return;
            // @ts-ignore
            loadingRef?.current?.continuousStart();
            return;
        }

        const handleRouteComplete = (url: string, { shallow }: { shallow: boolean }) => {
            if(!router.isReady || shallow) return;
            // @ts-ignore
            loadingRef?.current?.complete();
            return;
        }

        router.events.on("routeChangeStart", handleRouteChange);
        router.events.on("routeChangeComplete", handleRouteComplete);

        return () => {
            router.events.off("routeChangeStart", handleRouteChange);
            router.events.off("routeChangeComplete", handleRouteComplete);
        }
    }, []);

    return (
        <div className="flex flex-col">
            <LoadingBar ref={loadingRef} color="#0050ff"/>
            <header className="py-4 bg-white">
                <div className={`mx-auto max-w-screen-${size} px-2.5 md:px-20`}>
                    <nav className="relative z-50 flex justify-between">
                        <div>
                            <Link aria-label="Home" href="/" passHref>
                                <img src="/mcsetups-logo.png" alt="Logo" className="h-10 w-auto cursor-pointer"/>
                            </Link>
                        </div>
                        <div className="hidden md:flex md:gap-x-6">
                            <NavbarLink href="/products">
                                <Codesandbox/>
                                Udforsk produkter
                            </NavbarLink>
                            <NavbarLink href="/users">
                                <Users/>
                                Udviklere
                            </NavbarLink>
                            <NavbarLink href="/about">
                                <HeartHandshake/>
                                Om Os
                            </NavbarLink>
                        </div>
                        <div className="flex items-center gap-x-2 md:gap-x-4">
                            <NavbarLink href="/products">
                                <Search/>
                                Søg
                            </NavbarLink>
                            { user && ( <NotificationMenu/>)}
                            { (favorites && user) && (
                                <Link href="/profile/favorites">
                                    <div className="hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                                        <div className="relative">
                                            <Heart/>
                                        </div>
                                    </div>
                                </Link>
                            )}
                            { user ? <ProfileDropdown user={user} />
                            :
                                <a 
                                    className="cursor-pointer inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600" 
                                    onClick={Login}
                                >
                                    <span>Log ind <span className="hidden lg:inline">med Discord</span></span>
                                </a>
                            }
                        </div>
                    </nav>
                </div>
            </header>
        </div>
    )
}