import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { ClientsTable } from "../../components/other/ClientsTable";
import { getClients } from "../../api/clients";
import { useEffect } from "react";
import { AxiosError } from "axios";

export function ShowClient() {

  const navigate = useNavigate()

  const clientListQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    
  });
  const { data: clients, isLoading, isError, error } = clientListQuery;

  useEffect(() => {
    if (isError) {
      if (error.name == 'AxiosError') {
        const errorAxios = error as AxiosError
        if (errorAxios.response?.status == 401){
          alert(errorAxios.message)
          navigate('/home/login')
        }
      }
    }
  }, [isError, error, navigate]);

  return (
    <>
      <button>
        <Link to="/professional">Back</Link>
      </button>
      {isLoading ? 
      (<div>Loading...</div>) :
      (
        isError ? 
        (<h1>Something has gone wrong</h1>) :
(      <section>
          <h3>Clients table</h3>
          <div>Result {clients.length} clients</div>
          <ClientsTable clients={clients}/>
        </section>)
        )
    }
    </>
  );
}
