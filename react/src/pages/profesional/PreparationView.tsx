import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { PreparationOrder } from "@pawn-to-pawn/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPreparationOrder, setCompleteOrder } from "../../api/orders.api";
import { AxiosResponse } from 'axios';
import { useNavigate } from "react-router";

export function PreparationView() {

    const navigate = useNavigate()
    const [error, setError] = useState<Error | null>(null)

    const { data: order, isLoading, error: fetchError } = useQuery<AxiosResponse<PreparationOrder, any>, Error, PreparationOrder>({
        queryKey: ['Get Preparation'],
        queryFn: getPreparationOrder,
        select: (response) => response.data,
        retry: 1
    })
    const setCompleteOrderMutation = useMutation({
        mutationKey: ['Set Complete Order'],
        mutationFn: setCompleteOrder,
        onSuccess: () => {
            navigate('/professional/show-orders')
        },
        onError: (error) => {
            setError(error)
        }
    })


    return (
        <main>
            <h1>Order Preparation</h1>
            {isLoading && <h2>Cargando..</h2>}
            <BackEndError inputError={fetchError || error} />
            {order &&
                <section>
                    <ul>
                        <li>Base: {order.base} </li>
                        <li>Amount base: {order.amount_base}</li>
                        <li>Cover: {order.cover}</li>
                        <li>Amount cover: {order.amount_cover}</li>
                        <li>Estimated time product: {order.estimated_time_product} minutes </li>
                        <li>Estimated time order: {order.estimated_time_order} minutes</li>
                        <li>Estimated weight product: {order.estimated_weight_product / 1000} Kg</li>
                        <li>Estimated weight order: {order.estimated_weight_order / 1000} Kg</li>
                    </ul>

                    <button onClick={() => {
                        setCompleteOrderMutation.mutate(order.id)
                    }}>
                        Set complete
                    </button>
                </section>
            }
        </main>
    )
}