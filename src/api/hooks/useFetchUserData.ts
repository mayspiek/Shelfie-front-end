import { useCallback, useEffect, useState } from "react";
import { UserData } from "../../types/userType";
import { ShelfieHttpClient } from "../client/ShelfieHttpClient";

const useFetchUserData = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getUserData = useCallback(async () => {
        setIsLoading(true);
        const shelfieService = new ShelfieHttpClient();
        const response = await shelfieService.get({ url: '/api/users/me' });
        setUser(response.body as UserData);
        setIsLoading(false);
        
        return response
    }, [user]);
    
    useEffect(() => {
        getUserData();
    }, []);

    return { user, isLoading };
}

export { useFetchUserData };