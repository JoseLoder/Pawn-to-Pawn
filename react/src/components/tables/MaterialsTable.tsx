import { Table } from "./base/Table";
import { Material } from "@pawn-to-pawn/shared";

const columns = [
  {
    path: "type",
    name: "Material type",
  },
  {
    path: "weight",
    name: "Weight per meter (g)",
    unit: "g"
  },
  {
    path: "price",
    name: "Price per meter (€/m)",
    unit: "€/m"
  }
];

export function MaterialsTable({ materials }: Readonly<{ materials: Material[] }>) {

  return (
    <Table columns={columns} items={materials}/>
  )
}