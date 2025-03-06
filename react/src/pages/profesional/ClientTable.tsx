import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { Table } from "../../components/semantic/Table";
import { getClients } from "../../api/clients";

export function ClientTable() {
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
          <Table clients={clients} />
        </section>
      )}
    </>
  );
}
