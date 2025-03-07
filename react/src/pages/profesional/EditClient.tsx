import { useContext } from "react"
import { ProfessionalContext } from "../../contexts/ProfessionalContext";
import { useQuery } from "@tanstack/react-query";
import { getClients } from "../../api/clients";
import { Client } from "../../types/Clients";

export function EditClient () {
    const clientListQuery = useQuery({
        queryKey: ['client'],
        queryFn: getClients
    });
    
    const { data: clients, isLoading } = clientListQuery;

    const professionalClientContext = useContext(ProfessionalContext)
    if (!professionalClientContext) {
        throw new Error("ProfessionalContext must be used within a ProfessionalProvider");
    }
    const { setClientContext, getClientContext } = professionalClientContext;

    const clientContext = getClientContext();

    return (
        isLoading ? (
            <p>Loading...</p>
        ) : (
        <form>
            <label htmlFor="dni">DNI</label>
            <select id="dni" value={clientContext?.id ?? ''} onChange={(e) => {
              const selectedClient = clients.find((client: Client) => client.id === e.target.value);
              if (selectedClient) {
                setClientContext(selectedClient);
              }
            }}>
              <option value="" disabled={!clientContext}>Seleccione un cliente</option>
              {clients.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.dni}
                </option>
              ))}
            </select>
            <label htmlFor="name">Name</label>
            <input type="text" id='name' value={clientContext?.name} />
            <label htmlFor="email">Email</label>
            <input type="text" id="email" value={clientContext?.email} />
            <label htmlFor="phone">Phone</label>
            <input type="text" id="phone" value={clientContext?.phone} />
            <button>Modify</button>
        </form>
        )
    )
}