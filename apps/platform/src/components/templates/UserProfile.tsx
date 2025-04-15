import { User } from "database";
import BalanceCard from "../organisms/profile/BalanceCard";
import UserPurchasesTable from "./tables/UserPurchasesTable";
import { Check } from "lucide-react";

export default function UserProfile({ user }: { user: User}) {
	return (
        <div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <BalanceCard userId={'@me'} className="border-l-4 border-emerald-500"/>
                <div className="relative w-full text-left ring-1 bg-white shadow border-l-4 border-blue-500 ring-gray-200 p-6 rounded-lg">
                    <h1 className="font-semibold text-lg text-slate-900">Din profil kan blive verificeret</h1>
                    <p className="text-base text-gray-600">Verificerede profiler kan upload deres egne produkter.</p>
                    <div className="flex">
                        <a href="https://forum.mcsetups.dk">
                            <div className="flex items-center mt-2 text-blue-500 gap-1 cursor-pointer">
                                <Check size={16}/>
                                <span>Start verifikationsprocess</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-6">
                <UserPurchasesTable/>
            </div>
        </div>
    )
}