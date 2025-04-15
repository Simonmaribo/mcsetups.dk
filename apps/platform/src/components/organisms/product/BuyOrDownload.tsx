import downloadProduct from "@/api/products/downloadProduct";
import getAccess from "@/api/products/getAccess";
import { ProductResponse } from "@/api/products/getProduct";
import purchaseProduct from "@/api/products/purchaseProduct";
import { Button, DivButton } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useUser from "@/hooks/useUser";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

export default function BuyOrDownload({ product, userId = "@me" }: { product: ProductResponse, userId?: string | number }){

    const { user } = useUser();
    const router = useRouter();

    const queryClient = useQueryClient()
    const { data, isLoading } = useQuery({
        queryKey: ['access', `${product.id}`],
        queryFn: async() => await getAccess({ productId: product.id, userId }),
        retry: false,
    });
    
    const [open, setOpen] = useState(false);

    const canDownload = data?.access;

    async function purchase(){
        await purchaseProduct({ productId: product.id })
        .then((data) => {
            toast.success("Du har købt produktet: " + product.title)
        })
        .catch((error) => {
            toast.error("Der skete en fejl under købet af produktet: " + product.title)
            console.log(error)
        })
        .finally(() => {
            queryClient.invalidateQueries({ queryKey: ['access', `${product.id}`]})
            setOpen(false)
        })
    }
    
    const onSale = product.sale >= 0;
    let difference = product.price - product.sale;
    let price = product.sale >= 0 ? product.sale : product.price;
    
    if(canDownload) return <Button className="flex-1 font-semibold text-lg" variant="subtle-success" onClick={() => downloadProduct({ productId: product.id })}>Download</Button>
    else return (
        <>
            { user ? (
                <>
                    <Button className="flex-1 font-semibold text-lg" variant={onSale ? "sale" : "emerald"} onClick={() => setOpen(true)}>
                        {
                            onSale ? (
                                <div className="flex flex-row gap-1">
                                    <p className="font-bold text-lg text-white">Køb {price/100} DKK</p>
                                    <p className="font-semibold text-lg text-white line-through">{product.price/100} DKK</p>
                                </div>
                            ) : (
                                <>Køb for {price/100} DKK</>
                            )
                        }
                    </Button>
                    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
                        <DialogContent>
                            {(user.balance || 0) < price ? (
                                <div>
                                    <p>Du har ikke nok penge på din konto til at købe dette produkt.</p>
                                    <DialogFooter className="mt-4">
                                        <div className="flex justify-end">
                                            <Link href="/profile">
                                                <Button variant="subtle-destructive">Indsæt penge</Button>
                                            </Link>
                                        </div>
                                    </DialogFooter>
                                </div>
                                )
                                :
                                (
                                    <div>
                                        <DialogHeader>
                                            <DialogTitle>Køb af produkt</DialogTitle>
                                            <DialogDescription>
                                                Du er ved at foretage et køb af produktet: <span className="font-medium">{product.title}</span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="rounded-lg mt-2 bg-gray-100 p-4">
                                            <div className="flex justify-between">
                                                <p className="font-medium">Din saldo</p>
                                                <p className="text-green-700">{user.balance/100} DKK</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <p className="font-medium">Pris</p>
                                                <p className="text-red-700">-{product.price/100} DKK</p>
                                            </div>
                                            {
                                                onSale ? (
                                                    <div className="flex justify-between">
                                                        <p className="font-medium">Rabat</p>
                                                        <p className="text-green-700">{difference/100} DKK</p>
                                                    </div>
                                                ) : null
                                            }
                                            <hr className="my-2"/>
                                            <div className="flex justify-between">
                                                <p className="font-medium">Ny saldo</p>
                                                <p className="text-slate-900 font-medium">{(user.balance - price)/100} DKK</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="mt-2 text-sm text-slate-900">Ved at købe dette produkt, accepterer du vores <a href="/tos" className="text-blue-600">vilkår og betingelser</a>.</p>
                                        </div>
                                        <DialogFooter className="mt-4">
                                            <div className="flex justify-end">
                                                <Button onClick={purchase}>Bekræft køb på {price/100} DKK</Button>
                                            </div>
                                        </DialogFooter>
                                    </div>
                                )
                            }
                        </DialogContent>
                    </Dialog>
                </>
                )
                :
                (
                    <DivButton className="flex-1 font-semibold text-lg cursor-pointer" variant={onSale ? "sale" : "emerald"} onClick={() => router.push('/login')}>
                        {
                            onSale ? (
                                <div className="flex flex-row gap-1">
                                    <p className="font-bold text-lg text-white">Køb {price/100} DKK</p>
                                    <p className="font-semibold text-lg text-white line-through">{product.price/100} DKK</p>
                                </div>
                            ) : (
                                <>Køb for {price/100} DKK</>
                            )
                        }
                    </DivButton>
                )
            }
        </>
    )
}