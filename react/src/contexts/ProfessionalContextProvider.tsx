import { useState, ReactNode, useMemo, useCallback } from "react";
import { Client } from "../types/Clients";
import { ProfessionalContext } from "./ProfessionalContext";

interface ProfessionalContextProps {
    children: ReactNode;
}

export const ProfesionalContextProvider: React.FC<ProfessionalContextProps> = ({ children }) => {
    const [client, setClient] = useState<Client | undefined>(undefined);

    const setClientContext = useCallback((client: Client) => {
        setClient(client);
    }, []);
    

    const getClientContext = useCallback(() => {
        return client;
    }, [client]);

    const memoizedProfessionalContextValue = useMemo(() => {
        return {
            getClientContext,
            setClientContext,
        };
    }, [getClientContext, setClientContext]);

    return (
        <ProfessionalContext.Provider value={ memoizedProfessionalContextValue }>
            {children}
        </ProfessionalContext.Provider>
    );
};