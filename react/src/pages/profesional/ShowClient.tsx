import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { ClientsTable } from "../../components/other/ClientsTable";
import { getClients } from "../../api/clients";
import { useEffect } from "react";
import { AxiosError } from "axios";

export function ShowClient() {
  const navigate = useNavigate();

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["clients"], 
    queryFn: getClients, 
    retry: false 
  });

  useEffect(() => {
    //lanzamos un efecto cuando la variable isError cambia para redirigir al login
    if (isError) {
      if (error.name == "AxiosError") {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status == 401) {
          alert(axiosError.response.data); //Access unauthorized
          // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
          navigate("/home/login");
        }else if (axiosError.status == 400) {
          const errorMessage = (axiosError.response?.data as { message: string }).message;
          alert(errorMessage)
      }
      }
    }
  }, [isError]);

  return (
    <>
      <button>
        <Link to="/professional">Back</Link>
      </button>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {isError ? (
            <h1>Something has gone wrong</h1>
          ) : (
            <section>
              <h3>Clients table</h3>
              <div>Result {clients?.data.length} clients</div>
              <ClientsTable clients={clients?.data} />
            </section>
          )}
        </>
      )}
    </>
  );
}
