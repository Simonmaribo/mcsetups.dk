import getFavorites from '@/api/users/favorites/getFavorites';
import { useQuery } from "@tanstack/react-query";

export default function useFavorites() {

    const { isLoading, isError, data, error } = useQuery({
        queryKey: ['favorites'],
        queryFn: async() => await getFavorites(),
        retry: false,
    });

    return { favorites: data || [], isLoading, isError, error }
}