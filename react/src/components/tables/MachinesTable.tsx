import { Table } from "./base/Table";

import { Machine } from "@pawn-to-pawn/shared";

const columns = [
  {
    path: "max_widht",
    name: "Maximum supported width",
  },
  {
    path: "max_weight",
    name: "Maximum supported weight",
  },
  {
    path: "max_velocity",
    name: "Maximum speed achievable",
  },
  {
    path: "price",
    name: "Price per minute of operation",
  }
];

export function MachinesTable({ machines }: Readonly<{ machines: Machine[] }>) {
  return (
    <Table columns={columns} items={machines}/>
  )
}