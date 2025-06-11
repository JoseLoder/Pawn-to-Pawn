import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { PreparationOrder } from "@pawn-to-pawn/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPreparationOrder, setCompleteOrder } from "../../api/orders.api";
import { AxiosResponse } from 'axios';
import { useNavigate } from "react-router";
import styled from "styled-components"

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
            alert('Good Job! Order set complete')
            navigate('/professional/show-orders')
        },
        onError: (error) => {
            setError(error)
        }
    })


    return (
        <>
            <StyledSection>
                <StyledHeader>Order Preparation</StyledHeader>
                {isLoading && <StyledLoading>Cargando..</StyledLoading>}
                <BackEndError inputError={fetchError || error} />
                {order &&
                    <StyledList>
                        <StyledListItem><strong>Base:</strong> {order.base} </StyledListItem>
                        <StyledListItem><strong>Amount base:</strong> {order.amount_base}</StyledListItem>
                        <StyledListItem><strong>Cover:</strong> {order.cover}</StyledListItem>
                        <StyledListItem><strong>Amount cover:</strong> {order.amount_cover}</StyledListItem>
                        <StyledListItem><strong>Estimated time product:</strong> {order.estimated_time_product} minutes </StyledListItem>
                        <StyledListItem><strong>Estimated time order:</strong> {order.estimated_time_order} minutes</StyledListItem>
                        <StyledListItem><strong>Estimated weight product:</strong> {order.estimated_weight_product / 1000} Kg</StyledListItem>
                        <StyledListItem><strong>Estimated weight order:</strong> {order.estimated_weight_order / 1000} Kg</StyledListItem>
                    </StyledList>
                }
                {order &&
                    <StyledButton onClick={() => {
                        if (order) {
                            setCompleteOrderMutation.mutate(order.id)
                        }
                    }}>
                        Set complete
                    </StyledButton>
                }
            </StyledSection>
        </>
    )
}


const StyledHeader = styled.h1`
    color: ${(props) => props.theme.accent12};
    font-size: 2.5em;
    text-align: center;
    border-bottom: 2px solid ${(props) => props.theme.accent6};
    padding-bottom: 15px;
`

const StyledSection = styled.section`
    background-color: ${(props) => props.theme.accent3};
    padding: 25px;
    border-radius: 8px;
    
    margin:30px;
`

const StyledLoading = styled.h2`
    color: ${(props) => props.theme.accent11};
    text-align: center;
    font-size: 1.5em;
    margin-top: 20px;
`

const StyledList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 20px;
`

const StyledListItem = styled.li`
    background-color: ${(props) => props.theme.accent4};
    color: ${(props) => props.theme.accent12};
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 6px;
    font-size: 1.1em;
    display: flex;
    align-items: center;

    strong {
        font-weight: bold;
        color: ${(props) => props.theme.accent11};
        margin-right: 10px;
    }

    &:last-child {
        margin-bottom: 0;
    }
`

const StyledButton = styled.button`
    background-color: ${(props) => props.theme.accent9};
    color: ${(props) => props.theme.accent1};
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-top: 20px;
    width: 100%;

    &:hover {
        background-color: ${(props) => props.theme.accent10};
    }
`