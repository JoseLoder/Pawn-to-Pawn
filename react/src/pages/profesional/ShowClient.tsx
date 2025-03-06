import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { ClientsTable } from "../../components/other/ClientsTable";
import { getClients } from "../../api/clients";

export function ShowClient() {
  const clientListQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const { data: clients, isLoading } = clientListQuery;

  return (
    <>
      <button>
        <Link to="/professional">Back</Link>
      </button>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <section>
          <h3>Clients table</h3>
          <div>Result {clients.length} clients</div>
          <ClientsTable clients={clients}/>
        </section>
      )}
    </>
  );
}
