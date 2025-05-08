import { useEffect, useState } from "react"
import { User } from "../../types/users.types"
import { useMutation } from "@tanstack/react-query"
import { getMyUser } from "../../api/users.api"
import { BackEndError } from "../../errors/BackEndError"

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
        <main>
            <h1>My Profile</h1>
            <section>
                {loading && <h2>Cargando..</h2>}
                <BackEndError inputError={error} />
                {user &&
                    <ul>
                        <li>Name: {user.name} </li>
                        <li>Email: {user.email}</li>
                        <li>Identifier: {user.id_number}</li>
                        <li>Phone: {user.phone}</li>
                    </ul>
                }
            </section>
        </main>
    )
}