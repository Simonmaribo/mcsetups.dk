import AdminLayout from "@/layouts/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ErrorState from "@/components/atoms/state/ErrorState";
import { useRouter } from "next/router";
import { dateToFullString, prettyDate } from "@/lib/date";
import { ArrowLeft, Copy, Crown, Edit, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Tippy from "@tippyjs/react";
import withAuth from "@/hoc/withAuth";
import getPurchases from "@/api/admin/purchases/getPurchases";
import { Button } from "@/components/ui/button";
import useUser from "@/hooks/useUser";

function Purchases(){

    const router = useRouter();

    const routerPage = router.query.page ? parseInt(router.query.page as string) : 1;
    
    const { user } = useUser();

    const [page, setPage] = useState(routerPage);

    const { isLoading, isFetching, isError, data: purchases, error } = useQuery({
        queryKey: ['all-purchases', { page }],
        queryFn: async() => await getPurchases({ page }),
        retry: false,
        keepPreviousData: true,
        onSuccess: () => {
            let url = '/dashboard/purchases';
            url += `?page=${page}`;
            router.push(url, undefined, { shallow: true });
        }
    });

    if(isError) return <ErrorState message={`${error}`}/>

    return (
        <AdminLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                    <Link passHref href="/dashboard">
                        <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Alle køb på siden</h1>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="relative overflow-x-auto sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3"/>
                                    <th scope="col" className="px-6 py-3">
                                        Køber
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Sælger
                                    </th>   
                                    <th scope="col" className="px-6 py-3">
                                        Produkt
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Pris betalt
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Tidspunkt
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    purchases?.purchases.map((purchaseItem, i) => (
                                        <tr className="group bg-white border-b hover:bg-gray-50" key={purchaseItem.id}>
                                            <th scope="row" className="px-6 py-4">
                                                {
                                                    purchaseItem.product.creator.id == user?.id ? (
                                                        <Tippy content="Dette er dit produkt">
                                                                <Crown size={16} className="text-yellow-500"/>
                                                        </Tippy>
                                                    ) : null
                                                }
                                            </th>
                                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <img src={purchaseItem.user.avatarUrl} alt="" className="w-8 h-8 rounded-full"/>
                                                    <div className="flex flex-col">
                                                        <div className="flex gap-1">
                                                            <p>{purchaseItem.user.displayName}</p>
                                                            <p className="text-slate-700">({purchaseItem.user.discordName})</p>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <p className="text-xs text-gray-500">{purchaseItem.user.discordId}</p>
                                                            <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(purchaseItem.user.discordId);
                                                                    toast('Kopieret!', { description: 'Brugerens Discord ID er blevet kopieret til udklipsholderen.' })
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>              
                                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <img src={purchaseItem.product.creator.avatarUrl} alt="" className="w-8 h-8 rounded-full"/>
                                                    <div className="flex flex-col">
                                                        <div className="flex gap-1">
                                                            <p>{purchaseItem.product.creator.displayName}</p>
                                                            <p className="text-slate-700">({purchaseItem.product.creator.discordName})</p>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <p className="text-xs text-gray-500">{purchaseItem.product.creator.discordId}</p>
                                                            <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(purchaseItem.product.creator.discordId);
                                                                    toast('Kopieret!', { description: 'Brugerens Discord ID er blevet kopieret til udklipsholderen.' })
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex flex-col">
                                                        <Link href={`/products/${purchaseItem.product.id}`}>
                                                            <Button variant={"link"}>
                                                                {purchaseItem.product.title}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    {
                                                        purchaseItem.transaction != null ? (
                                                            <p className="text-gray-900 font-medium">{purchaseItem.transaction.amount/100} kr.</p>
                                                        ) : (
                                                            <p className="text-gray-900 font-medium">Manuelt køb</p>
                                                        )
                                                    }
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    <Tippy content={<span>{dateToFullString(purchaseItem.createdAt)}</span>}>
                                                        <p className="text-blue-500 font-medium">{prettyDate(purchaseItem.createdAt)}</p>
                                                    </Tippy>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                                {(!purchases || (isLoading || isFetching)) && [...Array(5)].map((_, i) => (
                                    <tr className="group bg-white border-b hover:bg-gray-50" key={i}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            <div className="flex gap-4 items-center">
                                                <div className="animate-pulse flex flex-col">
                                                    <div className="h-8 bg-gray-300 rounded w-32"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-24 mt-2"></div>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 flex flex-row gap-2 items-center">
                                            <div className="animate-pulse h-4 bg-gray-300 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4 flex flex-row gap-2 items-center">
                                            <div className="animate-pulse h-4 bg-gray-300 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex">
                                                <div className="animate-pulse h-4 bg-gray-300 rounded w-16"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="justify-end flex  invisible group-hover:visible">
                                                <div className="rounded-lg p-2 hover:bg-gray-100 hover:text-blue-500 cursor-pointer">
                                                    <Edit size={20}/>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        { (!isLoading && !isFetching && purchases?.purchases.length <= 0) && (
                            <div className="flex flex-col items-center justify-center p-10">
                            {
                                page == 1 ? (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Ingen salg fundet</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller prøv igen senere.</p>
                                    </>
                                ) : (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Vi har ikke flere salg</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller vent til flere tilmelder køber produkter.</p>
                                    </>
                                )
                            }
                            </div>
                        )}

                        { (!isLoading && !isFetching) &&
                            <nav className="flex items-center justify-center pt-4 mt-4" aria-label="Table navigation">
                                <ul className="inline-flex items-center -space-x-px">
                                    <li>
                                        { page > 1 && (
                                            <p onClick={() => setPage(page-1)} className="cursor-pointer block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700">
                                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            </p>
                                            )
                                        }
                                    </li>
                                    {
                                        Array.from({length: purchases?.pages || 1}, (_, i) => i+1).map((p) => (
                                            <li key={p}>
                                                { p == page ? (
                                                    <p className="cursor-pointer block px-3 py-2 leading-tight text-blue-500 bg-blue-100 border border-blue-300">{p}</p>
                                                ) : (
                                                    <p onClick={() => setPage(p)} className="cursor-pointer block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">{p}</p>
                                                )}
                                            </li>
                                        ))
                                    }
                                    <li>
                                        {
                                            (page) < (purchases?.pages || 0) && (
                                                <p onClick={() => setPage(page+1)} className="cursor-pointer block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700">
                                                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                                </p>
                                            )
                                        }
                                    </li>
                                </ul>
                            </nav>
                        }
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default withAuth(Purchases, { maxGroup: 0 });