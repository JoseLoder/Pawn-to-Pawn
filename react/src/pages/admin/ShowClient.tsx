//DEPRECATED

import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { ClientsTable } from "../../components/other/ClientsTable";
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

/*   useEffect(() => {
    //lanzamos un efecto cuando la variable isError cambia para redirigir al login
    if (isError) {
      if (error.name == "AxiosError") {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status == 401) {
          alert(axiosError.response.data); //Access unauthorized
          // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
          navigate("/login");
        } else if (axiosError.status == 400) {
          const errorMessage = (axiosError.response?.data as { message: string }).message;
          alert(errorMessage)
        }
      }
    }
  }, [isError]); */

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
