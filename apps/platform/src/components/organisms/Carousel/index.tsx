import { useRef } from "react";
import MultiCarousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CarouselArrow from "./Arrow";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
    partialVisibilityGutter: 40
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    partialVisibilityGutter: 40
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 2,
    partialVisibilityGutter: 30
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    partialVisibilityGutter: 30
  }
};

export default function Carousel({ title, children }: { title?: string, children: React.ReactNode }) {

    const ref = useRef(null);

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center gap-2">
                <h1 className="text-4xl font-bold text-slate-900">{title || ""}</h1>
                <div className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    <CarouselArrow direction="left" onClick={() => ref?.current?.previous()} />
                    {/* @ts-ignore */}
                    <CarouselArrow direction="right" onClick={() => ref?.current?.next()} />
                </div>
            </div>
            <MultiCarousel 
                responsive={responsive} 
                ref={ref}
                partialVisible={true}
                removeArrowOnDeviceType={["tablet", "mobile"]}
                arrows={false}
                infinite={true}
                ssr={true}
            >
                {children}
            </MultiCarousel>
        </div>
    );
}