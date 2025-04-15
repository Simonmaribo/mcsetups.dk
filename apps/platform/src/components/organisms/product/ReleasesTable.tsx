import getAccess from "@/api/products/getAccess";
import { ProductResponse } from "@/api/products/getProduct";
import downloadRelease from "@/api/products/release/downloadRelease";
import ChangelogModal from "@/components/modals/ChangelogModal";
import { relativeTimeAgo, prettyDate } from "@/lib/date";
import { formatBytes } from "@/lib/file";
import NiceModal from "@ebay/nice-modal-react";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { ClipboardType, Download } from "lucide-react";

export default function ReleasesTable({ product }: { product: ProductResponse}){

    const { data } = useQuery({
        queryKey: ['access', `${product.id}`],
        queryFn: async() => await getAccess({ productId: product.id, userId: '@me' }),
        retry: false,
    });

    const canDownload = data?.access;

    return (
        <table className="rounded-lg overflow-hidden w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Version
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Titel
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Udgivelse
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Størrelse
                    </th>
                    <th scope="col" className="px-6 py-3"/>
                </tr>
            </thead>
            <tbody>
                {product.releases.map((release) => (
                    <tr className="group bg-white border-b hover:bg-gray-50" key={release.id}>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex gap-4 items-center">
                                <div className="flex flex-col">
                                    <p>{release.version}</p>
                                </div>
                            </div>
                        </th>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex gap-4 items-center">
                                <div className="flex flex-col">
                                    <p>{release.title}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-1">
                                <Tippy content={<span>{relativeTimeAgo(release.createdAt)}</span>}>
                                    <p className="text-sm text-gray-900">{prettyDate(release.createdAt)}</p>
                                </Tippy>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {formatBytes(release.resourceSize)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="justify-end flex gap-2 invisible group-hover:visible">
                                <Tippy content={<span>Se changelog</span>}>
                                    <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                        onClick={() => NiceModal.show(ChangelogModal, { releaseId: release.id })}
                                    >
                                        <ClipboardType size={20}/>
                                    </div>
                                </Tippy>
                                {canDownload && (
                                    <Tippy content={<span>Download</span>}>
                                        <div className="shadow rounded-lg p-2 bg-white hover:bg-gray-100 hover:text-blue-500 cursor-pointer"
                                            onClick={() => downloadRelease({ releaseId: release.id })}
                                        >
                                            <Download size={20}/>
                                        </div>
                                    </Tippy>
                                )}
                            </div>
                        </td>
                    </tr> 
                ))}
            </tbody>
        </table>
    )
}