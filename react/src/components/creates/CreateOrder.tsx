import { useEffect, useState } from "react"
import { PublicCreateOrder } from "@pawn-to-pawn/shared"
import { createOrder } from "../../api/orders.api"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { BackEndError } from "../../errors/BackEndError"
import { getProducts } from "../../api/products.api"
import { ProductReturn } from "@pawn-to-pawn/shared"
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

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
        <>
        <LoginSection>
            <StyledH2>Create Order</StyledH2>
            <FormRoot onSubmit={handleSubmit}>
                <FormField name="product">
                    <FormLabel htmlFor="product">
                        Select Product
                    </FormLabel>
                    <Form.Control asChild>
                        <StyledSelect name="product" id="product" onChange={handleSelect} required>
                            <option value="">Select product..</option>
                            {
                                products && products.map((product) => {
                                    return <option key={product.id} value={product.id}>{product.product_name}</option>
                                })
                            }
                        </StyledSelect>
                    </Form.Control>
                    <FormMessage match="valueMissing">Please select a product</FormMessage>
                </FormField>
                <FormField name="quantity">
                    <FormLabel htmlFor="quantity">Quantity</FormLabel>
                    <Form.Control asChild>
                        <StyledInput
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={newOrder.quantity}
                            onChange={handleChance}
                            required
                        />
                    </Form.Control>
                    <FormMessage match="valueMissing">Please enter the quantity</FormMessage>
                    <FormMessage match={(value) => parseInt(value) <= 0}>
                        Quantity must be greater than 0
                    </FormMessage>
                </FormField>
                <Form.Submit asChild>
                    <StyledButton onClick={handleSubmit}>
                        {loading ? "Loading.." : "Create"}
                    </StyledButton>
                </Form.Submit>
            </FormRoot>
            {
                product &&
                <ProductDetailsSection>
                    <StyledH3>{product.product_name}</StyledH3>

                    <StyledProductList>
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
                    </StyledProductList>
                </ProductDetailsSection>
            }
        </LoginSection>
        {error && <BackEndError inputError={error} />}
        </>
    )
}

const FormRoot = styled(Form.Root)`
  flex: 1;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormField = styled(Form.Field)`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled(Form.Label)`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const StyledSelect = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
`;

const StyledButton = styled.button`
  background-color: ${(props) => props.theme.accent12};
  color: ${(props) => props.theme.accent1};
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:disabled {
    background-color: ${(props) => props.theme.accent6};
    cursor: not-allowed;
  }
`;

const LoginSection = styled.section`
  background-color: ${(props) => props.theme.accent4};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

const StyledH2 = styled.h2`
  color: ${(props) => props.theme.accent12};
  margin-bottom: 20px;
`;

const ProductDetailsSection = styled.section`
  background-color: ${(props) => props.theme.accent2};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
`;

const StyledH3 = styled.h3`
  color: ${(props) => props.theme.accent11};
  margin-bottom: 15px;
  text-align: center;
`;

const StyledProductList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    margin-bottom: 8px;
    color: ${(props) => props.theme.accent12};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const FormMessage = styled(Form.Message)`
  font-size: 12px;
  color: ${(props) => props.theme.danger1};
  margin-top: 5px;
`;