import DefaultLayout from "@/layouts/DefaultLayout";
import Meta from "@/layouts/Meta";

export default function Error404() {
    return (
        <DefaultLayout>
            <Meta title="McSetups | Siden blev ikke fundet"/>
            <div className="flex items-center h-full p-16">
                <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
                    <div className="max-w-md text-center">
                        <h2 className="mb-8 font-extrabold text-9xl">
                            <span className="sr-only">Error</span>404
                        </h2>
                        <p className="text-2xl font-semibold md:text-3xl">Siden blev ikke fundet</p>
                        <p className="mt-4 mb-8">Men bare rolig, du kan finde masser af andre ting på vores hjemmeside.</p>
                        <a rel="noopener noreferrer" href="/" className="px-8 py-3 font-semibold rounded bg-blue-600 text-white">Tilbage til forsiden</a>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}