import { User } from "database";
import {
    ChevronDown,
    Cloud,
    CreditCard,
    User as UserIcon,
    LifeBuoy,
    LogOut,
    Settings,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import Link from "next/link";
import { useState } from "react";


const MENU = {
    user: [
        { icon: UserIcon, label: "Profil", href: "/profile" },
        { icon: CreditCard, label: "Dine køb", href: "/profile/purchases" },
        { icon: Settings, label: "Indstillinger", href: "/profile/settings" },
    ],
    admin: [
        { icon: Cloud, label: "Dashboard", href: "/dashboard" },
    ],
    support: [
        { icon: LifeBuoy, label: "Supportsager", href: "https://discord.mcsetups.dk" },
    ]
}

export default function ProfileDropdown({ user }: { user: User}) {
    
    const [isOpen, setOpen] = useState(false);

    const logout = () => {
        if (typeof window !== "undefined") {
            window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`;
        }
    }


    return (
        <DropdownMenu onOpenChange={(value) => setOpen(value)}>
            <DropdownMenuTrigger asChild >
                <div className="flex flex-row gap-3 cursor-pointer items-center">
                    <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.displayName?.charAt(0) || "MC"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-row gap-2 hidden md:flex">
                        <p className="text-md font-medium color-slate-500">{user.displayName}</p>
                        <ChevronDown className="h-6 w-6 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : "rotate(0deg)" }}/>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                    { MENU.user.map((item, index) => (
                        <Link href={item.href} key={item.label}>
                            <DropdownMenuItem key={index} className="cursor-pointer">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                { user.group <= 1 && 
                    <DropdownMenuGroup>
                        { MENU.admin.map((item, index) => (
                            <Link href={item.href} key={item.label}>
                                <DropdownMenuItem key={index} className="cursor-pointer">
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.label}</span>
                                </DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuGroup>
                }
                { user.group <= 1 && <DropdownMenuSeparator /> }
                <DropdownMenuGroup>
                    { MENU.support.map((item, index) => (
                        <Link href={item.href} key={item.label}>
                            <DropdownMenuItem key={index} className="cursor-pointer">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Log ud</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      )
}