import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "@pawn-to-pawn/shared";
import { Table } from "./base/Table";
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
