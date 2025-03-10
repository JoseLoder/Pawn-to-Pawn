import { useContext } from "react";
import { ProfessionalContext } from "../../contexts/ProfessionalContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, modifyClient } from "../../api/clients";
import { Client } from "../../types/Clients";

export function EditClient() {
  // Get clients
  const clientListQuery = useQuery({
    queryKey: ["client"],
    queryFn: getClients,
  });

  const { data: clients, isLoading } = clientListQuery;

  // Modify client
  const queryClient = useQueryClient();

  const modifyClientMutation = useMutation({
    mutationKey: ["Modify Client"],
    mutationFn: modifyClient,
    onSettled: () => {
      //            clientListQuery.refetch(); Less performance than invalidateQueries
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = getClientContext();
      if (client) {
        modifyClientMutation.mutate(client);
      } else {
        console.error("Client is undefined");
      }
  };

  // Get client context
  const professionalClientContext = useContext(ProfessionalContext);
  if (!professionalClientContext) {
    throw new Error(
      "ProfessionalContext must be used within a ProfessionalProvider"
    );
  }
  const { setClientContext, getClientContext } = professionalClientContext;

  const clientContext = getClientContext();


  return isLoading ? (
    <p>Loading...</p>
  ) : (
    <form onSubmit={handleSubmit}>
      <label htmlFor="dni">DNI</label>
      <select
        id="dni"
        value={clientContext?.id ?? ""}
        onChange={(e) => {
          const selectedClient = clients.find(
            (client: Client) => client.id === e.target.value
          );
          if (selectedClient) {
            setClientContext(selectedClient);
          }
        }}
      >
        <option value="" disabled={!clientContext}>
          Seleccione un cliente
        </option>
        {clients.map((client: Client) => (
          <option key={client.id} value={client.id}>
            {client.dni}
          </option>
        ))}
      </select>
      <label htmlFor="name">Name</label>
      <input type="text" id="name" value={clientContext?.name} onChange={(e) => {setClientContext({...clientContext, name: e.target.value} as Client)}}/>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" value={clientContext?.email} onChange={(e) => {setClientContext({...clientContext, email: e.target.value} as Client)}}/>
      <label htmlFor="phone">Phone</label>
      <input type="text" id="phone" value={clientContext?.phone} onChange={(e) => {setClientContext({...clientContext, phone: e.target.value} as Client)}}/>
      <button>Modify</button>
    </form>
  );
}
