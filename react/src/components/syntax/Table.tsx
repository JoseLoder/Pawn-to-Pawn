import { Client } from "../../types/Clients";

interface TableProps {
  readonly clients: Client[];
}

export function Table({ clients }: TableProps) {
  const removeItem = () => {};

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
              <button onClick={removeItem}>Borrar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
