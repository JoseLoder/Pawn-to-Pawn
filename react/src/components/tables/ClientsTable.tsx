import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicUser, AxiosErrorData } from "@pawn-to-pawn/shared";
import { Table } from "./base/Table";
import { ascendUserToOperator } from "../../api/users.api";
import { AxiosError } from "axios";

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

export function ClientsTable({ clients }: Readonly<{ clients: PublicUser[] }>) {

  const QueryClient = useQueryClient()
  const ascendUserToOperatorMutation = useMutation({
    mutationKey: ["Ascend User"],
    mutationFn: ascendUserToOperator,
    onError: (error: AxiosError) => {
      const axiosError = error.response?.data as AxiosErrorData;
      alert(axiosError.message)
    },
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const ascendUser = (id:string) => {
    if (confirm('Are you sure you want to ascend this user to operator?')) {
      ascendUserToOperatorMutation.mutate(id)
    }
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
      <Table columns={columns} items={clients} actions={actions}/>
    </>
  )
}
