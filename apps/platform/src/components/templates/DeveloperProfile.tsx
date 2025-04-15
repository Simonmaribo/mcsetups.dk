import { User } from "database";
import BalanceCard from "../organisms/profile/BalanceCard";
import UserIncomeGraph from "../organisms/graphs/UserIncomeGraph";
import Link from "next/link";
import { Button } from "../ui/button";

export default function DeveloperProfile({ user }: { user: User}) {
	return (
        <div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                <BalanceCard userId={'@me'} className="border-l-4 border-emerald-500"/>
                <div className="relative w-full text-left ring-1 bg-white shadow border-blue-500 ring-gray-200 p-6 rounded-lg">
                </div>
                <div className="relative w-full text-left ring-1 bg-white shadow border-blue-500 ring-gray-200 p-6 rounded-lg">
                </div>
            </div>

            <div className="my-6 relative w-full text-left ring-1 bg-white shadow border-blue-500 ring-gray-200 p-6 rounded-lg">
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Salg</h1>
                        <p className="text-slate-700">Indtægt de sidste 30 dage</p>
                    </div>
                    <Link href={`/profile/transactions`} passHref>
                        <Button color="blue">Se alle salg</Button>
                    </Link>
                </div>
                <UserIncomeGraph />
            </div>
        </div>
    )
}