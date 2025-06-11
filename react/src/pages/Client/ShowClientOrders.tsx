import { useEffect, useState } from "react";
import { OrdersTable } from "../../components/tables/OrdersTable";
import { Actions, AxiosErrorData } from "@pawn-to-pawn/shared";
import { useMutation } from "@tanstack/react-query";
import { setPendingOrder } from "../../api/orders.api";
import { AxiosError } from "axios";

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
        onError: (error: AxiosError) => {
            const axiosError = error.response?.data as AxiosErrorData;   
            alert(axiosError.message)
        }
    })

    useEffect(() => {
        setActions([{
            name: 'Set Pending Order',
            action: (id) => {
                if (confirm('Are you sure you want to send the order to be made? This action cannot be undone.')) {
                    setPendingOrderMutation.mutate(id)
                }
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