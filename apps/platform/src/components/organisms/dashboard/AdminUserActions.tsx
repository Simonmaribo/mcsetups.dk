import loginToUser from "@/api/admin/users/loginToUser";
import EditUserModal from "@/components/modals/EditUserModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useUser from "@/hooks/useUser";
import NiceModal from "@ebay/nice-modal-react";
import { Cog, DollarSign, LogIn } from "lucide-react";
import { ReactNode, useState } from "react";

type User = {
    discordId: string;
    displayName: string;
    email: string;
    discordName: string;
    id: number;
    avatarUrl: string;
    createdAt: Date;
    lastLogin: Date;
    verified: boolean;
    group: number;
}

export default function AdminUserActions({ children, selectedUser }: { children: ReactNode; selectedUser: User; }) {

    const { user } = useUser();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Tilføj manuel betaling
                    </DropdownMenuItem>
                    { (user != null && user?.group < selectedUser.group) && (
                        <DropdownMenuItem className="cursor-pointer" onClick={() => NiceModal.show(EditUserModal, { user: selectedUser })}>
                            <Cog className="mr-2 h-4 w-4" />
                            Rediger bruger
                        </DropdownMenuItem>
                    )}
                        <DropdownMenuItem className="cursor-pointer" onClick={() => loginToUser({userId: selectedUser.id})}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Login som bruger
                        </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}