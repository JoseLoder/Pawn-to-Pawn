import { createContext } from 'react';
import { Client } from '@pawn-to-pawn/shared';

export interface ProfessionalContextValue {
  getClientContext: () => Client;
  setClientContext: (client: Client) => void;
}

export const ProfessionalContext = createContext<ProfessionalContextValue | undefined>(undefined);