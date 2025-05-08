import { useEffect, useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { PreparationOrder } from "../../types/products.types";
import { useMutation } from "@tanstack/react-query";
import { getPreparationOrder } from "../../api/orders.api";

export function PreparationView() {

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [order, setOrder] = useState<PreparationOrder | null>(null)

    const getPreparationOrderMutation = useMutation({
        mutationKey: ['Get Preparation'],
        mutationFn: getPreparationOrder,
        onMutate: () => {
            setLoading(true)
        },
        onSuccess: (response) => {
            setOrder(response.data)
            setLoading(false)
        },
        onError: (error) => {
            setError(error)
            setLoading(false)
        }
    })

    useEffect(() => {
        getPreparationOrderMutation.mutate()
    }, [])

    return (
        <main>
            <h1>Order Preparation</h1>
            <section>
                {loading && <h2>Cargando..</h2>}
                <BackEndError inputError={error} />
                {order &&
                    <ul>
                        <li>Base: {order.base} </li>
                        <li>Amount base: {order.amount_base}</li>
                        <li>Cover: {order.cover}</li>
                        <li>Amount cover: {order.amount_cover}</li>
                        <li>Estimated time product: {order.estimated_time_product} </li>
                        <li>Estimated time order: {order.estimated_time_order}</li>
                        <li>Estimated weight product: {order.estimated_weight_product}</li>
                        <li>Estimated weight order: {order.estimated_weight_order}</li>
                    </ul>
                }
            </section>
        </main>
    )
}