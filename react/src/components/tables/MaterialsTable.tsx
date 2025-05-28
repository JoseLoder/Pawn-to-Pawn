import { Table } from "./base/Table";
import { Material } from "@pawn-to-pawn/shared";

const columns = [
  {
    path: "type",
    name: "Material type",
  },
  {
    path: "weight",
    name: "Weight per meter",
  },
  {
    path: "price",
    name: "Price per meter",
  }
];

export function MaterialsTable({ materials }: Readonly<{ materials: Material[] }>) {

  return (
    <Table columns={columns} items={materials}/>
  )
}