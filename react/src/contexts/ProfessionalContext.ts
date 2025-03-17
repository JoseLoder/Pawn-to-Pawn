import { createContext } from 'react';
import { Client } from '../types/Clients';

export interface ProfessionalContextValue {
  getClientContext: () => Client;
  setClientContext: (client: Client) => void;
}

export const ProfessionalContext = createContext<ProfessionalContextValue | undefined>(undefined);