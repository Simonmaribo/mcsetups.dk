import Router from "next/router";
import { useEffect } from "react";
import getUser from '@/api/users/getUser';
import { useQuery } from "@tanstack/react-query";

export default function useUser({
    redirectTo = "",
    redirectIfFound = false,
} = {}) {

    const { isLoading, isError, data, error } = useQuery({
        queryKey: ['user'],
        queryFn: async() => await getUser(),
        retry: false,
    });

    useEffect(() => {
        if (!redirectTo || !data) return;
        if (
            (redirectTo && !redirectIfFound && !data) ||
            (redirectIfFound && data)
        ) {
            Router.push(redirectTo);
        }
    }, [data, redirectIfFound, redirectTo]);


    return { user: data, isLoading, isError, error }
}