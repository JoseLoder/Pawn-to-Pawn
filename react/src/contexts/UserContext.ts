import { createContext } from "react";
import { PublicUser } from "../types/users.types";

export interface UserContextValue {
    getUserContext: () => PublicUser | undefined;
    setUserContext: (user: PublicUser | undefined) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);