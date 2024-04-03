import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { config } from "../api/config";

const API_URL = config.apiUrl;

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadingStoreData = async () => {
            const storageUser = localStorage.getItem('@Auth:user');
            const storageToken = localStorage.getItem('@Auth:token');

            if (storageUser && storageToken) {
                setUser(storageUser);
                axios.AxiosHeaders = {Authorization: `Bearer ${storageToken}`}
            }
        };
        loadingStoreData();
    }, [user]);

    const getUser = async (token) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(API_URL + '/api/users/me' ,{
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return response.data;

    }

    const signIn = async (userLoginData) => {
        const response = await axios.post(API_URL + '/auth/login', userLoginData);
        console.log(response);

        const token = response.data.token;
        const expiresInMilliseconds = response.data.expiresIn;
        const expirationDate = new Date(new Date().getTime() + expiresInMilliseconds);

        localStorage.setItem('@Auth:token', token);
        localStorage.setItem('@Auth:expirationDate', expirationDate.toISOString());

        setTimeout(logout, expiresInMilliseconds);

        if (response.data.error) {
            alert(response.data.error);
        }else{
            const response = await getUser(token);
            setUser(response.id);
            
            const user = response.id;
            localStorage.setItem('@Auth:user', user);

            // return { token, user, expirationDate };n
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('@Auth:token');
        localStorage.removeItem('@Auth:user');
        localStorage.removeItem('@Auth:expirationDate');
    };

    return (
        <AuthContext.Provider value={{
            user,
            // significa que signEd será verdadeiro (true) se user não for nulo (null)
            signed : !!user,
            signIn,
            logout
        }}>
            { children }
        </AuthContext.Provider>
    );
};