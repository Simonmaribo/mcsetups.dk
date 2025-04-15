export default function SettingsField({title, description, children}: {title: string, description: string, children: React.ReactNode}) {
    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-2">
                <div className="w-full">
                    <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    <p className="text-gray-500 text-sm">{description}</p>
                </div>
                <div className="w-full">
                    {children}
                </div>
            </div>
            <hr className="my-4"/>
        </div>
    )
}