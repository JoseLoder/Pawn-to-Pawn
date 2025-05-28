import React, { ReactNode, useState, useCallback, useMemo } from 'react';
import { PublicUser } from '@pawn-to-pawn/shared';
import { UserContext } from './UserContext'

interface UserContextProps {
    children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {

    const [user, setUser] = useState<PublicUser | undefined>(undefined);
    // Setter function to set the user in the context and in the localStorage
    const setUserContext = useCallback((user: PublicUser | undefined) => {
        if (user) {
            const stringUser = JSON.stringify(user)
            localStorage.setItem('user', stringUser)
        }
        setUser(user);
    }, [])

    // Login mutation, only login sets the user in the context.
    // How do I verify the token if I don't have access?
    //TODO Esto tiene que hacerse con un refresh token y de esa manera tenemos token
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
        let userStorage = localStorage.getItem('user');
        if (userStorage === 'undefined') {
            userStorage = null;
        }
        const parsedUser = userStorage ? JSON.parse(userStorage) : null;

        if (user) { //This.user 

            return user;
        }
        else if (parsedUser) { //LocalStorage User
            /* loginMutation.mutate(parsedUser) */
            setUser(parsedUser)
            return parsedUser;
        }
        return null
    }, [user]);

    const memoizedUserContextValue = useMemo(() => {
        return {
            getUserContext,
            setUserContext,
        };
    }, [getUserContext, setUserContext]);

    return (
        <UserContext.Provider value={memoizedUserContextValue}>
            {children}
        </UserContext.Provider>
    );
}