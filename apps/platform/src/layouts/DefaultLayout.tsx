import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/Navbar";

export default function DefaultLayout({ 
    size = "xl",
    bgColor = "gray-50",
    children 
}: { size?: string, bgColor?: string, children: React.ReactNode }){
    return (
        <div className={`min-h-screen m-0 w-full bg-${bgColor} flex flex-col`}>
            <Navbar size={size}/>
            <main className="flex-1">
                {children}
            </main>
            <Footer/>
        </div>
    )
}