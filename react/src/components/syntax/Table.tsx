import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Client } from "../../types/Clients";
import { removeClient } from "../../api/clients";

interface TableProps {
  readonly clients: Client[];
}

export function Table({ clients }: TableProps) {

  const queryClient = useQueryClient() 

  const deleteClientMutation = useMutation({
    mutationKey: ['Delete Client'],
    mutationFn: removeClient,
    onSuccess: () => {
      alert('Client remove')
      queryClient.invalidateQueries({ queryKey: ['clients'] }) // Compares the cache and re-triggers the client request
    }
  })

  const removeRow = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    deleteClientMutation.mutate(id)
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
