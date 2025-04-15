import { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/router";
import * as amplitude from '@amplitude/analytics-browser';

export default function withAuth (Component: React.ComponentType, options?: { verified?: boolean, maxGroup?: number }) {
    const Authentication = () => {
        const router = useRouter();
        const { user, isLoading, isError } = useUser();
        useEffect(() => {
            if (isError) {
                router.push("/404");
            } else if(user && options?.verified == true && !user.verified) {
                router.push("/404");
            } else if (user && options?.maxGroup && user.group > options?.maxGroup) {
                router.push("/404");
            }
        }, [router, user, isError])

        if (isError || !user) return null;
        if (isLoading) return null;
        if (options?.verified == true && !user.verified) return null;
        if (options?.maxGroup && user.group > options?.maxGroup) return null;

        amplitude.setUserId(`${user.id}`);

        return <Component />
    }
    return Authentication;
}