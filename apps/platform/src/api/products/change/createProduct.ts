import http from "@/api/http";

interface NewProduct {
    title: string;
    type: string;
    version: string;
    skriptVersion?: string;
    licensable?: boolean;
    licensePluginName?: string;
    minecraftVersions: string;
    tags: string;
    resource: File;
    banner: File;
    description: string;
    brief: string;
    price: number;
}

interface Response {
    message?: string;
    error?: string;
}

export default function createProduct(product: NewProduct): Promise<Response> {
    let formData = new FormData();
    formData.append("title", product.title);
    formData.append("type", product.type);
    formData.append("version", product.version);
    formData.append("resource", product.resource);
    formData.append("banner", product.banner);
    formData.append("description", product.description);
    formData.append("brief", product.brief);
    formData.append("price", product.price.toString());
    formData.append("skriptVersion", product.skriptVersion || "");
    formData.append("licensable", product.licensable ? "true" : "false");
    formData.append("licensePluginName", product.licensePluginName || "");
    formData.append("minecraftVersions", JSON.stringify(product.minecraftVersions));
    formData.append("tags", JSON.stringify(product.tags || []));

    return new Promise(async (resolve, reject) => {
        await fetch(`${http.defaults.baseURL}/products/new`, {
            method: "POST",
            body: formData,
            credentials: 'include'
        }).then((response) => {
            if(response.status === 200)
                resolve({message: "Product created successfully" });
            else
                reject({ error: "Something went wrong" });
        }).catch((error) => {
            console.error(error);
            reject({ error: "Something went wrong" });
        });
    });
}
