import Meta from '@/layouts/Meta'
import DefaultLayout from '@/layouts/DefaultLayout'
import ProductCard from '@/components/organisms/ProductCard'
import getFrontpage, { FrontpageProduct, FrontpageResponse } from '@/api/products/getFrontpage'
import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next'
import { AnchorButton } from '@/components/ui/button'
import Link from 'next/link'
import { Callout } from '@/components/molecules/Callout'
import Carousel from '@/components/organisms/Carousel'
import CompaniesTestimonials from '@/components/organisms/CompanyTestimonial'
import SpecialOrderBox from '@/components/organisms/SpecialOrderBox'


export default function Home({ topProducts, randomProducts }: InferGetServerSidePropsType<typeof getServerSideProps>){

  return (
    <DefaultLayout size="2xl" bgColor='white'>
      <Meta/>
      <div className="border-t border-gray-200 bg-white h-full">
        <div className="mx-auto max-w-screen-2xl px-2.5 md:px-20">
          <div className="flex flex-col gap-4 pt-10">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold text-slate-900">Kategorier</h1>
              <div className="flex flex-row flex-wrap gap-4 items-center">
                <Link className="flex-1" href={'/products?page=1&filters=type:SKRIPT'} passHref>
                  <div className="flex-1 cursor-pointer shadow rounded-lg overflow-hidden bg-[url('/images/product-type.png')] bg-center h-[100px] min-w-[250px] hover:md:scale-105 hover:shadow-lg transition-all delay-75">
                    <div className="flex items-center justify-center w-full h-full bg-indigo-500/60 p-5">
                      <h1 className="text-white font-bold text-4xl">Skripts</h1>
                    </div>
                  </div>
                </Link>
                <Link className="flex-1" href={'/products?page=1&filters=type:PLUGIN'} passHref>
                  <div className="flex-1 cursor-pointer shadow rounded-lg overflow-hidden bg-[url('/images/product-type.png')] bg-center h-[100px] min-w-[250px] hover:md:scale-105 hover:shadow-lg transition-all delay-75">
                    <div className="flex items-center justify-center w-full h-full bg-orange-500/60 p-5">
                      <h1 className="text-white font-bold text-4xl">Plugins</h1>
                    </div>
                  </div>
                </Link>
                <Link className="flex-1" href={'/products?page=1&filters=type:MAP'} passHref>
                  <div className="flex-1 cursor-pointer shadow rounded-lg overflow-hidden bg-[url('/images/product-type.png')] bg-center h-[100px] min-w-[250px] hover:md:scale-105 hover:shadow-lg transition-all delay-75">
                    <div className="flex items-center justify-center w-full h-full bg-emerald-500/60 p-5">
                      <h1 className="text-white font-bold text-4xl">Maps</h1>
                    </div>
                  </div>
                </Link>
                <Link className="flex-1" href={'/products?page=1&filters=type:SETUP'} passHref>
                  <div className="flex-1 cursor-pointer shadow rounded-lg overflow-hidden bg-[url('/images/product-type.png')] bg-center h-[100px] min-w-[250px] hover:md:scale-105 hover:shadow-lg transition-all delay-75">
                    <div className="flex items-center justify-center w-full h-full bg-rose-500/60 p-5">
                      <h1 className="text-white font-bold text-4xl">Setups</h1>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <Carousel title="Mest populære produkter">
                {topProducts.map((product) => (
                  <ProductCard className="m-1" key={product.id} product={product} width="400px"/>
                ))}
              </Carousel>
              { topProducts.length === 0 && (
                <Callout title="Ingen produkter fundet" color="red" variant="outline">
                  Der er på nuværende tidspunkt ingen produkter tilgængelige. Prøv igen senere.
                </Callout>  
              )}
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <Carousel title="Dagens udvalgte produkter">
                {randomProducts.map((product) => (
                  <ProductCard className="m-1" key={product.id} product={product} width="400px"/>
                ))}
              </Carousel>
              { randomProducts.length === 0 && (
                <Callout title="Ingen produkter fundet" color="red" variant="outline">
                  Der er på nuværende tidspunkt ingen produkter tilgængelige. Prøv igen senere.
                </Callout>  
              )}
            </div>
            <Link href="https://fragmentor.io?ref=McSetups.dk" passHref target='_blank'>
              <div className="cursor-pointer shadow-lg rounded-lg overflow-hidden">
                <img className="w-full" src="/images/fragmentor.png" alt="Fragmentor"/>
              </div>
            </Link>
            <div className="my-10">
              <CompaniesTestimonials/>
            </div>
            <SpecialOrderBox className='mb-10'/>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}


export const getServerSideProps: GetServerSideProps<{ topProducts: FrontpageProduct[], randomProducts: FrontpageProduct[]}> = async (context: GetServerSidePropsContext) => {
  context.res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=59');

  let frontPage: FrontpageResponse
  try {
    frontPage = await getFrontpage()
  } catch (error) {
    frontPage = {
      topProducts: [],
      randomProducts: []
    }
  }
  return {
      props: {
        topProducts: frontPage.topProducts,
        randomProducts: frontPage.randomProducts
      }
  }
}
