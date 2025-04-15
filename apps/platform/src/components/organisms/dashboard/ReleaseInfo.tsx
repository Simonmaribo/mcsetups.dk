import { useState } from "react";
import Markdown from "@/components/organisms/Markdown/Markdown";
import { ClipboardEdit, ClipboardType } from "lucide-react";


export default function ReleaseInfo({ description, changelog }: { description: string; changelog: string }){
    
    const [tab, setTab] = useState("description");

    return (
        <div>
            <div className="flex-flex-col items-center">
                <div className="rounded-tl-lg rounded-tr-lg flex flex-row items-center gap-2 bg-slate-100 p-1 border-b">
                    <div onClick={() => setTab("description")} className={`gap-2 cursor-pointer grow flex flex-row items-center justify-center rounded-[0.185rem] px-3 py-1.5 text-sm font-medium transition-all ${tab == "description" ? "text-slate-900 bg-white shadow-sm" : "text-slate-800 "}`}>
                        <ClipboardType/>
                        <p className="text-xs text-slate-900">Beskrivelse</p>
                    </div>
                    <div  onClick={() => setTab("changelog")} className={`gap-2 cursor-pointer grow flex flex-row items-center justify-center rounded-[0.185rem] px-3 py-1.5 text-sm font-medium transition-all ${tab == "changelog" ? "text-slate-900 bg-white shadow-sm" : "text-slate-800 "}`}>
                        <ClipboardEdit/>
                        <p className="text-xs text-slate-900">Changelog</p>
                    </div>
                </div>
                {tab == "description" && (
                    <div className="min-h-[350px] p-4 border rounded-br-lg rounded-bl-lg">
                        <Markdown value={description}/>
                    </div>
                )}
                {tab == "changelog" && (
                    <div className="min-h-[350px] p-4 border rounded-br-lg rounded-bl-lg">
                        <Markdown value={changelog}/>
                    </div>
                )}
            </div>
        </div>
    )
}