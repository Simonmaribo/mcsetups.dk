import getPublicProfile from "@/api/users/profile/getPublicProfile";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Badge } from "@/components/molecules/Badge";
import ProductCard from "@/components/organisms/ProductCard";
import DefaultLayout from "@/layouts/DefaultLayout";
import Meta from "@/layouts/Meta";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Check } from "lucide-react";
import { useRouter } from "next/router";

export default function UserProfile(){
    
    const router = useRouter();
    var { username } = router.query as { username: string };
    if(Array.isArray(username)) username = username[0]

    const { isLoading, isError, data: profile, error } = useQuery({
        queryKey: ['profile', `${username}`],
        queryFn: async() => await getPublicProfile({ username }),
        retry: false
    });

    if(isLoading) return <div className="h-screen"> <LoadingState/></div>

    const getGradient = (userId: number) => {

        const gradients = [
            "from-cyan-500 to-blue-500",
            "from-sky-500 to-indigo-500",
            "from-violet-500 to-fuchsia-500",
            "from-purple-500 to-pink-500"
        ]

        return gradients[userId % gradients.length]
    }

    return (
        <DefaultLayout bgColor="white">
            {   /* @ts-ignore */
                isError ? (<div className="h-screen"><ErrorState message={`${error?.error || "Det skete en fejl"}`}/></div>)
                : (isLoading ? <div className="h-screen"><LoadingState/></div>
                : profile && (
                    <>
                        <Meta
                            title={`${profile.displayName} | MCSetups`}
                            url={`https://mcsetups.dk/products/${profile.displayName}`}
                            description={profile.description}
                        />
                        <div className="border-t border-gray-200">
                            {/*<div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                <img src="/images/background.png"/>
                            </div> */}
                            <div className={`h-24 sm:h-48 bg-gradient-to-r ${getGradient(profile.id)}`}></div>
                            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 gap-4">
                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center justify-center">
                                            <div className="md:w-32 md:h-32 rounded-full overflow-hidden -mt-12 drop-shadow-lg border-4 border-white background-white">
                                                <img src={profile.avatarUrl} alt="avatar"/>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex gap-2 items-center">
                                                <h1 className="text-4xl font-bold text-slate-900">{profile.displayName}</h1>
                                                {
                                                    profile.verified && (
                                                        <Tippy content="Verificeret bruger">
                                                            <Badge size="xs" color="blue" variant={"subtle"} padding="icon"><Check size={16}/></Badge>
                                                        </Tippy>
                                                    )
                                                }
                                            </div>
                                            <p className="text-md text-slate-600">{profile.description || `${profile.displayName} har ikke skrevet en beskrivelse.`}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 flex flex-col gap-4">
                                    { profile.products?.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {profile.products?.map((product) => (
                                                    <ProductCard key={product.id} product={product} width="400px"/>
                                                ))}
                                            </div>
                                        </div>  
                                    ) : (
                                        <div className="flex flex-col items-center ">
                                            <img src="/images/empty.svg" alt="" className="w-32 h-32"/>
                                            <p className="text-xl font-semibold text-slate-900 mt-5">Ingen produkter</p>
                                            <p className="text-sm text-gray-500">{profile.displayName} har ikke uploadet nogle produkter.</p>
                                        </div>
                                    )
                                    }
                                    </div>
                            </div>
                        </div>
                    </>
                ))
            }
        </DefaultLayout>
    )
}