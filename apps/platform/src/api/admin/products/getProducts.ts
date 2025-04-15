import http from "@/api/http";
import { ProductType } from "database";

type ProductsResponse = {
    products: {
        estimatedDownloads: number;
        price: number;
        createdAt: Date;
        title: string;
        id: number;
        type: ProductType;
        public: boolean;
        bannerId: string;
        bannerUrl: string | null;
        updatedAt: Date;
        estimatedViews: number;
        sale: number;
        _count: {
            purchases: number;
        };
    }[];
    total: number;
    pages: number;
    currentPage: number;
}

export type Filters = {
    types: ProductType[];
}

export const stringToFilter = (str: string): Filters => {
    const filters: Filters = { types: [] };
    const split = str.split(',');
    split.forEach((filter) => {
        const split = filter.split(':');
        if(split[0] === 'type'){
            filters.types.push(split[1] as ProductType);
        }
    });
    return filters;
}

export const filterToString = (filters: Filters) => {
    let str = '';

    // for each filter, add it to the string as <type>:<value> separated by a comma
    filters.types.forEach((type, index) => {
        str += `type:${type}`;
        if(index !== filters.types.length - 1){
            str += ',';
        }
    });
    return str;
}


export default function getProducts({ 
    page = 1,
    limit = 12, 
    filters = {
        types: []
    }, 
    search = "",
    sort = 'popularity'
}: { page?: number, limit?: number, filters?: Filters, search?: string, sort?: string }): Promise<ProductsResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/products/list`, { params: { page, limit, filters: filterToString(filters), search, sort } })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
