import { Badge } from "./Badge";

export default function MinecraftVersionsBadges({ versions }: { versions: string[]}){
    return (
        <div className="flex flex-row flex-wrap items-center justify-center gap-1">
            { versions.map(version => <Badge key={version} color="gray" rounded="sm" variant="subtle" size="sm">{version}</Badge>) }
        </div>
    )
}