import { useEffect, useState } from "react";
import { OrdersTable } from "../../components/tables/OrdersTable";
import { Actions } from "../../types/table.types";
import { useMutation } from "@tanstack/react-query";
import { setPendingOrder } from "../../api/orders.api";

export function ShowClientOrders() {
    const [actions, setActions] = useState<Actions[] | null>(null)

    const setPendingOrderMutation = useMutation({
        mutationKey: ['Set Pending Order'],
        mutationFn: setPendingOrder,
        onMutate: () => {

        },
        onSuccess: () => {
            alert('The order has been sent to make.')
        },
        onError: (error) => {
            alert("The order could not be send.")
            console.log(error)
        }
    })

    useEffect(() => {
        setActions([{
            name: 'Set Pending Order',
            action: (id) => {
                setPendingOrderMutation.mutate(id)
            },
        }])
    }, [])

    return (
        <main>
            <h1>Show Orders</h1>
            {actions && <OrdersTable tableFor="client" actions={actions} />}
        </main>
    )
}