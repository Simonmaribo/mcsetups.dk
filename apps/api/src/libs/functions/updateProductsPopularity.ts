import Server from "@/interfaces/Server";
import { Product } from "database";

type ProductWithPurchases = Product & { purchases?: number };

export async function updateProductsPopularity(server: Server){

    const products: ProductWithPurchases[] = await server.database.product.findMany();

    const purchases = await server.database.purchase.findMany({
        where: {
            type: 'PURCHASE'
        }
    });

    for(const purchase of purchases){
        const product = products.find((product) => product.id === purchase.productId);
        if(!product) continue;
        if(!product.purchases) product.purchases = 0;
        product.purchases += 1;
    }

    products.sort((a, b) => {
        let popularityA = (a.purchases || 0) * 10 + a.estimatedViews * 0.25;
        let popularityB = (b.purchases || 0) * 10 + b.estimatedViews * 0.25;
        return popularityB - popularityA;
    });

    for(let i = 0; i < products.length; i++){
        await server.database.product.update({
            where: {
                id: products[i].id,
            },
            data: {
                popularity: i,
            },
        });
    }

}
