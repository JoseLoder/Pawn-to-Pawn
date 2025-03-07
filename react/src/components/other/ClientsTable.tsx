import { Client } from "../../types/Clients";
import { Table } from "../semantic/Table";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getClientsById, removeClient } from "../../api/clients";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { ProfessionalContext } from "../../contexts/ProfessionalContext";

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
  },
  {
    path: "actions",
    name: "Actions",
  },
];

export function ClientsTable({ clients }: Readonly<{ clients: Client[] }>) {
  // Remove client
  const queryClient = useQueryClient();

  const deleteClientMutation = useMutation({
    mutationKey: ["Delete Client"],
    mutationFn: removeClient,
    onSuccess: () => {
      alert("Client remove");
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // Compares the cache and re-triggers the client request
    },
  });

  // Get client by id, set in context and navigate to edit client
  const contextProffesionalProvider = useContext(ProfessionalContext);
  if (!contextProffesionalProvider) {
    throw new Error(
      "ProfessionalContext must be used within a ProfessionalProvider"
    );
  }
  const { handleSetClient } = contextProffesionalProvider;
  const navigate = useNavigate();

  const getClientMutation = useMutation({
    mutationKey: ["Get Client"],
    mutationFn: getClientsById,
    onSuccess: (client) => {
      handleSetClient(client);
      navigate("/professional/edit-client");
    },
  });

  // Desctructure clients and add actions
  const clientsWithActions = clients.map((client) => ({
    ...client,
    actions: [
      {
      name: "Delete",
      action: () => {
        deleteClientMutation.mutate(client.id);
      }
    },
    {
      name: "Edit",
      action: () => {
        getClientMutation.mutate(client.id);
      }
    }
    ],
  }));
  return <Table columns={columns} items={clientsWithActions} />;
}
