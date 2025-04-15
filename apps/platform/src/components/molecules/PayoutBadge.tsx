import { PayoutStatus } from "database"
import { Badge } from "./Badge"

const PayoutBadge = ({ status }: { status: PayoutStatus }) => {
    switch (status) {
        case PayoutStatus.PENDING:
            return <Badge color="yellow" rounded={"md"} variant={"subtle"} size="sm">Afventer</Badge>
        case PayoutStatus.COMPLETED:
            return <Badge color="green" rounded={"md"} variant={"subtle"} size="sm">Betalt</Badge>
        default:
            return <Badge color="gray" rounded={"md"} variant={"subtle"} size="sm">Ukendt</Badge>
    }
}


export default PayoutBadge