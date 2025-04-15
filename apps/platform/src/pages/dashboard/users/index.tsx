import AdminLayout from "@/layouts/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import getUsers from "@/api/admin/users/getUsers";
import ErrorState from "@/components/atoms/state/ErrorState";
import { useRouter } from "next/router";
import { dateToFullString, prettyDate } from "@/lib/date";
import { ArrowLeft, Copy, Edit, Info, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Tippy from "@tippyjs/react";
import { Badge } from "@/components/molecules/Badge";
import useUser from "@/hooks/useUser";
import AdminUserActions from "@/components/organisms/dashboard/AdminUserActions";
import withAuth from "@/hoc/withAuth";

function Users(){

    const router = useRouter();

    const routerPage = router.query.page ? parseInt(router.query.page as string) : 1;
    
    const [page, setPage] = useState(routerPage);
    const [search, setSearch] = useState('');

    const { isLoading, isFetching, isError, data: users, error } = useQuery({
        queryKey: ['users', { page, search }],
        queryFn: async() => await getUsers({ page, search }),
        retry: false,
        keepPreviousData: true,
        onSuccess: () => {
            let url = '/dashboard/users';
            url += `?page=${page}`;
            if(search) url += `&search=${search}`;
            router.push(url, undefined, { shallow: true });
        }
    });

    if(isError) return <ErrorState message={`${error}`}/>

    return (
        <AdminLayout size="2xl">
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                    <Link passHref href="/dashboard">
                        <ArrowLeft className="text-slate-900 cursor-pointer hover:text-slate-700 delay-50 transition-all"/>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Brugere på hjemmesiden</h1>
                </div>
            </div>
            <div className="mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="pb-4 bg-white dark:bg-gray-900">
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Søg efter navn, id eller email"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter'){
                                        setPage(1);
                                        setSearch(e.currentTarget.value);
                                    }
                                }}
                                onChange={(e) => {
                                    if(e.currentTarget.value === ''){
                                        setPage(1);
                                        setSearch('');
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="relative overflow-x-auto sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Bruger
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gruppe
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Balance
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Aktivitet
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Oprettet sig
                                    </th>
                                    <th scope="col" className="px-6 py-3"/>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    users?.users.map((userItem, i) => (
                                        <tr className="group bg-white border-b hover:bg-gray-50" key={userItem.id}>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex gap-4 items-center">
                                                    <img src={userItem.avatarUrl} alt="" className="w-8 h-8 rounded-full"/>
                                                    <div className="flex flex-col">
                                                        <div className="flex gap-1">
                                                            <p>{userItem.displayName}</p>
                                                            <p className="text-slate-700">({userItem.discordName})</p>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <p className="text-xs text-gray-500">{userItem.discordId}</p>
                                                            <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(userItem.discordId);
                                                                    toast('Kopieret!', { description: 'Brugerens Discord ID er blevet kopieret til udklipsholderen.' })
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-3 py-4">
                                                <div className="flex justify-center items-center flex-wrap gap-1">
                                                    {userItem.group == 0 && (
                                                        <Badge color="red" size="xs">Ejer</Badge>
                                                    )}
                                                    {userItem.group == 1 && (
                                                        <Badge color="red" size="xs">Administrator</Badge>
                                                    )}
                                                    {userItem.group == 2 && (
                                                        <Badge color="indigo" size="xs">Supporter</Badge>
                                                    )}
                                                    {userItem.group == 3 && (
                                                        <Badge color="blue" size="xs">3</Badge>
                                                    )}
                                                    {userItem.verified && (
                                                        <Badge color="blue" size="xs">Verificeret</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 items-center">
                                                    <p>{userItem.email}</p>
                                                    <Copy size={16} className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 delay-50 transition-all"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(userItem.email);
                                                            toast('Kopieret!', { description: 'Brugerens email er blevet kopieret til udklipsholderen.' })
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p>{(userItem?.tempBalance?.reduce((a, b) => a + (b['amount'] || 0), 0)+userItem?.balance)/100} DKK</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    <Tippy content={<span>{dateToFullString(userItem.lastLogin)}</span>}>
                                                        <div>
                                                            {new Date(userItem.lastLogin).getTime() > new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() ? (
                                                                <Badge color="green" variant="subtle" size="sm">Aktiv</Badge>
                                                            ) : (
                                                                <Badge color="red" variant="subtle" size="sm">Inaktiv</Badge>
                                                            )}
                                                        </div>
                                                    </Tippy>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    <Tippy content={<span>{dateToFullString(userItem.createdAt)}</span>}>
                                                        <p className="text-blue-500 font-medium">{prettyDate(userItem.createdAt)}</p>
                                                    </Tippy>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="justify-end flex">
                                                    <AdminUserActions selectedUser={userItem}>
                                                        <div className="rounded-lg p-2 hover:text-slate-900 cursor-pointer">
                                                            <MoreVertical size={20}/>
                                                        </div>
                                                    </AdminUserActions>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                                {(!users || (isLoading || isFetching)) && [...Array(5)].map((_, i) => (
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
                        { (!isLoading && !isFetching && users?.users.length <= 0) && (
                            <div className="flex flex-col items-center justify-center p-10">
                            {
                                page == 1 ? (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Ingen brugere fundet</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller prøv igen senere.</p>
                                    </>
                                ) : (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Vi har ikke flere brugere</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller vent til flere tilmelder sig.</p>
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
                                        Array.from({length: users?.pages || 1}, (_, i) => i+1).map((p) => (
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
                                            (page) < (users?.pages || 0) && (
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

export default withAuth(Users, { maxGroup: 1 });