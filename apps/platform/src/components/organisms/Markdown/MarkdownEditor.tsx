import { useState } from "react";
import { Edit, Eye } from "lucide-react";
import Markdown from "./Markdown";


export default function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void}){
    
    const [tab, setTab] = useState("edit");

    return (
        <div>
            <div className="flex-flex-col items-center">
                <div className="rounded-tl-lg rounded-tr-lg flex flex-row items-center gap-2 bg-slate-100 p-1 border-b">
                    <div onClick={() => setTab("edit")} className={`gap-2 cursor-pointer grow flex flex-row items-center justify-center rounded-[0.185rem] px-3 py-1.5 text-sm font-medium transition-all ${tab == "edit" ? "text-slate-900 bg-white shadow-sm" : "text-slate-800 "}`}>
                        <Edit/>
                        <p className="text-xs text-slate-900">Edit</p>
                    </div>
                    <div  onClick={() => setTab("preview")} className={`gap-2 cursor-pointer grow flex flex-row items-center justify-center rounded-[0.185rem] px-3 py-1.5 text-sm font-medium transition-all ${tab == "preview" ? "text-slate-900 bg-white shadow-sm" : "text-slate-800 "}`}>
                        <Eye/>
                        <p className="text-xs text-slate-900">Preview</p>
                    </div>
                </div>
                {tab == "edit" && (
                    <textarea
                        placeholder="Skriv noget her..."
                        rows={10}
                        className="w-full h-96 p-4 border rounded-br-lg rounded-bl-lg"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
                {tab == "preview" && (
                    <div className="min-h-[350px] p-4 border rounded-br-lg rounded-bl-lg">
                        <Markdown value={value}/>
                    </div>
                )}
            </div>
        </div>
    )
}