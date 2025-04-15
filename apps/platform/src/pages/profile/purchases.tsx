import UserPurchasesTable from "@/components/templates/tables/UserPurchasesTable";
import { Button } from "@/components/ui/button";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";
import ProfileLayout from "@/layouts/ProfileLayout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function Purchases(){

    return (
        <>
            <Meta title="McSetups | Dine produkt-køb"/>
            <ProfileLayout>
                <div className="bg-white border-b border-gray-200">
                    <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link passHref href="/profile">
                                <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">Købte produkter</h1>
                        </div>
                        <Link href="/profile/transactions">
                            <Button>Se alle transaktioner</Button>
                        </Link>
                    </div>
                </div>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                    <UserPurchasesTable/>
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(Purchases);