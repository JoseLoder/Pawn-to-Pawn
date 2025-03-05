import { useMutation } from '@tanstack/react-query'
import { createClient } from '../../api/clients'
import { RegisterClient } from '../../types/Clients'

/*
TODO: Use Zod to validate fields, control all errors and try use FormData
*/
export function AddClient() {

    const addClientMutation = useMutation({
        mutationKey: ['add Client'],
        mutationFn: createClient,
        onSuccess: () =>  {
            alert('Client Added')
            clearFields()
        }
    })
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
/*         const formData = new FormData(e.target as HTMLFormElement)
        const client = Object.fromEntries(formData) as Client */
        const client = getFields()
        addClientMutation.mutate(client)
    }

     const getFields = (): RegisterClient => {
        const dni = (document.getElementById('dni') as HTMLInputElement).value
        const name = (document.getElementById('name') as HTMLInputElement).value
        const email = (document.getElementById('email') as HTMLInputElement).value
        const phone = (document.getElementById('phone') as HTMLInputElement).value

        const client = {
            dni,
            name,
            email,
            phone
        }
        return client
    }
    const clearFields = () => {
        (document.getElementById('dni') as HTMLInputElement).value = ''
        ;(document.getElementById('name') as HTMLInputElement).value = ''
        ;(document.getElementById('email') as HTMLInputElement).value = ''
        ;(document.getElementById('phone') as HTMLInputElement).value = ''
    } 
       
    return (
        <div>
            <h1>Add Client</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="dni">DNI</label>
                    <input type="text" id="dni" />
                </div>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" />
                </div>
                <div>
                    <label htmlFor="phone">Phone</label>
                    <input type="text" id="phone" />
                </div>
                <button>Add</button>
            </form>
        </div>
    )
}