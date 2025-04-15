import http from "@/api/http";

interface Data {
    verified: boolean;
}

export default function editUser(data: (Data & { userId: string | number })): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/admin/users/${data.userId}/edit`, { ...data })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error?.response?.data));
    });
}
