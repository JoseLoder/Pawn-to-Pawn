import { Client } from "../../types/Clients";
import { Table } from "../semantic/Table";

/* import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getClientsById, removeClient } from "../../api/clients";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { ProfessionalContext } from "../../contexts/ProfessionalContext"; */

const columns = [
  {
    path: "name",
    name: "Name",
  },
  {
    path: "email",
    name: "Email",
  },
  {
    path: "phone",
    name: "Phone",
  }
]

export function ClientsTable({ clients }: Readonly<{ clients: Client[] }>) {
/* 
  const queryClient = useQueryClient() 
  const navigate = useNavigate()

  const deleteClientMutation = useMutation({
    mutationKey: ['Delete Client'],
    mutationFn: removeClient,
    onSuccess: () => {
      alert('Client remove')
      queryClient.invalidateQueries({ queryKey: ['clients'] }) // Compares the cache and re-triggers the client request
    }
  })

  const contextProffesionalProvider = useContext(ProfessionalContext)
  if (!contextProffesionalProvider) {
    throw new Error("ProfessionalContext must be used within a ProfessionalProvider")
  }
  const { handleSetClient } = contextProffesionalProvider

  const getClientMutation = useMutation({
    mutationKey: ['Get Client'],
    mutationFn: getClientsById,
    onSuccess: (client) => {
      handleSetClient(client)
      navigate('/professional/edit-client')
    }
  })

  const removeRow = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    deleteClientMutation.mutate(id)
  }
  const getClient = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    getClientMutation.mutate(id)
  } */

  return (

      <Table columns={columns} items={clients} />

  );
}
