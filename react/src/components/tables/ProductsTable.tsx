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
    name: "Length",
  },
    {
    path: "widht",
    name: "Width",
  },
  {
    path: "estimated_time",
    name: "Estimated Time",
  },
  {
    path: "estimated_weight",
    name: "Estimated Weight",
  },
  {
    path: "price",
    name: "Price",
  }
];

export function ProductsTable({ products }: Readonly<{ products: ProductReturn[] }>) {
  return (
    <Table columns={columns} items={products}/>
  )
}
