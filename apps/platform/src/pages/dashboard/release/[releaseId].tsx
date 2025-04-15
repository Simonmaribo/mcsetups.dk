import getRelease from "@/api/admin/releases/getRelease";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import withAuth from "@/hoc/withAuth";
import AdminLayout from "@/layouts/AdminLayout";
import { dateToFullString, prettyDate, relativeTimeAgo } from "@/lib/date";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import HandleRelease from "@/components/organisms/dashboard/HandleRelease";
import { Badge } from "@/components/molecules/Badge";
import ReleaseInfo from "@/components/organisms/dashboard/ReleaseInfo";
import Tippy from "@tippyjs/react";
import downloadRelease from "@/api/products/release/downloadRelease";
import MinecraftVersionsBadges from "@/components/molecules/MinecraftVersionsBadges";
import { Callout } from "@/components/molecules/Callout";

function Release(){
    const router = useRouter();
    var { releaseId } = router.query as { releaseId: string };
    if(Array.isArray(releaseId)) releaseId = releaseId[0]

    const { isLoading, isError, data: release, error } = useQuery({
        queryKey: ['release', `${releaseId}`],
        queryFn: async() => await getRelease({ releaseId }),
        retry: false
    });

    if(isError) return <ErrorState message={`${error}`}/>
    if(isLoading) return <div className="h-screen"> <LoadingState/></div>

    return (
        <AdminLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between">
                    <div className="flex flex-row items-center gap-4">
                        <ArrowLeft onClick={() => router.back()} className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <h1 className="text-2xl font-bold text-slate-900">{release.title}</h1>
                                <Badge color="blue" variant="subtle" size="sm">v{release.version}</Badge>
                                {release.status == 'PENDING' && (
                                    <Badge color="yellow" variant="subtle" size="sm" leadingContent={<Clock size={16}/>}>Afventer</Badge>
                                )}
                                {release.status == 'APPROVED' && (
                                    <Badge color="green" variant="subtle" size="sm">Godkendt</Badge>
                                )}
                                {release.status == 'REJECTED' && (
                                    <Badge color="red" variant="subtle" size="sm">Afvist</Badge>
                                )}
                                <p className="text-md text-gray-500">• {prettyDate(release.createdAt)}</p>
                            </div>
                            <Link passHref href={`/dashboard/users/${release.product.creator.id}`}>
                                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={release.product.creator.avatarUrl} alt=""/>
                                <span className="text-slate-900 font-medium ml-2">{release.product.creator.displayName}</span>
                            </Link>
                        </div>
                    </div>
                    {(release.status == 'REJECTED' && release.statusUpdate) && (
                        <div className="mt-2 text-center rounded py-1 px-4 bg-[#FFF5EE] border border-[#FDD5BC]">
                            <p className="text-base text-[#ED6C55]">Grund</p>
                            <p className="text-sm text-[#01001F]">{ release.statusUpdate.message}</p>
                            <Tippy content={<span>{dateToFullString(release.statusUpdate.createdAt)}</span>}>
                                <p className="mt-2 text-sm font-medium">{relativeTimeAgo(release.statusUpdate.createdAt)}</p>
                            </Tippy>
                        </div>
                    )}
                    {release.status == 'PENDING' && (
                        <HandleRelease release={release}/>
                    )}
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                 {new Date(release.createdAt).getTime() == new Date(release.product.createdAt).getTime() && ( 
                    <div>
                        <Callout title="Nyt produkt" color="blue" variant={"outline"}>Dette er en ny version af et produkt, der ikke tidligere har været udgivet.</Callout>
                    </div>
                )}
                <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-around">
                        <img className="rounded-lg w-[400px] h-[200px]" src={release.product.bannerUrl} alt="Banner"/>
                        <div className="group rounded-md border border-dashed border-slate-200 text-sm hover:border-blue-500 cursor-pointer transition-all ease-in-out delay-50" onClick={() => downloadRelease({ releaseId: release.id})}>
                            <div className="m-10 flex flex-col gap-4 items-center justify-center">
                                <div className="flex items-center flex-col justify-center gap-2">
                                    <DownloadCloud size={48} className="text-slate-900 group-hover:text-blue-500  transition-all ease-in-out delay-50"/>
                                    <p className="font-medium text-lg">Download release fil</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-around">
                        <p>{release.product.price > 0 ? `${release.product.price/100} DKK` : 'Gratis'}</p>
                        <MinecraftVersionsBadges versions={release.product.minecraftVersions as string[]}/>
                    </div>
                </div>
                <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <h1 className="font-medium text-lg text-slate-900">Kort beskrivelse</h1>
                    <p>{release.product.brief}</p>
                </div>
                <div className="my-5 relative w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <ReleaseInfo changelog={release.changelog} description={release.product.description}/>
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(Release, { maxGroup: 1 })