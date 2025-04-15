import CompaniesTestimonials from "@/components/organisms/CompanyTestimonial";
import SpecialOrderBox from "@/components/organisms/SpecialOrderBox";
import DefaultLayout from "@/layouts/DefaultLayout";
import Meta from "@/layouts/Meta";

const StatBox = ({ title, subtitle, description}: { title: string, subtitle: string, description: string}) => {
    return (
        <div className="shadow-lg max-w-[300px] backdrop-blur text-center border border-slate-300 rounded-sm p-8">
            <h2 className="text-white font-bold text-3xl">{title}</h2>
            <h3 className="text-white font-medium text-lg">{subtitle}</h3>
            <p className="text-white text-sm">{description}</p>
        </div> 
    )
}

const TextField = ({title, subtitle, children, className}: { title: string, subtitle: string, children: React.ReactNode, className?: string}) => {
    return (
        <div className={`flex justify-center ${className}`}>
            <div className="flex flex-col text-center justify-center items-center max-w-screen-md">
                <h2 className="uppercase font-medium text-slate-500">
                    {subtitle}
                </h2>
                <h1 className="font-bold text-3xl text-slate-900">
                    {title}
                </h1>
                <div className="mt-6 text-gray-700">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default function About(){
    return (
        <DefaultLayout bgColor="white">
            <Meta 
                title="McSetups | Om Os"
                description="McSetups er en platform, der sælger alt der hører til den perfekte minecraft server. På hjemmesiden kan du købe produkter inden for flere forskellige kategorier, og fra flere forskellige dygtige udviklere."
                banner="/seo/about-banner.png"
            />
            <div className="border-t border-gray-200 bg-white h-full">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 flex flex-col my-12">
                    <div className="flex justify-center items-center">
                        <div className="max-w-screen-md flex flex-col justify-center items-center text-center">
                            <p className="text-[#0050ff] text-xl sm:text-2xl font-semibold">Om os</p>
                            <p className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900">Bygget til udviklere, af udviklere!</p>
                            <p className="text-lg text-slate-700 mt-8">
                            Vi har en vision om at skabe en hjemmeside, hvor vi samler de mest talentfulde udviklere og deler deres værdifulde produkter til gavn for alle.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center items-center gap-2">
                        <div className="flex -space-x-2">
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="/trustpilot/user1.png" alt="Image Description"/>
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="/trustpilot/user2.png" alt="Image Description"/>
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="/trustpilot/user3.png" alt="Image Description"/>
                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="/trustpilot/user4.png" alt="Image Description"/>
                        </div>
                        <div className="inline-block h-100 min-h-[1em] w-0.5 self-stretch bg-slate-200"></div>
                        <a target="_blank" rel="noreferrer" href="https://dk.trustpilot.com/review/mcsetups.dk?utm_medium=trustbox&utm_source=MicroReviewCount">
                            <div>
                                <img src="/trustpilot/trustpilot.png" alt="Trustpilot" className="h-6 w-auto"/>
                                <div className="flex items-center gap-2">
                                    <p className="text-slate-700"><span className="text-slate-900 font-medium">37</span> vurderer os</p>
                                    <img src="/trustpilot/stars.png" alt="Trustpilot" className="h-4 w-auto"/>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="mt-20 rounded-lg bg-[url('/images/background.png')] bg-no-repeat bg-cover bg-center flex gap-8 flex-wrap justify-center items-center p-10">
                        <StatBox title="250+" subtitle="Tilfredse kunder" description="Vi har hjulpet 250+ med at få deres drømme server."/>
                        <StatBox title="3+" subtitle="Års ekspertise" description="Vi har mere end 3 års erfaring med Minecraft udvikling."/>
                        <StatBox title="1000+" subtitle="Discord medlemmer" description="Vi er Danmarks største Minecraft Udviklings community."/>
                    </div>
                    <TextField title="McSetups er meget mere end en platform!" subtitle="Hvad er McSetups?" className="my-16">
                        McSetups er en platform, der sælger alt der hører til den perfekte minecraft server. På hjemmesiden kan du købe produkter inden for flere forskellige kategorier, og fra flere forskellige dygtige udviklere.
                    </TextField>
                    <CompaniesTestimonials/>
                    <TextField title="Hos os er du altid i sikre hænder" subtitle="Hvorfor vælge produkter fra McSetups?" className="my-16">
                        På siden sælges der plugins, færdige maps, hjemmesider & kvalitets skripts der bare virker. Alle produkter som er sat til salg, er kvalitet tjekket, og verificeret. Du kan derfor forvente at produkterne bare virker, og du får hvad du betaler for.
                        <br/><br/>
                        Alle udviklere har gået gennem en længere process for at blive “Verificeret” - samtidigt med det, så bliver hvert enkelt produkt gennemgået for at vi kan sikre den kvalitet vi ønsker, <span className="text-black font-medium underline">hver gang!</span>
                    </TextField>
                    <SpecialOrderBox/>
                </div>
            </div>
        </DefaultLayout>
    )
}