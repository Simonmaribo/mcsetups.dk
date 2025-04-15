import { Button } from "@/components/ui/button";
import { Check, HeartCrack } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function PaymentStatus() {
    const router = useRouter();

    var { status } = router.query as { status: string };
    if(Array.isArray(status)) status = status[0]

    status = status?.toLowerCase();

    if(status === "complete") {
        return (
            <div className="h-screen flex flex-col justify-center items-center gap-10">
                <div className="w-48 h-48 rounded-full bg-emerald-100 flex justify-center items-center">
                    <Check size={100} color="#064e3b"/>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                    <h1 className="text-3xl font-bold text-zinc-900">Betalingen blev gennemført!</h1>
                    <p className="text-xl text-zinc-600">Det kan tage op til 5 minutter før dine penge vises på din konto.</p>
                </div>
                <Link href="/profile">
                    <Button>Gå tilbage til din profil</Button>
                </Link>
            </div>
        ) 
    } else if(status === "cancel") {
        return (
            <div className="h-screen flex flex-col justify-center items-center gap-10">
                <div className="w-48 h-48 rounded-full bg-rose-100 flex justify-center items-center">
                    <HeartCrack size={100} color="#881337"/>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                    <h1 className="text-3xl font-bold text-zinc-900">Betalingen blev annulleret!</h1>
                </div>
                <Link href="/profile">
                    <Button>Gå tilbage til din profil</Button>
                </Link>
            </div>
        )
    }
}