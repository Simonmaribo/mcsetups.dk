import { ProductType } from "database"
import { Badge } from "./Badge"
import { Codesandbox, FileCode, Settings, Map } from "lucide-react"

export default function ProductTypeBadge({ type }: { type: ProductType }) {
    switch (type) {
        case ProductType.PLUGIN:
            return <Badge size="xs" color="pink" variant={"subtle"} leadingContent={<Codesandbox size={16}/>}>Plugin</Badge>
        case ProductType.SKRIPT:
            return <Badge size="xs" color="purple" variant={"subtle"} leadingContent={<FileCode size={16}/>}>Skript</Badge>
        case ProductType.MAP:
            return <Badge size="xs" color="blue" variant={"subtle"} leadingContent={<Map size={16}/>}>Map</Badge>
        case ProductType.SETUP:
            return <Badge size="xs" color="green" variant={"subtle"} leadingContent={<Settings size={16}/>}>Setup</Badge>
        case ProductType.OTHER:
            return <Badge size="xs" color="gray" variant={"subtle"}>Andet</Badge>
    }
}