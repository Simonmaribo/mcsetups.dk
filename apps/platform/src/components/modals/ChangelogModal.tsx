import getRelease from "@/api/products/release/getRelease";
import { dateToString } from "@/lib/date";
import { useQuery } from "@tanstack/react-query";
import { ProductStatus } from "database";
import { Badge } from "../molecules/Badge";
import { Callout } from "../molecules/Callout";
import Markdown from "../organisms/Markdown/Markdown";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";
import LoadingState from "../atoms/state/LoadingState";

export default NiceModal.create(({ releaseId }: { releaseId: string | number | null }) => {
    
    const modal = useModal()

    const { isLoading, isFetching, data: release, isError } = useQuery({
        queryKey: ["release", releaseId],
        queryFn: () => getRelease({ releaseId: releaseId as string }),
        enabled: !!releaseId,
    })

    return (
        <Modal modal={modal}
            title={ release ?
                <>
                    <div className="flex gap-2 items-center">
                        {release?.title}
                        <Badge size="xs" color={release?.status == ProductStatus.APPROVED ? "green" : (
                            release?.status == ProductStatus.PENDING ? "yellow" : "red"
                        )}>{release?.version}</Badge>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{dateToString(release?.createdAt as Date)}</p>
                    </div>
                </> : "Indlæser..."
            }
        >
            { !release ? ( <LoadingState/>) :
            (
                <>
                    <hr/>
                    <div>
                        {
                            !release?.changelog ? (
                                <Callout title="Ingen Changelog" color="red">
                                    Der blev ikke fundet nogen changelog for denne udgivelse
                                </Callout>
                            )
                            :
                            (
                                <Markdown value={release.changelog}/>
                            )
                        }
                    </div>
                </>
            )}
        </Modal>
    )
})