import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "../../types/Clients";
import { Table } from "../semantic/Table";
import { ascendUserToOperator } from "../../api/users.api";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";

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
    path: "role",
    name: "Role",
  },
  {
    path: "actions",
    name: "Actions",
  },
];

export function ClientsTable({ clients }: Readonly<{ clients: Client[] }>) {
/*   // Remove client
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
  const contextProfessionalProvider = useContext(ProfessionalContext);
  if (!contextProfessionalProvider) {
    throw new Error(
      "ProfessionalContext must be used within a ProfessionalProvider"
    );
  }
  const { setClientContext } = contextProfessionalProvider;
  const navigate = useNavigate();

  const getClientMutation = useMutation({
    mutationKey: ["Get Client"],
    mutationFn: getClientsById,
    onSuccess: (response) => {
      const client = response.data;
      setClientContext(client);
      navigate("/professional/edit-client");
    },
  });

  // Actions to be performed on the client
  const deleteClient = useCallback(
    (id: string) => {
      deleteClientMutation.mutate(id);
    },
    [deleteClientMutation]
  );

  const editClient = useCallback(
    (id: string) => {
      getClientMutation.mutate(id);
    },
    [getClientMutation]
  );

  // Create actions
  const actions = [
    {
      name: "Delete",
      action: (id: string) => {
        deleteClient(id);
      },
    },
    {
      name: "Edit",
      action: (id: string) => {
        editClient(id);
      },
    },
  ];
 */

  const [error, setError] = useState<Error | null>(null)
  const QueryClient = useQueryClient()
  const ascendUserToOperatorMutation = useMutation({
    mutationKey: ["Ascend User"],
    mutationFn: ascendUserToOperator,
    onError: (error) => {
      setError(error)
    },
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const ascendUser = (id:string) => {
    ascendUserToOperatorMutation.mutate(id)
  }

  const actions = [
    {
      name: "Ascend User",
      action: (id: string) => {
        ascendUser(id);
      },
    }]

  return (
    <>
    <BackEndError inputError={error}/>
    <Table columns={columns} items={clients} actions={actions}/>
    </>
  )
}
