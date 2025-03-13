import React, { ReactNode, useState, useCallback, useMemo } from 'react';
import { User } from '../types/Users';
import { UserContext } from './UserContext'

interface UserContextProps {
    children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {

    const [user, setUser] = useState<User | undefined>(undefined);
    // Setter function to set the user in the context and in the localStorage
    const setUserContext = useCallback((user: User) => {
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user);
    }, []);

    // Login mutation, only login sets the user in the context.
    // How do I verify the token if I don't have access?
    //TODO Esto tiene que hacerse con un refresh token
/*     const loginMutation = useMutation({
        mutationKey: ["Login"],
        mutationFn: login,
        onSuccess: (data: User) => {
            setUser(data)
            console.log("login")
        },
        onError: (e) => {
            console.error(e)
        }
    }); */
    
    // Getter function to get the user from the context or from the localStorage
    const getUserContext = useCallback(() => {
        const userStorage = localStorage.getItem('user');
        const parsedUser = userStorage ? JSON.parse(userStorage) : null;

        if(user) {
            console.log("usuario del contexto", user);
            return user;
        }
        else if (parsedUser) { 
            /* loginMutation.mutate(parsedUser) */
            setUser(parsedUser)
            console.log("usuario del Storage", parsedUser);
            return parsedUser;
        }
        return undefined
    }, [user]);

    const memoizedUserContextValue = useMemo(() => {
        return {
            getUserContext,
            setUserContext,
        };
    }, [getUserContext, setUserContext]);

    return (
        <UserContext.Provider value={ memoizedUserContextValue }>
            {children}
        </UserContext.Provider>
    );
}