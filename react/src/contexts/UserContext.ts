import { createContext } from "react";
import { PublicUser } from "@pawn-to-pawn/shared";

export interface UserContextValue {
    getUserContext: () => PublicUser | undefined;
    setUserContext: (user: PublicUser | undefined) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);