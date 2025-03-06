import { createContext } from 'react';
import { Client } from '../types/Clients';

export interface ProfessionalContextValue {
  getClient: () => Client | undefined;
  handleSetClient: (client: Client) => void;
}

export const ProfessionalContext = createContext<ProfessionalContextValue | undefined>(undefined);