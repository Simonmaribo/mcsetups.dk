import getUsers from "@/api/users/getUsers";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import { Badge } from "@/components/molecules/Badge";
import DefaultLayout from "@/layouts/DefaultLayout";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";

export default function Products(){

    const router = useRouter();

    const [page, setPage] = useState(router.query.page ? parseInt(router.query.page as string) : 1);
    const [search, setSearch] = useState(router.query.search ? router.query.search as string : '');

    const { isLoading, isFetching, isError, data: users, error } = useQuery({
        queryKey: ['users-list', { page, search }],
        queryFn: async () => await getUsers({ page, search }),
        retry: false,
        keepPreviousData: true,
        onSuccess: () => updateRoute(),
        enabled: router.isReady
    });

    const updateRoute = () => {
        let url = '/users';
        url += `?page=${page}`;
        if(search) url += `&search=${search}`;
        router.push(url, url, { shallow: true });
    }

    return (
        <DefaultLayout size="2xl">
            <div className="border-t border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 gap-4">
                    <div className="flex flex-col flex-1">
                        <div className="gap-4 flex flex-col md:flex-row mb-8">
                            <div className="bg-white flex flex-1 items-center py-2 px-4 rounded-lg gap-2 group border text-gray-500 border-gray-300 focus-within:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
                                <Search size={20}/>
                                <input 
                                    type="text" 
                                    className="pl-2 text-gray-500 w-full rounded-lg outline-none ring-0" 
                                    placeholder="En bestemt udvikler du leder efter?"
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
                        {(users?.users?.length === 0 && !isLoading && !isFetching) && (
                            <div className="flex flex-col items-center justify-center">
                            {
                                page == 1 ? (
                                    <>
                                        <img src="/images/search.svg" alt="Search" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Ingen brugere fundet</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller prøv igen senere.</p>
                                    </>
                                ) : (
                                    <>
                                        <img src="/images/search.svg" alt="Search" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Vi har ikke flere brugere</p>
                                        <p className="text-sm text-gray-500">Prøv at ændre søgeordet.</p>
                                    </>
                                )
                            }
                            </div>
                        )}
                        {(isLoading || isFetching) && <LoadingState/>}
                        {(isError && !isLoading) && <ErrorState/>}
                        {(users?.users?.length || 0 > 0) && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {users?.users.map((user) => (
                                        <Link href={`/users/${user.displayName}`} key={user.id}>
                                            <div className="group p-4 border bg-white border-gray-200 rounded-lg hover:shadow cursor-pointer overflow-hidden">
                                                <div className="flex flex-col justify-center items-center gap-2">
                                                    <div>
                                                        <img src={user.avatarUrl} alt={user.displayName} className="aspect-square w-24 rounded-full"/>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <p className="text-lg font-semibold text-slate-900">{user.displayName}</p>
                                                    </div>
                                                    <div className="flex justify-center items-center flex-wrap gap-1">
                                                        {user.group == 0 && (
                                                            <Badge color="red" size="xs" variant={"subtle"}>Admin</Badge>
                                                        )}
                                                        {user.group == 1 && (
                                                            <Badge color="red" size="xs" variant={"subtle"}>Admin</Badge>
                                                        )}
                                                        {user.group == 2 && (
                                                            <Badge color="indigo" size="xs" variant={"subtle"}>Supporter</Badge>
                                                        )}
                                                        {user.group == 3 && (
                                                            <Badge color="blue" size="xs" variant={"subtle"}>3</Badge>
                                                        )}
                                                        {user.verified && (
                                                            <Badge size="xs" color="blue" variant={"subtle"}>Verificeret</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex w-full justify-around items-center">
                                                        <div className="flex flex-col items-center">
                                                            <p className="font-medium">{user._count.products}</p>
                                                            <p className="text-gray-500">Produkter</p>
                                                        </div>
                                                        {/*<div className="flex flex-col items-center">
                                                            <p className="font-medium">0</p>
                                                            <p className="text-gray-500">Følgere</p>
                                                        </div>*/}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
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
        </DefaultLayout>
    )
}
