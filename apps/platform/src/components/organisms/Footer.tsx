export default function Footer(){
    return (
        <footer className="py-4 bg-white border-t border-slate-200">
            <div className="flex flex-col justify-between items-center gap-2 mx-auto max-w-screen-xl px-2.5 md:px-20 md:flex-row">
                <div className="text-sm text-gray-500">
                    © {new Date().getFullYear()} McSetups. Alle rettigheder forbeholdes.
                </div>
            </div>
        </footer>
    )
}