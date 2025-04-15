import http from "@/api/http";

interface Data {
    displayName: string;
    description: string;
    emailNotifications: boolean;
}

export default function updateProfile(data: (Data & { userId?: string; })): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/user/${data.userId || '@me'}/profile`, { ...data })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error?.response?.data));
    });
}
