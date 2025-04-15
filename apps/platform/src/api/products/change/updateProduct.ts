import http from "@/api/http";
import { ProductResponse } from "../getProduct";

interface NewProduct {
    title: string;
    minecraftVersions: string;
    tags: string;
    banner: File;
    description: string;
    brief: string;
    price: number;
    sale: number;
}

interface Response {
    message?: string;
    error?: string;
}

export default function createProduct({ currentProduct, newProduct }: { currentProduct: ProductResponse, newProduct: NewProduct }): Promise<Response> {
    let formData = new FormData();
    formData.append("title", newProduct.title || currentProduct.title);
    formData.append("banner", newProduct.banner);
    formData.append("description", newProduct.description || currentProduct.description);
    formData.append("brief", newProduct.brief || currentProduct.brief);
    formData.append("price", newProduct.price.toString() || currentProduct.price.toString());
    formData.append("sale", newProduct.sale.toString() || currentProduct.sale.toString());
    formData.append("minecraftVersions", JSON.stringify(newProduct.minecraftVersions || currentProduct.minecraftVersions));
    formData.append("tags", JSON.stringify(newProduct.tags || currentProduct.tags));

    return new Promise(async (resolve, reject) => {
        await fetch(`${http.defaults.baseURL}/products/${currentProduct.id}/update`, {
            method: "PUT",
            body: formData,
            credentials: 'include'
        }).then((response) => {
            if(response.status === 200)
                resolve({message: "Product updated" });
            else
                reject({ error: "Something went wrong" });
        }).catch((error) => {
            console.error(error);
            reject({ error: "Something went wrong" });
        });
    });
}
