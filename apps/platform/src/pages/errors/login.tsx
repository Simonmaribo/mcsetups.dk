import { Button } from "@/components/ui/button";
import { HeartCrack } from "lucide-react";
import Link from "next/link";

export default function LoginFailed() {

    return (
        <div className="h-screen flex flex-col justify-center items-center gap-10">
            <div className="w-48 h-48 rounded-full bg-rose-100 flex justify-center items-center">
                <HeartCrack size={100} color="#881337"/>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <h1 className="text-3xl font-bold text-zinc-900">Der skete en fejl under hentning af Discord data</h1>
                <p className="text-xl text-zinc-600">Venligst accepter både {"'"}Access your email address{"'"} og {"'"}Access your username, avatar and banner{"'"}</p>
            </div>
            <div className="flex gap-4">
                <Link href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login?prompt=consent`}>
                    <Button>Prøv igen</Button>
                </Link>
                <Link href="https://discord.mcsetups.dk">
                    <Button variant="subtle">Opret ticket på vores Discord</Button>
                </Link>
            </div>
        </div>
    ) 
}