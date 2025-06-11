import { useEffect, useState } from "react"
import { User } from "@pawn-to-pawn/shared"
import { useMutation } from "@tanstack/react-query"
import { getMyUser } from "../../api/users.api"
import { BackEndError } from "../../errors/BackEndError"
import styled from "styled-components"

export function Profile() {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const getMyUserMutation = useMutation({
        mutationKey: ["Get My User"],
        mutationFn: getMyUser,
        onMutate: () => {
            setLoading(true)
        },
        onSuccess: (response) => {
            setLoading(false)
            setUser(response.data)
        },
        onError: (e) => {
            setError(e)
        }
    })

    useEffect(() => {
        getMyUserMutation.mutate()
    }, [])

    return (
        <>
            <StyledSection>
            <StyledHeader>My Profile</StyledHeader>
                {loading && <StyledLoading>Cargando..</StyledLoading>}
                {user &&
                    <StyledList>
                        <StyledListItem><strong>Name </strong> {user.name} </StyledListItem>
                        <StyledListItem><strong>Email </strong> {user.email}</StyledListItem>
                        <StyledListItem><strong>Identifier </strong> {user.id_number}</StyledListItem>
                        <StyledListItem><strong>Phone </strong> {user.phone}</StyledListItem>
                    </StyledList>
                }
            </StyledSection>
            {error && <BackEndError inputError={error} />}
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