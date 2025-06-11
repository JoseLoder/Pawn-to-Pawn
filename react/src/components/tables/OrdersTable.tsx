import { useCallback, useEffect, useMemo } from "react";
import { Table } from "./base/Table";
import { getMyOrders, getOrders, getPendingOrders } from "../../api/orders.api";
import { useQuery } from "@tanstack/react-query";
import { Actions, Columns, Items, TableFor } from "@pawn-to-pawn/shared";
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

    const requestOrders = useCallback(() => {
        if (tableFor === "operator") {
            return getPendingOrders()
        }
        if (tableFor === "client") {
            return getMyOrders()
        }
        if (tableFor === "admin") {
            return getOrders()
        }
        throw new Error(`Invalid tableFor value: ${tableFor}`);
    }, [tableFor])

    const { data: response, error, isLoading } = useQuery({ 
        queryKey: ["orders", tableFor],
        queryFn: requestOrders,
    });

    const items = response?.data;

    useEffect(() => {
        if (columns.find(column => column.path === 'actions')) {
            return
        }
        if (actions && actions[0]) {
            columns.push({
                path: 'actions',
                name: 'Actions'
            })
        }
    }, [actions])

    return (
        <>
        {isLoading ? 
        <section>
            <p>Loading orders...</p> 
        </section> : 
        <Table columns={columns} items={items as Items[]} actions={actions}/>
        }
            {error && <BackEndError inputError={error} />}
        </>
    )
} 