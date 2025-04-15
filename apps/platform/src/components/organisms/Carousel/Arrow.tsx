import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CarouselArrow({ direction = "left", onClick }: { direction?: "left" | "right", onClick: () => void }) {
    // onMove means if dragging or swiping in progress.

    return (
        <div className="bg-white border shadow p-2 rounded-full cursor-pointer active:scale-95"  onClick={() => onClick()}>
            {direction === "left" ? <ArrowLeft /> : <ArrowRight />}
        </div>
    )
};