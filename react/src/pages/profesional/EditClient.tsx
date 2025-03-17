import { useContext, useEffect } from "react";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ProfessionalContext } from "../../contexts/ProfessionalContext";
import { getClients, modifyClient } from "../../api/clients";
import { Client, RegisterClient } from "../../types/Clients";
import { clientSchema } from "../../schema/clients";

export function EditClient() {

  const navigate = useNavigate();
  const { 
    setValue,
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<RegisterClient>({resolver: zodResolver(clientSchema)})

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

    // Get client context
    const professionalClientContext = useContext(ProfessionalContext);
    if (!professionalClientContext) {
      throw new Error(
        "ProfessionalContext must be used within a ProfessionalProvider"
      );
    }
    const { setClientContext, getClientContext } = professionalClientContext;
  
    const clientContext = getClientContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setClientContext({
      ...clientContext,
      [name]: value
    } as Client);
  };

  const submitData = () => {
    const client = getClientContext();
    if (client) {
      modifyClientMutation.mutate(client);
    } else {
      console.log("Client is undefined");
    }
  };

  return isLoading ? (
    <p>Loading...</p>
  ) : (
    <form onSubmit={handleSubmit(submitData)}>

      <label htmlFor="dni">DNI</label>
      <select
        id="dni"
        value={clientContext.id ?? ""}
        onChange={(e) => {
          const selectedClient = clients?.data.find(
            (client: Client) => client.id === e.target.value
          );
          if (selectedClient) {
            setClientContext(selectedClient);
            setValue("dni", selectedClient.dni)
            setValue("email", selectedClient.email)
            setValue("name", selectedClient.name)
            setValue("phone", selectedClient.phone)
          }
        }}
      >

        <option value="" disabled={!clientContext}>
          Seleccione un cliente
        </option>
        {clients?.data.map((client: Client) => (
          <option 
            key={client.id}
            value={client.id}
            >
            {client.dni}
          </option>
        ))}
      </select>
      
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        {...register("name")}
        value={clientContext.name}
        onChange={handleChange}
      />
      {errors.name && <span>{errors.name.message}</span>}


      <label htmlFor="email">Email</label>
      <input
        type="text"
        id="email"
        {...register("email")}
        value={clientContext.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <label htmlFor="phone">Phone</label>
      <input
        type="text"
        id="phone"
        {...register("phone")}
        value={clientContext.phone}
        onChange={handleChange}
      />
      {errors.phone && <span>{errors.phone.message}</span>}

      <button>Modify</button>
    </form>
  );
}
