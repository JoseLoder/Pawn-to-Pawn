import { useCallback, useEffect, useState } from "react";
import { Order } from "../../types/orders.type";
import { Table } from "../semantic/Table";
import { getMyOrders, getOrders, getPendingOrders } from "../../api/orders.api";
import { useMutation } from "@tanstack/react-query";
import { Columns, Items, TableFor } from "../../types/table.types";
import { BackEndError } from "../../errors/BackEndError";

const columns = [
    {
        id: "id_client",
        path: "name_client", //TODO: it needs to be returned by the API
        name: "Client"
    },
    {
        id: "id_product",
        path: "name_product", //TODO: it needs to be returned by the API
        name: "Product"
    },
    {
        id: "id_operator",
        path: "name_operator", //TODO: it needs to be returned by the API
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
        path: "createdAt",
        name: "Created At"
    },
    {
        path: "processingAt",
        name: "Processing At"
    },
    {
        path: "completedAt",
        name: "Completed At"

    }
] as Columns[]

export function OrdersTable({ tableFor }: { tableFor: TableFor }) {

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
            console.log(response.data);
            setItems(response.data);
        }
    })

    useEffect(() => {
        getOrderMutation.mutate()
    }, [tableFor])



    return (
        <section>
            {error && <BackEndError inputError={error} />}
            <Table columns={columns} items={items as Items[]}></Table>
        </section>
    )
} 