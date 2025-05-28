import { useEffect, useState } from "react"
import { PublicCreateOrder } from "@pawn-to-pawn/shared"
import { createOrder } from "../../api/orders.api"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { BackEndError } from "../../errors/BackEndError"
import { getProducts } from "../../api/products.api"
import { ProductReturn } from "@pawn-to-pawn/shared"

export function CreateOrder() {

    const orderEmbty = {
        id_product: "",
        quantity: 0
    } as PublicCreateOrder


    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false)
    const [products, setProducts] = useState<ProductReturn[] | null>(null)
    const [product, setProduct] = useState<ProductReturn | null>(null)
    const [newOrder, setNewOrder] = useState<PublicCreateOrder>(orderEmbty)
    const [error, setError] = useState<Error | null>(null)

    const createOrderMutation = useMutation({
        mutationKey: ['Create Order'],
        mutationFn: createOrder,
        onMutate: () => {
            setLoading(true);
            setError(null);
        },
        onSuccess: () => {
            setLoading(false)
            alert("Order created, got to show order page");
            navigate('/client/show-orders')
        },
        onError: (e) => {
            setLoading(false)
            setError(e)
        }
    })

    const getProductMutation = useMutation({
        mutationKey: ["Get Product"],
        mutationFn: getProducts,
        onError: (error) => {
            setError(error);
        },
        onSuccess: (response) => {
            setProducts(response.data)
        }
    })

    useEffect(() => {
        getProductMutation.mutate()
    }, [])

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProduct = products?.find(product => product.id === e.target.value)
        if (selectedProduct) {
            setProduct(selectedProduct)
            setNewOrder((prevNewOrder) => ({
                ...prevNewOrder,
                id_product: selectedProduct.id
            }))
        }
    }

    const handleChance = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewOrder((prevNewOrder) => ({
            ...prevNewOrder,
            [name]: parseInt(value)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createOrderMutation.mutate(newOrder)
    }

    return (
        <main>
            <h1>Create Order</h1>
            {error && <BackEndError inputError={error} />}
            <form>
                <label htmlFor="product">
                </label>
                <select name="product" id="product" onChange={handleSelect}>
                    <option value="">Select product..</option>
                    {
                        products && products.map((product) => {
                            return <option key={product.id} value={product.id}>{product.product_name}</option>
                        })
                    }
                </select>
                <label htmlFor="quantity"></label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newOrder.quantity}
                    onChange={handleChance}
                />
                <button onClick={handleSubmit}>
                    {loading ? "Loading.." : "Create"}
                </button>
            </form>
            {
                product &&
                <section>
                    <h2>{product.product_name}</h2>

                    <ul>
                        <li>Base: {product.base}</li>
                        <li>Cover: {product.cover}</li>
                        <li>Lenght: {product.length}m</li>
                        <li>Widht: {product.widht}mm</li>
                        <li>
                            Price: {
                                newOrder.quantity > 0 ?
                                    product.price * newOrder.quantity :
                                    product.price
                            }€
                        </li>
                    </ul>
                </section>
            }
        </main>
    )
}