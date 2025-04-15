export default function ErrorState({ title, message }: { title?: string, message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#f03e3e]/30">
            <div className="text-2xl font-bold text-red-500">{title || "Der skete en fejl"}</div>
            {message && <div className="text-xl text-red-500">{message}</div>}
        </div>
    )
}