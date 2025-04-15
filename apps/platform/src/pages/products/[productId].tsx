import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import getProduct, { ProductResponse } from "@/api/products/getProduct";
import Meta from "@/layouts/Meta";
import Markdown from "@/components/organisms/Markdown/Markdown";
import DefaultLayout from "@/layouts/DefaultLayout";
import ProductInfo from "@/components/organisms/product/ProductInfo";
import { useState } from "react";
import ReleasesTable from "@/components/organisms/product/ReleasesTable";
import MinecraftVersionsBadges from "@/components/molecules/MinecraftVersionsBadges";

export default function Product({ product }: InferGetServerSidePropsType<typeof getServerSideProps>){

    const [tab, setTab] = useState<"showcase" | "versions">("showcase");
    
    return (
        <DefaultLayout size="2xl">
            <Meta
                title={`${product.title} | MCSetups`}
                url={`https://mcsetups.dk/products/${product.id}`}
                description={product.brief}
                banner={product.bannerUrl}
            />
            <div className="border-t border-gray-200">
                <div className="my-5 relative mx-auto max-w-screen-2xl px-2.5 md:px-20 pt-4 pb-10 flex flex-col-reverse lg:flex-row gap-2">
                    <div>
                        <div className="relative lg:flex-1 w-full mx-auto text-left ring-1 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                            {
                                tab == "versions" ? (
                                    <ReleasesTable product={product}/>
                                ) : (
                                    <div>
                                        <Markdown value={product.description}/>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div className="relative">
                        <div className="sticky top-2">
                            <ProductInfo product={product} tab={tab} setTab={setTab}/>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}


export const getServerSideProps: GetServerSideProps<{ product: ProductResponse}> = async (context: GetServerSidePropsContext) => {
    context.res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    const productId = context?.params?.productId;
    if(!productId) return { notFound: true }
    let data;
    try {
        data = await getProduct({productId: `${productId}`, addView: true })
    } catch (error) {
        return { notFound: true }
    }
    return {
        props: {
            product: data
        },
    }
}