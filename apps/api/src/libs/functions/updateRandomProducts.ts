import Server from "@/interfaces/Server";
import { Prisma, Product } from "database";

export async function updateRandomProducts(server: Server){
    // get 10 totally random products
    const currentFeaturedProducts = await server.database.product.findMany({
        where: {
            randomFeatured: true
        }
    });

    // set all current featured products to false
    await server.database.product.updateMany({
        where: {
            randomFeatured: true
        },
        data: {
            randomFeatured: false
        }
    });

    // get 10 random products not in the current featured products
    const newFeaturedProducts: Product[] = await server.database.$queryRaw(
        Prisma.sql`
            SELECT * FROM Product 
            WHERE 
                randomFeatured = 0 
            AND 
                id NOT IN (${currentFeaturedProducts.map((product) => product.id).join(",")}) 
            AND 
                public = 1
            AND
                price > 0
            ORDER BY RAND() 
            LIMIT 10
        `);

    // set the new featured products to true
    await server.database.product.updateMany({
        where: {
            id: {
                in: newFeaturedProducts.map((product) => product.id)
            }
        },
        data: {
            randomFeatured: true
        }
    });
}