import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

type folders = "images" | "resources";
type buckets = "mcsetups-images" | "mcsetups-resources";

function getBucket(folder: folders): buckets {
    return `mcsetups-${folder}` as buckets;
}

export function getURL(fileId: string, folder: folders): string {
    if(folder == "images")
        return `${process.env.R2_PUBLIC_ACCESS_DOMAIN}/${fileId}`
    return `${process.env.R2_ENDPOINT}/${getBucket(folder)}/${fileId}`;
}

export async function generateSignedUrl(fileId: string, folder: folders): Promise<any> {
    let fileName = fileId;
    if(folder == "resources"){
        try {
            // file name is <name>-<version>;[<uid>];.<extension>
            // we want to remove ;[<uid>];

            let regex = /;(\[.*\]);/g;
            let match = regex.exec(fileId);
            if(match) {
                let index = match.index;
                let length = match[0].length;
                fileName = fileId.substring(0, index) + fileId.substring(index + length);
            }

        } catch {}
    }
    const command = new GetObjectCommand({
        Bucket: getBucket(folder),
        Key: fileId,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    // @ts-ignore
    return await getSignedUrl(client, command, { expiresIn: 5 });
}

export async function uploadFile(file: Express.Multer.File, folder: folders, fileName?: string): Promise<Boolean> {
    try {
        let name = fileName ? fileName : file.filename;
        await client.send(new PutObjectCommand({
            Bucket: getBucket(folder),
            Key: name,
            ContentType: file.mimetype,
            Body: file.buffer,
        }));
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}

export async function uploadFiles(files: { file: Express.Multer.File, folder: folders, fileName?: string}[]): Promise<Boolean> {
    let success = true;
    for (const element of files) {
        if (!await uploadFile(element.file, element.folder, element.fileName)) {
            success = false;
        }
    }
    return success;
}