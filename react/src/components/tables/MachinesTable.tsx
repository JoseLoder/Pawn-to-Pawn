import { Table } from "./base/Table";

import { Machine } from "@pawn-to-pawn/shared";

const columns = [
  {
    path: "name",
    name: "Name",
  },
  {
    path: "max_widht",
    name: "Maximum supported width (mm)",
    unit: "mm"
  },
  {
    path: "max_weight",
    name: "Maximum supported weight (g)",
    unit: "g"
  },
  {
    path: "max_velocity",
    name: "Maximum speed achievable (g/min)",
    unit: "g/min"
  },
  {
    path: "price",
    name: "Price per estimated kg weight (€/kg)",
    unit: "€/kg"
  }
];

export function MachinesTable({ machines }: Readonly<{ machines: Machine[] }>) {
  return (
    <Table columns={columns} items={machines}/>
  )
}