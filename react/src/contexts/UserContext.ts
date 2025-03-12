import { createContext } from "react";
import { User } from "../types/Users";

export interface UserContextValue {
    getUserContext: () => User | undefined;
    setUserContext: (user: User) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);