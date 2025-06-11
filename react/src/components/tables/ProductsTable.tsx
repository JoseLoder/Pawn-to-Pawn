import { Table } from "./base/Table";

import { ProductReturn } from "@pawn-to-pawn/shared";

const columns = [
  {
    path: "product_name",
    name: "Product Name",
  },
  {
    path: "base",
    name: "Base",
  },
  {
    path: "cover",
    name: "Cover",
  },
  {
    path: "length",
    name: "Length (m)",
    unit: "m"
  },
    {
    path: "widht",
    name: "Width (mm)",
    unit: "mm"
  },
  {
    path: "estimated_time",
    name: "Estimated Time (min)",
    unit: "min"
  },
  {
    path: "estimated_weight",
    name: "Estimated Weight (g)",
    unit: "g"
  },
  {
    path: "price",
    name: "Price (€)",
    unit: "€"
  }
];

export function ProductsTable({ products }: Readonly<{ products: ProductReturn[] }>) {
  return (
    <Table columns={columns} items={products}/>
  )
}
