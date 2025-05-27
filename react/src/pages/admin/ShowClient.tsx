import { useQuery } from "@tanstack/react-query";

import { ClientsTable } from "../../components/tables/ClientsTable";
import { getUsers } from "../../api/users.api";
import { BackEndError } from "../../errors/BackEndError";

export function ShowClient() {

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: getUsers,
    retry: false
  });

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <BackEndError inputError={error} />
      ) : (
        <section>
          <h3>Clients table</h3>
          <div>Result {clients?.data?.length ?? 0} clients</div>
          <ClientsTable clients={clients?.data || []} />
        </section>
      )}
    </>
  );
}
