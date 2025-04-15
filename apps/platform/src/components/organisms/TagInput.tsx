import { X } from "lucide-react"
import { useState } from "react"

type TagInputProps = {
    value: string[]
    onChange: (value: string[]) => void,
    maxTags?: number
}

export default function TagInput({
    value,
    onChange,
    maxTags = 5
}: TagInputProps){
    const [inputValue, setInputValue] = useState("")
    
    // A input field that when pressed enter adds the value to the value array and shows it in the start of the input field

    return (
        <div className="w-full flex flex-col">
            <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                    if(event.key == "Enter"){
                        event.preventDefault()
                        if(value.length >= maxTags) return
                        if(inputValue.length == 0) return
                        if(value.includes(inputValue.toLowerCase())) return

                        onChange([...value, inputValue.toLowerCase()])
                        setInputValue("")
                    }
                }}
                className={`w-full border rounded-md p-2 border-gray-300`}
                disabled={value.length >= maxTags}
            />
            <div className="flex flex-wrap gap-1 mt-1">
                {
                    value.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 mr-1">
                            <span className="">{tag}</span>
                            <X size={16} className="cursor-pointer" onClick={() => {
                                onChange(value.filter((_, i) => i != index))
                            }}/>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}