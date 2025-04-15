import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";

export default function HiddenText({ text }: { text: string }){
    const [show, setShow] = useState(false);

    const hiddenText = () => {
        // return circles to represent an equal sized text
        return text.split('').map((_, i) => <span key={i}>&#9679;</span>)
    }

    return (
        <div className="flex gap-3 items-center">
            <p>{show ? text : hiddenText()}</p>
            <div className="cursor-pointer hover:text-slate-900 transition-all delay-50" onClick={() => setShow((v) => !v)}>
                {show ?
                    <Eye size={16} />
                    :
                    <EyeOff size={16} />
                }
            </div>
        </div>
    )
}