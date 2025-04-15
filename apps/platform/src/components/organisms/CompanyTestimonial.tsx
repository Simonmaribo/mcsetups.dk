
type Company = {
    name: string
    logo: string
}

const COMPANIES: Company[] = [
    { name: "Kysten", logo: "/companies/kysten.png" },
    { name: "Byen", logo: "/companies/byen.png" },
    { name: "EnvyMC", logo: "/companies/envymc.png" },
    { name: "SeekMC", logo: "/companies/seekmc.png" },
    { name: "UnicMC", logo: "/companies/unic.png" }
]

const REDUCED_COMPANIES: {[key: number]: Company[]} = {}

COMPANIES.reduce((acc, cur, i) => {
    const chunkIndex = Math.floor(i / 3)
    if (!REDUCED_COMPANIES[chunkIndex]) {
        REDUCED_COMPANIES[chunkIndex] = []
    }
    REDUCED_COMPANIES[chunkIndex].push(cur)
    return acc
}, [])


export default function CompaniesTestimonials(){

    return (
        <div className="py-10 flex flex-col gap-4 items-center justify-center text-center bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-slate-900 mb-4">Disse servere har tillid til os</p>
            <div className="flex flex-col items-center justify-center lg:flex-row gap-x-8 md:gap-x-24 gap-y-8">
                {Object.values(REDUCED_COMPANIES).map((chunk, i) => (
                    <div key={i} className="flex flex-row gap-x-8 md:gap-x-24">
                        {chunk.map((company, i) => (
                            <img key={i} src={company.logo} alt={company.name} className="w-32 h-32 transition ease-in-out delay-50" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )

}