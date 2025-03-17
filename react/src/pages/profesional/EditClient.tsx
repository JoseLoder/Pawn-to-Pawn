import { useContext, useEffect } from "react";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { ProfessionalContext } from "../../contexts/ProfessionalContext";
import { getClients, modifyClient } from "../../api/clients";
import { Client } from "../../types/Clients";

export function EditClient() {
  const navigate = useNavigate();

  // Get clients
  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["client"],
    queryFn: getClients,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      if (error.name == "AxiosError") {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status == 401) {
          alert(axiosError.response.data); //Access unauthorized
          // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
          navigate("/home/login");
        } else if (axiosError.status == 400) {
          const errorMessage = (
            axiosError.response?.data as { message: string }
          ).message;
          alert(errorMessage);
        }
      }
    }
  }, [isError]);

  // Modify client

  const queryClient = useQueryClient();

  const modifyClientMutation = useMutation({
    mutationKey: ["Modify Client"],
    mutationFn: modifyClient,
    onSuccess: () => {
      alert("Successfully modified client");
    },
    onSettled: () => {
      // clientListQuery.refetch(); Less performance than invalidateQueries
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
    onError: (e) => {
      if (e.name === "AxiosError") {
        const axiosError = e as AxiosError;
        console.log(axiosError.response?.data);
        if (axiosError.status == 401) {
          alert(axiosError.response?.data); //Access not authorized
          // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
          navigate("/home/login");
        } else if (axiosError.status == 400) {
          const errorMessage = (
            axiosError.response?.data as { message: string }
          ).message;
          alert(errorMessage);
        }
      }
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
          const selectedClient = clients?.data.find(
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
        {clients?.data.map((client: Client) => (
          <option key={client.id} value={client.id}>
            {client.dni}
          </option>
        ))}
      </select>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        value={clientContext?.name}
        onChange={(e) => {
          setClientContext({
            ...clientContext,
            name: e.target.value,
          } as Client);
        }}
      />
      <label htmlFor="email">Email</label>
      <input
        type="text"
        id="email"
        value={clientContext?.email}
        onChange={(e) => {
          setClientContext({
            ...clientContext,
            email: e.target.value,
          } as Client);
        }}
      />
      <label htmlFor="phone">Phone</label>
      <input
        type="text"
        id="phone"
        value={clientContext?.phone}
        onChange={(e) => {
          setClientContext({
            ...clientContext,
            phone: e.target.value,
          } as Client);
        }}
      />
      <button>Modify</button>
    </form>
  );
}
