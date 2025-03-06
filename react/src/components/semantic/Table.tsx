import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Client } from "../../types/Clients";
import { getClientsById, removeClient } from "../../api/clients";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { ProfessionalContext } from "../../contexts/ProfessionalContext";


/* type Columns = {
  path: string,
  name: string,
}
interface IncomingStructureData {
  columns: Columns[],
  items: any[];
} */


interface TableProps {
  clients: Client[];
}

export function Table({clients}: Readonly<TableProps>/* { columns, items }: Readonly<IncomingStructureData> */) {

  const queryClient = useQueryClient() 
  const navigate = useNavigate()

  const deleteClientMutation = useMutation({
    mutationKey: ['Delete Client'],
    mutationFn: removeClient,
    onSuccess: () => {
      alert('Client remove')
      queryClient.invalidateQueries({ queryKey: ['clients'] }) // Compares the cache and re-triggers the client request
    }
  })

  const contextProffesionalProvider = useContext(ProfessionalContext)
  if (!contextProffesionalProvider) {
    throw new Error("ProfessionalContext must be used within a ProfessionalProvider")
  }
  const { handleSetClient } = contextProffesionalProvider

  const getClientMutation = useMutation({
    mutationKey: ['Get Client'],
    mutationFn: getClientsById,
    onSuccess: (client) => {
      handleSetClient(client)
      navigate('/professional/edit-client')
    }
  })

  const removeRow = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    deleteClientMutation.mutate(id)
  }
  const getClient = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    getClientMutation.mutate(id)
  }

  return (
    <table>
      <thead>
        <tr>
          {Object.keys(clients[0])
            .filter((key) => key !== "id" && key !== "dni")
            .map((key) => (
              <th key={key}>{key}</th>
            ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            {Object.entries(client)
              .filter(([key]) => key !== "id" && key !== "dni")
              .map(([key, value]) => (
                <td key={key}>{value}</td>
              ))}
            <td>
              <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {removeRow(e, client.id)}}>Borrar</button>
              <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {getClient(e, client.id)}}>Edit Client</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
