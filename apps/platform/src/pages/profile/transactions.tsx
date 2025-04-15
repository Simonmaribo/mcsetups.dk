import withAuth from "@/hoc/withAuth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ErrorState from "@/components/atoms/state/ErrorState";
import { useRouter } from "next/router";
import { dateToFullString, relativeTimeAgo } from "@/lib/date";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import Tippy from "@tippyjs/react";
import { Badge } from "@/components/molecules/Badge";
import getTransactions, { TransactionsResponse } from "@/api/users/getTransactions";
import ProfileLayout from "@/layouts/ProfileLayout";
import { Button } from "@/components/ui/button";

function Transactions(){

    const router = useRouter();

    const routerPage = router.query.page ? parseInt(router.query.page as string) : 1;
    
    const [page, setPage] = useState(routerPage);

    const { isLoading, isFetching, isError, data: transactions, error } = useQuery({
        queryKey: ['transactions', '@me', { page }],
        queryFn: async() => await getTransactions({ page }),
        retry: false,
        keepPreviousData: true,
        onSuccess: () => {
            let url = '/profile/transactions';
            url += `?page=${page}`;
            router.push(url, undefined, { shallow: true });
        }
    });

    if(isError) return <ErrorState message={`${error}`}/>

    const isTransactionPositive = (transaction: TransactionsResponse) => {
        switch(transaction.type){
            case "DEPOSIT":
            case "SALE":
                return true;
            case "PURCHASE":
            case "PAYOUT":
                return false;
        }
    }

    const getBadge = (transaction: TransactionsResponse): React.ReactNode => {
        switch(transaction.type){
            case "DEPOSIT":
                return <Badge color="green" rounded="lg"><span className="px-4 py-1">Indbetaling</span></Badge>;
            case "SALE":
                return <Badge color="green" rounded="lg"><span className="px-4 py-1">Salg</span></Badge>;
            case "PURCHASE":
                return <Badge color="red" rounded="lg"><span className="px-4 py-1">Køb</span></Badge>;
            case "PAYOUT":
                return <Badge color="red" rounded="lg"><span className="px-4 py-1">Udbetaling</span></Badge>;
        }
    }

    const getTransactionDescription = (transaction: TransactionsResponse): React.ReactNode => {
        switch(transaction.type){
            case "DEPOSIT":
                return <p className="text-sm font-medium h-10 py-2 bg-transparent underline-offset-4 text-slate-900 px-0">Indbetaling</p>
            case "SALE":
                if(transaction.product)
                    return (
                        <Link href={`/profile/products/${transaction.product.id}`}>
                            <Button variant="link">Salg af {transaction.product.title}</Button>
                        </Link>
                    )
                return <p className="text-sm font-medium h-10 py-2 bg-transparent underline-offset-4 text-slate-900 px-0">Salg</p>
            case "PURCHASE":
                if(transaction.product)
                    return (
                        <Link href="/profile/purchases">
                            <Button variant="link">Køb af {transaction.product.title}</Button>
                        </Link>
                    )
                return <p className="text-sm font-medium h-10 py-2 bg-transparent underline-offset-4 text-slate-900 px-0">Køb</p>
            case "PAYOUT":
                return <p className="text-sm font-medium h-10 py-2 bg-transparent underline-offset-4 text-slate-900 px-0">Udbetaling</p>
        }
    }

    return (
        <ProfileLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Dine transaktioner</h1>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                    <div className="relative overflow-x-auto sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Handling
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Beløb
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Beskrivelse
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Tidspunkt
                                    </th>
                                    <th scope="col" className="px-6 py-3"/>
                                </tr>
                            </thead>
                            <tbody>
                                { transactions?.map((transaction, index) => (
                                    <tr className="group bg-white border-b hover:bg-gray-50" key={transaction.id}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {getBadge(transaction)}
                                        </th>
                                        <td className="px-6 py-4">
                                            <div className="cursor-default">
                                                {
                                                    isTransactionPositive(transaction) ? (
                                                        <span className="text-green-500 font-semibold">+ {transaction.amount/100} DKK</span>
                                                    ) : (
                                                        <span className="text-red-500 font-semibold">- {transaction.amount/100} DKK</span>
                                                    )
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getTransactionDescription(transaction)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex">
                                                <Tippy content={<span>{relativeTimeAgo(transaction.createdAt)}</span>}>
                                                    <p className="cursor-default">{dateToFullString(transaction.createdAt)}</p>
                                                </Tippy>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="justify-end flex invisible group-hover:visible">
                                                <div className="rounded-lg p-2 hover:text-slate-900 cursor-pointer">
                                                    <MoreVertical size={20}/>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>   
                                ))}
                            </tbody>
                        </table>
                        { (!isLoading && !isFetching && transactions?.length <= 0) && (
                            <div className="flex flex-col items-center justify-center p-10">
                            {
                                page == 1 ? (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Ingen transaktioner</p>
                                        <p className="text-sm text-gray-500">Du har ikke foretaget nogle transaktioner.</p>
                                    </>
                                ) : (
                                    <>
                                        <img src="/images/search.svg" alt="" className="w-32 h-32"/>
                                        <p className="text-xl font-semibold text-slate-900 mt-5">Ikke flere transaktioner</p>
                                        <p className="text-sm text-gray-500">Så er der vist ikke flere transaktioner. Puha!</p>
                                    </>
                                )
                            }
                            </div>
                        )}

                        <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
                            <ul className="inline-flex items-center -space-x-px">
                                <li>
                                    <p onClick={() => page <= 1 ? null : setPage(page-1)} className="cursor-pointer block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700">
                                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    </p>
                                </li>
                                <li>
                                    <p className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">{page}</p>
                                </li>
                                <li>
                                    <p onClick={() => setPage(page+1)} className="cursor-pointer block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700">
                                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                    </p>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    )
}

export default withAuth(Transactions);