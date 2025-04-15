import DefaultLayout from "@/layouts/DefaultLayout";
import Meta from "@/layouts/Meta";

export default function ToS(){
    return (
        <DefaultLayout>
            <Meta title="McSetups | Terms of Service"/>
            <div className="border-t border-gray-200">
                <div className="my-5 relative mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-4 pb-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                        <h3 className="text-xl text-slate-600">Læs venligst disse servicevilkår omhyggeligt, før du bruger <strong>McSetups</strong>-tjenester.</h3>
                    </div>
                    <div className="flex flex-col-reverse lg:flex-row gap-2">
                        <div className="relative">
                            <div className="sticky top-2">
                                <div className="relative after:w-full flex-col mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                                    <h1 className="text-2xl font-bold text-slate-900">Navigation</h1>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="py-1 px-2 rounded-lg hover:bg-gray-50 transition-all delay-50 cursor-pointer">
                                            <a href="#definitioner" className="text-lg font-medium text-blue-500">Definitioner</a>
                                        </div>
                                        <div className="py-1 px-2 rounded-lg hover:bg-gray-50 transition-all delay-50 cursor-pointer">
                                            <a href="#licens" className="text-lg font-medium text-blue-500">Licens</a>
                                        </div>
                                        <div className="py-1 px-2 rounded-lg hover:bg-gray-50 transition-all delay-50 cursor-pointer">
                                            <a href="#underage" className="text-lg font-medium text-blue-500">Børn under 18</a>
                                        </div>
                                        <div className="py-1 px-2 rounded-lg hover:bg-gray-50 transition-all delay-50 cursor-pointer">
                                            <a href="#diverse" className="text-lg font-medium text-blue-500">Diverse</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative lg:flex-1 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            <div>
                                Text
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}