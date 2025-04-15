import getProducts, { Filters, filterToString, stringToFilter } from "@/api/products/getProducts";
import ErrorState from "@/components/atoms/state/ErrorState";
import LoadingState from "@/components/atoms/state/LoadingState";
import ProductCard from "@/components/organisms/ProductCard";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import DefaultLayout from "@/layouts/DefaultLayout";
import Meta from "@/layouts/Meta";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { ProductType } from "database";
import { CheckCircle2, Filter, Search, SortDesc } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";

const FilterBadge = ({ active, text, onClick }: { active: boolean, text: string, onClick: () => void }) => {
    return (
        <div onClick={onClick} className={`select-none cursor-pointer font-medium text-sm rounded-full px-3 py-1 border ${active ? 'border-blue-500 bg-blue-100 text-blue-700' : 'bg-gray-50 text-slate-900'}`}>
            {text}
        </div>
    )
}

const SortButton = ({ active, text, onClick }: { active: boolean, text: string, onClick: () => void }) => {
    return (
        <div onClick={onClick} className={`cursor-pointer rounded-lg border flex items-center justify-between pl-2 pr-4 py-1 transition-all ${active ? 'hover:bg-blue-100 border-blue-500 bg-blue-100 text-blue-700' : 'hover:bg-gray-100 border-gray-200 bg-gray-50 text-slate-900'}`}>
            <p className="text-sm font-medium">{text}</p>
            { active && <CheckCircle2/> }
        </div>
    )
}

export default function Products(){

    const router = useRouter();

    const [page, setPage] = useState(router.query.page ? parseInt(router.query.page as string) : 1);
    const [tempFilters, setTempFilters] = useState<Filters>(stringToFilter(router.query.filters ? router.query.filters as string : ''));
    const [filters, setFilters] = useState<Filters>(stringToFilter(router.query.filters ? router.query.filters as string : ''));
    const [search, setSearch] = useState(router.query.search ? router.query.search as string : '');
    const [sort, setSort] = useState(router.query.sort ? router.query.sort as string : 'popularity');

    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filterSize = Object.values(filters).reduce((a, b) => a + b.length, 0);

    const { isLoading, isFetching, isError, data: products, error } = useQuery({
        queryKey: ['products-list', { page, search, filters, sort }],
        queryFn: async () => await getProducts({ page, search, filters, sort }),
        retry: false,
        keepPreviousData: true,
        onSuccess: () => updateRoute(),
        enabled: router.isReady
    });
    const updateRoute = () => {
        let url = '/products';
        url += `?page=${page}`;
        if(search) url += `&search=${search}`;
        if(filterSize > 0) url += `&filters=${filterToString(filters)}`;
        if(sort !== 'popularity') url += `&sort=${sort}`;
        router.push(url, url, { shallow: true });
    }


    const applyFilter = (type: 'type', value: ProductType, apply?: boolean) => {
        let newTempFilters = tempFilters;       
        if(type === 'type'){
            if(tempFilters.types.includes(value)){
                newTempFilters = {
                    ...tempFilters,
                    types: tempFilters.types.filter((type) => type !== value)
                }
            } else {
                newTempFilters = {
                    ...tempFilters,
                    types: [...tempFilters.types, value]
                }
            }
        }
        setTempFilters(newTempFilters)
        if(apply){
            setFilters(newTempFilters);
            setPage(1);
        }
        updateRoute();
    }

    const clearFilters = () => {
        setTempFilters({
            types: [],
        });
        setFilters({
            types: [],
        });
    }

    const updateFilters = () => {
        setFilters(tempFilters);
        setPage(1);
        updateRoute();
    }

    const applySort = (value: string) => {
        setSort(value);
        setPage(1);
        setShowSortMenu(false);
    }

    return (
        <DefaultLayout size="2xl">
            <Meta
                title="Udforske produkter | McSetups"
                description="Udforsk vores store udvalg af plugins, skripts og meget mere."
            />
            <div className="border-t border-gray-200">
                <div className="mx-auto max-w-screen-3xl px-2.5 md:px-20 pt-4 pb-10 gap-4">
                    <div className="mt-12 flex flex-col md:flex-row gap-8">
                        <div className="hidden relative lg:flex">
                            <div className="sticky top-2">
                                <div className="border p-4 shadow rounded-lg flex flex-col overflow-hidden lg:w-[200px] xl:w-[300px] bg-white">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-2">
                                            <p className="font-bold text-lg text-slate-900">Filtre produkter</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <FilterBadge active={tempFilters.types.includes('PLUGIN')} text="Plugins" onClick={() => applyFilter('type', "PLUGIN", true)}/>
                                            <FilterBadge active={tempFilters.types.includes('SKRIPT')} text="Skripts" onClick={() => applyFilter('type', "SKRIPT", true)}/>
                                            <FilterBadge active={tempFilters.types.includes('SETUP')} text="Setups" onClick={() => applyFilter('type', "SETUP", true)}/>
                                            <FilterBadge active={tempFilters.types.includes('MAP')} text="Maps" onClick={() => applyFilter('type', "MAP", true)}/>
                                        </div>
                                        <div className="mt-10 text-center font-medium bg-slate-900 text-white p-2 rounded-lg">
                                            Viser {products?.total} produkter
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="gap-4 flex flex-col md:flex-row mb-8">
                                <div className="bg-white flex flex-1 items-center py-2 px-4 rounded-lg gap-2 group border text-gray-500 border-gray-300 focus-within:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
                                    <Search size={20}/>
                                    <input 
                                        type="text" 
                                        className="pl-2 text-gray-500 w-full rounded-lg outline-none ring-0" 
                                        placeholder="Søg efter det helt rigtige produkt"
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
                                <div className="flex gap-2">
                                    <Popover open={showSortMenu} onOpenChange={(value) => setShowSortMenu(value)}>
                                        <PopoverTrigger className="flex-1">
                                            <div className="flex-1 group rounded-lg py-2 px-4 flex gap-3 justify-center items-center bg-white hover:bg-gray-100 border cursor-pointer transition-all text-slate-900">
                                                <SortDesc size={20} className="text-gray-400 group-hover:text-blue-700 transition-all"/>
                                                <p className="font-medium text-sm group-hover:text-blue-700  transition-all">Sorter</p>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <p className="font-bold text-lg text-slate-900">Sorter</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <SortButton active={sort == 'popularity'} text="Mest populære" onClick={() => applySort('popularity')}/>
                                                    <SortButton active={sort == 'newest'} text="Nyeste" onClick={() => applySort('newest')}/>
                                                    <SortButton active={sort == 'oldest'} text="Ældste" onClick={() => applySort('oldest')}/>
                                                    <SortButton active={sort == 'lowestPrice'} text="Laveste pris" onClick={() => applySort('lowestPrice')}/>
                                                    <SortButton active={sort == 'highestPrice'} text="Højeste pris" onClick={() => applySort('highestPrice')}/>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover open={showFilterMenu} onOpenChange={(value) => setShowFilterMenu(value)}>
                                        <PopoverTrigger className="flex-1 lg:hidden">
                                            <div className="group rounded-lg py-2 px-4 flex gap-3 justify-center items-center bg-white hover:bg-gray-100 border cursor-pointer transition-all text-slate-900">
                                                <Filter size={20} className="text-gray-400 group-hover:text-blue-700 transition-all"/>
                                                <p className="font-medium text-sm group-hover:text-blue-700  transition-all">Filter</p>
                                                {filterSize > 0 &&
                                                    <div className="flex justify-center items-center rounded-full bg-blue-700 w-[20px] h-[20px]">
                                                        <p className="text-sm text-white leading-none font-medium">{filterSize}</p>
                                                    </div>
                                                }
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <p className="font-bold text-lg text-slate-900">Produkt type</p>
                                                    <p className="text-gray-500 text-sm">Vælg de produkt typer du ønsker at se</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <FilterBadge active={tempFilters.types.includes('PLUGIN')} text="Plugins" onClick={() => applyFilter('type', "PLUGIN")}/>
                                                    <FilterBadge active={tempFilters.types.includes('SKRIPT')} text="Skripts" onClick={() => applyFilter('type', "SKRIPT")}/>
                                                    <FilterBadge active={tempFilters.types.includes('SETUP')} text="Setups" onClick={() => applyFilter('type', "SETUP")}/>
                                                    <FilterBadge active={tempFilters.types.includes('MAP')} text="Maps" onClick={() => applyFilter('type', "MAP")}/>
                                                </div>
                                            </div>
                                            <div className="border-t pt-2">
                                                <div className="flex justify-end">
                                                    <Button variant="subtle" onClick={() => {
                                                        updateFilters()
                                                        setShowFilterMenu(false)
                                                    }}
                                                    >Bekræft</Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            {(products?.products?.length === 0 && !isLoading && !isFetching) && (
                                <div className="flex flex-col items-center justify-center">
                                {
                                    page == 1 ? (
                                        <>
                                            <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                            <p className="text-xl font-semibold text-slate-900 mt-5">Ingen produkter fundet</p>
                                            <p className="text-sm text-gray-500">Prøv at ændre søgeordet eller prøv igen senere.</p>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                            <p className="text-xl font-semibold text-slate-900 mt-5">Vi har ikke flere produkter</p>
                                            <p className="text-sm text-gray-500">Prøv at ændre søgeordet.</p>
                                        </>
                                    )
                                }
                                </div>
                            )}
                            {(isLoading || isFetching) && <LoadingState/>}
                            {(isError && !isLoading) && <ErrorState/>}
                            {(products?.products?.length || 0 > 0) && (
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 [@media(min-width:1200px)]:grid-cols-3 [@media(min-width:1600px)]:grid-cols-4 gap-4">
                                        {products?.products.map((product) => (
                                            <ProductCard key={product.id} product={product} width="400px"/>
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
                                            Array.from({length: products?.pages || 1}, (_, i) => i+1).map((p) => (
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
                                                (page) < (products?.pages || 0) && (
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
            </div>
        </DefaultLayout>
    )
}
