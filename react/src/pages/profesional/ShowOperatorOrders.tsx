import { useEffect, useState } from "react";
import { OrdersTable } from "../../components/tables/OrdersTable";
import { Actions, AxiosErrorData } from "@pawn-to-pawn/shared";
import { useMutation } from "@tanstack/react-query";
import { setOrderToOperator } from "../../api/orders.api";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";

export function ShowOperatorOrders() {
    const navigate = useNavigate()
    const [actions, setActions] = useState<Actions[] | null>(null)

    const setOrderToOperatorMutation = useMutation({
        mutationKey: ["Set Order To Operator"],
        mutationFn: setOrderToOperator,
        onSuccess: () => {
            alert('The order has been assigned to the operator.')
            navigate('/professional/preparation')
        },
        onError: (error: AxiosError) => {
            const axiosError = error.response?.data as AxiosErrorData;   
            alert(axiosError.message)
        }
    })

    useEffect(() => {
        setActions([{
            name: 'Set Order',
            action: (id) => {
                setOrderToOperatorMutation.mutate(id)
            },
        }])
    }, [])

    return (
        <main>
            <h1>Show Orders</h1>
            {actions && <OrdersTable tableFor="operator" actions={actions} />}
        </main>
    )
}