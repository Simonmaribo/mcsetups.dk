import Server from "@/interfaces/Server";

export async function updateStats(server: Server){
    const products = await server.database.product.findMany({
        include: {
            _count: {
                select: {
                    purchases: true,
                    favorites: true,
                }
            }
        }
    });

    let date = new Date();

    const totalData = {
        date,
        purchases: 0,
        favorites: 0,
        views: 0,
        downloads: 0,
    }

    const data: {
        date: Date,
        productId: number,
        purchases: number,
        favorites: number,
        views: number,
        downloads: number,
    }[] = []
    for(let product in products){
        data.push({
            date: date,
            productId: products[product].id,
            purchases: products[product]._count.purchases,
            favorites: products[product]._count.favorites,
            views: products[product].estimatedViews,
            downloads: products[product].estimatedDownloads,
        })
        totalData.purchases += products[product]._count.purchases;
        totalData.favorites += products[product]._count.favorites;  
        totalData.views += products[product].estimatedViews;
        totalData.downloads += products[product].estimatedDownloads;
    }

    await server.database.productHistoryStat.createMany({
        data: data,
    })

    await server.database.totalDailyProductStats.create({
        data: totalData,
    })
}
