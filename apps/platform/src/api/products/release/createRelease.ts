import http from "@/api/http";

interface NewRelease {
    productId: string | number;
    title: string;
    version: string;
    resource: File;
    changelog: string;
}

interface Response {
    message?: string;
    error?: string;
}

export default function createProduct(product: NewRelease): Promise<Response> {
    let formData = new FormData();
    formData.append("title", product.title);
    formData.append("version", product.version);
    formData.append("resource", product.resource);
    formData.append("changelog", product.changelog);

    return new Promise(async (resolve, reject) => {
        await fetch(`${http.defaults.baseURL}/products/${product.productId}/release/new`, {
            method: "POST",
            body: formData,
            credentials: 'include'
        }).then((response) => {
            if(response.status === 200)
                resolve({ message: "Release created successfully" });
            else
                reject({ error: "Something went wrong" });
        }).catch((error) => {
            console.error(error);
            reject({ error: "Something went wrong" });
        });
    });
}
