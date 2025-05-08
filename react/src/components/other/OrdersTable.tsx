import { useCallback, useEffect, useState } from "react";
import { Order } from "../../types/orders.type";
import { Table } from "../semantic/Table";
import { getMyOrders, getOrders, getPendingOrders } from "../../api/orders.api";
import { useMutation } from "@tanstack/react-query";
import { Actions, Columns, Items, TableFor } from "../../types/table.types";
import { BackEndError } from "../../errors/BackEndError";

const columns = [
    {
        id: "id_client",
        path: "client_name",
        name: "Client"
    },
    {
        id: "id_product",
        path: "product_name",
        name: "Product"
    },
    {
        id: "id_operator",
        path: "operator_name",
        name: "Proffessional"
    },
    {
        path: "quantity",
        name: "Quantity"
    },
    {
        path: "price",
        name: "Price"
    }, {
        path: "status",
        name: "Status"
    },
    {
        path: "created_at",
        name: "Created At"
    },
    {
        path: "processing_at",
        name: "Processing At"
    },
    {
        path: "completed_at",
        name: "Completed At"

    }
] as Columns[]

export function OrdersTable({ tableFor, actions }: { tableFor: TableFor, actions?: Actions[] }) {

    const [items, setItems] = useState<Order[]>();
    const [error, setError] = useState<Error | null>(null);
    const requestOrders = useCallback(() => {
        if (tableFor === "operator") {
            return getPendingOrders
        }
        if (tableFor === "client") {
            return getMyOrders
        }
        if (tableFor === "admin") {
            return getOrders
        }
    }, [tableFor])

    const getOrderMutation = useMutation({
        mutationKey: ["Get Orders"],
        mutationFn: requestOrders(),
        onError: (error) => {
            setError(error);
        },
        onSuccess: (response) => {
            setItems(response.data);
        }
    })

    useEffect(() => {
        getOrderMutation.mutate()
        if (columns.find(column => column.path === 'actions')) {
            return
        }
        if (actions && actions[0]) {
            columns.push({
                path: 'actions',
                name: 'Actions'
            })
        }
    }, [])




    return (
        <section>
            {error && <BackEndError inputError={error} />}
            <Table columns={columns} items={items as Items[]} actions={actions}></Table>
        </section>
    )
} 