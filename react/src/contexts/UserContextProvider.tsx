import React, { ReactNode, useState, useCallback, useMemo } from 'react';
import { User } from '../types/Users';
import { UserContext } from './UserContext'

interface UserContextProps {
    children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {
    const [user, setUser] = useState<User | undefined>(undefined);

    const setUserContext = useCallback((user: User) => {
        setUser(user);
    }, []);
    

    const getUserContext = useCallback(() => {
        return user;
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