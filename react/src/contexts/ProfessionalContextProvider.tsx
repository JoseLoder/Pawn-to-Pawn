import { useState, ReactNode, useMemo, useCallback } from "react";
import { Client } from "../types/Clients";
import { ProfessionalContext } from "./ProfessionalContext";

interface ProfessionalContextProps {
    children: ReactNode;
}

export const ProfesionalContextProvider: React.FC<ProfessionalContextProps> = ({ children }) => {
    const [client, setClient] = useState<Client | undefined>(undefined);

    const handleSetClient = useCallback((client: Client) => {
        setClient(client);
    }, []);
    

    const getClient = useCallback(() => {
        return client;
    }, [client]);

    const memoizedProfessionalContextValue = useMemo(() => {
        return {
            getClient,
            handleSetClient,
        };
    }, [getClient, handleSetClient]);

    return (
        <ProfessionalContext.Provider value={ memoizedProfessionalContextValue }>
            {children}
        </ProfessionalContext.Provider>
    );
};