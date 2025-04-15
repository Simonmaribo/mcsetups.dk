import { AnchorButton } from "../ui/button";

export default function SpecialOrderBox({ className }: { className?: string }){
    return (
        <div className={`bg-gray-900 flex flex-col-reverse lg:items-center gap-4 lg:flex-row lg:justify-between border-stroke border-whop-stroke relative overflow-hidden p-4 rounded-lg md:rounded-xl md:border md:py-10 md:px-20 ${className}`}>
            <div className="flex flex-col gap-8">
                <div className="lg:flex lg:flex-col lg:gap-2">
                    <h1 className="font-bold text-white text-2xl lg:text-5xl">Speciallavede ordre</h1>
                    <p className="text-slate-400 text-lg lg:text-2xl">Få lavet dit helt eget produkt efter dine behov!</p>
                </div>
                <div className="flex gap-4">
                    <AnchorButton href="https://discord.mcsetups.dk" target="_blank" variant="blue" className="flex-1 lg:flex-none">Opret ordre</AnchorButton>
                    <AnchorButton href="https://discord.mcsetups.dk" target="_blank" variant="white" className="flex-1 lg:flex-none">Læs mere</AnchorButton>
                </div>
            </div>
            <div className="flex justify-center">
                <img src="/images/custom.png" alt="Custom Order" className="h-40 lg:h-60 w-auto"/>
            </div>
        </div>
    )
}